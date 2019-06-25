// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import * as React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { createStructuredSelector } from 'reselect';
import type { Assets, Balances, Rates } from 'models/Asset';
import { BaseText } from 'components/Typography';
import { getBalance } from 'utils/assets';
import { formatMoney, getCurrencySymbol } from 'utils/common';
import { UIColors, baseColors, fontSizes } from 'utils/variables';
import { defaultFiatCurrency } from 'constants/assetsConstants';
import { accountBalancesSelector } from 'selectors/balances';

type Props = {
  assets: Assets,
  rates: Rates,
  balances: Balances,
  baseFiatCurrency: string,
  label?: string,
  style: Object,
};

class PortfolioBalance extends React.Component<Props, {}> {
  calculatePortfolioBalance(assets: Assets, rates: Rates, balances: Object) {
    // CLEANUP REQUIRED
    return Object
      .keys(assets)
      .map(key => assets[key])
      .map(({ symbol }) => {
        const assetRates = rates[symbol] || {};
        const balance = getBalance(balances, symbol);
        const assetFiatBalance = Object
          .keys(assetRates)
          .map(key => ({
            currency: key,
            total: assetRates[key] * (balance || 0),
          }));
        return assetFiatBalance;
      })
      .reduce((memo, item) => {
        return memo.concat(item);
      }, [])
      .reduce((memo, item) => {
        memo[item.currency] = (memo[item.currency] || 0) + item.total;
        return memo;
      }, {});
  }

  render() {
    const {
      style,
      assets,
      rates,
      balances,
      baseFiatCurrency,
      label,
    } = this.props;

    const portfolioBalances = this.calculatePortfolioBalance(assets, rates, balances);
    const fiatCurrency = baseFiatCurrency || defaultFiatCurrency;
    const portfolioBalance = formatMoney(portfolioBalances[fiatCurrency] || 0);
    const currencySymbol = getCurrencySymbol(fiatCurrency);

    return (
      <View style={style}>
        {!!label &&
        <BaseText style={{
          color: baseColors.darkGray,
          fontSize: fontSizes.small,
          paddingTop: 10,
        }}
        >
          {label}
        </BaseText>}
        <BaseText style={{
          color: UIColors.defaultTextColor,
          fontSize: fontSizes.extraExtraLarge,
        }}
        >
          {currencySymbol}{portfolioBalance}
        </BaseText>
      </View>
    );
  }
}

const mapStateToProps = ({
  assets: { data: assets },
  rates: { data: rates },
  appSettings: { data: { baseFiatCurrency } },
}) => ({
  rates,
  assets,
  baseFiatCurrency,
});

const structuredSelector = createStructuredSelector({
  balances: accountBalancesSelector,
});

const combinedMapStateToProps = (state) => ({
  ...structuredSelector(state),
  ...mapStateToProps(state),
});

export default connect(combinedMapStateToProps)(PortfolioBalance);
