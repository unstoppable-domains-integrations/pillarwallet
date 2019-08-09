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
import { Platform, RefreshControl, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { SDK_PROVIDER } from 'react-native-dotenv';
import { createStructuredSelector } from 'reselect';
import { withNavigation } from 'react-navigation';
import get from 'lodash.get';
import unionBy from 'lodash.unionby';

import { PPN_TOKEN } from 'configs/assetsConfig';

import TankBar from 'components/TankBar';
import CircleButton from 'components/CircleButton';
import ListItemWithImage from 'components/ListItem/ListItemWithImage';
import { BaseText, MediumText } from 'components/Typography';
import SlideModal from 'components/Modals/SlideModal';
import CheckPin from 'components/CheckPin';
import TankAssetBalance from 'components/TankAssetBalance';

import {
  addressesEqual,
  calculatePortfolioBalance,
  generatePMTToken,
  getPPNTokenAddress,
  getRate,
} from 'utils/assets';
import { delay, formatMoney, getCurrencySymbol } from 'utils/common';
import { baseColors, fontSizes, spacing } from 'utils/variables';

import { defaultFiatCurrency, ETH } from 'constants/assetsConstants';
import { FUND_TANK, SETTLE_BALANCE } from 'constants/navigationConstants';

import { activeAccountSelector } from 'selectors';
import {
  availableStakeSelector,
  paymentNetworkAccountBalancesSelector,
  paymentNetworkNonZeroBalancesSelector,
} from 'selectors/paymentNetwork';
import { accountBalancesSelector } from 'selectors/balances';
import type { Asset, Assets, Balances } from 'models/Asset';
import type { NavigationScreenProp } from 'react-navigation';

import { resetIncorrectPasswordAction } from 'actions/authActions';
import { ensureSmartAccountConnectedAction } from 'actions/smartWalletActions';

type Props = {
  baseFiatCurrency: string,
  assets: Assets,
  rates: Object,
  balances: Balances,
  paymentNetworkBalances: Balances,
  activeAccount: Object,
  navigation: NavigationScreenProp<*>,
  availableStake: number,
  supportedAssets: Asset[],
  assetsOnNetwork: Object,
  ensureSmartAccountConnected: Function,
  resetIncorrectPassword: Function,
}

type State = {
  topUpButtonSubmitted: boolean,
  showPinScreenForAction: string,
};

const AssetButtonsWrapper = styled.View`
  flex-direction: row;
  justify-content: center;
  padding: 20px 20px 40px;
  margin: 0;
`;

const ListHeaderWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: ${spacing.large}px;
`;

const HeaderTitle = styled(MediumText)`
  font-size: ${fontSizes.extraSmall}px;
  color: ${baseColors.blueYonder};
`;

const HeaderButton = styled.TouchableOpacity`
  background-color: ${props => props.disabled ? baseColors.lightGray : baseColors.electricBlue};
  border-radius: 3px;
  padding: 6px 12px;
`;

const ButtonText = styled(MediumText)`
  font-size: ${fontSizes.extraExtraSmall}px;
  color: ${props => props.disabled ? baseColors.darkGray : baseColors.white};
`;

const StyledFlatList = styled.FlatList`
  background-color: ${baseColors.white};
  border-top-color: ${baseColors.mediumLightGray};
  border-top-width: 1px;
`;

const Wrapper = styled.View`
  position: relative;
  margin: 5px 20px 20px;
  padding-top: ${Platform.select({
    ios: '20px',
    android: '14px',
  })};
`;

const AddonWrapper = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const BalanceWrapper = styled.View`
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100%;
`;

const ValueInFiat = styled(BaseText)`
  color: ${baseColors.coolGrey};
  font-size: ${fontSizes.extraExtraSmall}px;
`;

const iconRequest = require('assets/icons/icon_receive.png');
const iconSend = require('assets/icons/icon_send.png');
const genericToken = require('assets/images/tokens/genericToken.png');

class PPNView extends React.Component<Props, State> {
  initialAssets: Object[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topUpButtonSubmitted: false,
      showPinScreenForAction: '',
    };
    this.initialAssets = [{ balance: '0', symbol: ETH }, generatePMTToken()];
  }

  renderAsset = ({ item }) => {
    const { baseFiatCurrency, assets, rates } = this.props;

    let tokenSymbol = get(item, 'symbol', ETH);
    const tokenBalance = get(item, 'balance', '0');
    const tokenAddress = get(assets, `${tokenSymbol}.address`, '0');
    const ppnTokenAddress = getPPNTokenAddress(PPN_TOKEN, assets);
    const paymentNetworkBalanceFormatted = formatMoney(tokenBalance, 4);
    if (tokenSymbol !== ETH && addressesEqual(tokenAddress, ppnTokenAddress)) {
      tokenSymbol = PPN_TOKEN; // TODO: remove this once we move to PLR token in PPN
    }

    const assetInfo = {
      ...(assets[tokenSymbol] || {}),
      symbol: tokenSymbol,
      balance: tokenBalance,
      balanceFormatted: paymentNetworkBalanceFormatted,
      hash: item.hash,
      createdAt: item.createdAt,
    };

    const fullIconUrl = `${SDK_PROVIDER}/${assetInfo.iconUrl}?size=3`;
    const fiatCurrency = baseFiatCurrency || defaultFiatCurrency;
    const totalInFiat = tokenBalance * getRate(rates, assetInfo.symbol, fiatCurrency);
    const formattedAmountInFiat = formatMoney(totalInFiat);
    const currencySymbol = getCurrencySymbol(fiatCurrency);

    return (
      <ListItemWithImage
        label={assetInfo.name}
        itemImageUrl={fullIconUrl || genericToken}
        fallbackSource={genericToken}
        customAddon={
          <AddonWrapper>
            <BalanceWrapper>
              <TankAssetBalance amount={paymentNetworkBalanceFormatted} isSynthetic={assetInfo.symbol !== ETH} />
              <ValueInFiat>
                {`${currencySymbol} ${formattedAmountInFiat}`}
              </ValueInFiat>
            </BalanceWrapper>
          </AddonWrapper>
        }
        rightColumnInnerStyle={{ flexDirection: 'row' }}
      />
    );
  };

  renderHeader = () => {
    const {
      assetsOnNetwork,
      navigation,
      rates,
      baseFiatCurrency,
      balances,
    } = this.props;
    const portfolioBalances = calculatePortfolioBalance(assetsOnNetwork, rates, balances);
    const fiatCurrency = baseFiatCurrency || defaultFiatCurrency;
    const PPNBalance = formatMoney(portfolioBalances[fiatCurrency] || 0);
    const currencySymbol = getCurrencySymbol(fiatCurrency);

    return (
      <ListHeaderWrapper>
        <HeaderTitle>{`Balance ${currencySymbol} ${PPNBalance}`}</HeaderTitle>
        <HeaderButton
          onPress={() => navigation.navigate(SETTLE_BALANCE)}
          disabled={!Object.keys(assetsOnNetwork).length}
        >
          <ButtonText disabled={!Object.keys(assetsOnNetwork).length}>Settle</ButtonText>
        </HeaderButton>
      </ListHeaderWrapper>
    );
  };

  navigateToFundTankScreen = async (_: string, wallet: Object) => {
    const { ensureSmartAccountConnected, navigation } = this.props;
    this.setState({ showPinScreenForAction: '' });

    await delay(500);
    ensureSmartAccountConnected(wallet.privateKey)
      .then(() => {
        this.setState({ topUpButtonSubmitted: false }, () => navigation.navigate(FUND_TANK));
      })
      .catch(() => null);
  };

  handleCheckPinModalClose = () => {
    const { resetIncorrectPassword } = this.props;
    resetIncorrectPassword();
    this.setState({
      showPinScreenForAction: '',
      topUpButtonSubmitted: false,
    });
  };

  render() {
    const { showPinScreenForAction, topUpButtonSubmitted } = this.state;
    const {
      availableStake,
      assetsOnNetwork,
    } = this.props;

    const assetsOnNetworkArray = Object.keys(assetsOnNetwork).map((asset) => assetsOnNetwork[asset]);
    const totalStake = availableStake + 10;
    const availableFormattedAmount = formatMoney(availableStake, 4);
    const assetsOnNetworkToShow = unionBy(assetsOnNetworkArray, this.initialAssets, 'symbol');

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
          />
        }
      >
        <TankBar
          maxValue={totalStake}
          currentValue={availableStake}
          currentValueFormatted={availableFormattedAmount}
          topupAction={() => this.setState({ showPinScreenForAction: FUND_TANK, topUpButtonSubmitted: true })}
          topUpLoading={topUpButtonSubmitted}
        />
        <AssetButtonsWrapper>
          <CircleButton
            label="Request"
            icon={iconRequest}
            onPress={() => {}}
          />
          <CircleButton
            label="Send"
            icon={iconSend}
            onPress={() => {}}
          />
        </AssetButtonsWrapper>
        <StyledFlatList
          data={assetsOnNetworkToShow}
          keyExtractor={(item) => item.symbol}
          renderItem={this.renderAsset}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          onEndReachedThreshold={0.5}
          style={{ width: '100%', height: '100%' }}
          ListHeaderComponent={this.renderHeader}
        />
        <SlideModal
          isVisible={!!showPinScreenForAction}
          onModalHide={this.handleCheckPinModalClose}
          title="Enter pincode"
          centerTitle
          fullScreen
          showHeader
        >
          <Wrapper flex={1}>
            <CheckPin
              onPinValid={this.navigateToFundTankScreen}
            />
          </Wrapper>
        </SlideModal>
      </ScrollView>
    );
  }
}

const mapStateToProps = ({
  assets: { data: assets, supportedAssets },
  rates: { data: rates },
  appSettings: { data: { baseFiatCurrency, appearanceSettings: { assetsLayout } } },
}) => ({
  assets,
  rates,
  baseFiatCurrency,
  assetsLayout,
  supportedAssets,
});

const structuredSelector = createStructuredSelector({
  balances: accountBalancesSelector,
  paymentNetworkBalances: paymentNetworkAccountBalancesSelector,
  assetsOnNetwork: paymentNetworkNonZeroBalancesSelector,
  availableStake: availableStakeSelector,
  activeAccount: activeAccountSelector,
});

const combinedMapStateToProps = (state) => ({
  ...structuredSelector(state),
  ...mapStateToProps(state),
});

const mapDispatchToProps = (dispatch) => ({
  ensureSmartAccountConnected: (privateKey: string) => dispatch(ensureSmartAccountConnectedAction(privateKey)),
  resetIncorrectPassword: () => dispatch(resetIncorrectPasswordAction()),
});

export default withNavigation(connect(combinedMapStateToProps, mapDispatchToProps)(PPNView));
