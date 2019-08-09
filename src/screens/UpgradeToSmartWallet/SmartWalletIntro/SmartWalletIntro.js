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
import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { CachedImage } from 'react-native-cached-image';
// import { utils } from 'ethers';

import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import { ScrollWrapper, Wrapper } from 'components/Layout';
import { BoldText } from 'components/Typography';
import { ListItemChevron } from 'components/ListItem/ListItemChevron';
import { LabelBadge } from 'components/LabelBadge';

import { baseColors, fontSizes } from 'utils/variables';
import { responsiveSize } from 'utils/ui';
// import { formatAmount, getCurrencySymbol, getGasPriceWei } from 'utils/common';
// import { getRate } from 'utils/assets';

import { CHOOSE_ASSETS_TO_TRANSFER, EXCHANGE } from 'constants/navigationConstants';
import { defaultFiatCurrency } from 'constants/assetsConstants';

import { deploySmartWalletAction } from 'actions/smartWalletActions';
// import smartWalletService from 'services/smartWallet';


type Props = {
  navigation: NavigationScreenProp<*>,
  addNetwork: Function,
  baseFiatCurrency: ?string,
  deploySmartWallet: Function,
}
const CustomWrapper = styled.View`
  flex: 1;
  padding: 20px 55px 20px 46px;
`;

const Title = styled(BoldText)`
  color: ${baseColors.persianBlue};
  font-size: ${fontSizes.rJumbo}px;
  line-height: ${responsiveSize(62)}px;
`;

const BodyText = styled(BoldText)`
  color: ${baseColors.persianBlue};
  font-size: ${fontSizes.rMedium}px;
  line-height: ${responsiveSize(22)}px;
  margin-top: ${responsiveSize(26)}px;
`;

// const FeeText = styled(MediumText)`
//   color: ${baseColors.darkGray};
//   font-size: ${fontSizes.rMedium}px;
//   line-height: ${responsiveSize(22)}px;
//   margin-top: ${responsiveSize(16)}px;
// `;

const ActionsWrapper = styled(Wrapper)`
  margin: 30px 0 50px;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-top-width: ${StyleSheet.hairlineWidth}px;
  border-color: ${baseColors.mediumLightGray};
`;

const FeatureIcon = styled(CachedImage)`
  height: 124px;
  width: 124px;
  margin-bottom: 24px;
`;

const smartWalletIcon = require('assets/images/logo_smart_wallet.png');

class SmartWalletIntro extends React.PureComponent<Props> {
  render() {
    const {
      navigation,
      baseFiatCurrency,
      deploySmartWallet,
      // gasInfo,
      // rates,
    } = this.props;
    const isDeploy = navigation.getParam('deploy', false);

    // const fiatCurrency = baseFiatCurrency || defaultFiatCurrency;
    // const gasPriceWei = getGasPriceWei(gasInfo);
    // const deployEstimate = smartWalletService.getDeployEstimate(gasPriceWei);
    // const feeSmartContractDeployEth = formatAmount(utils.formatEther(deployEstimate));
    // const feeSmartContractDeployFiat = parseFloat(feeSmartContractDeployEth) * getRate(rates, ETH, fiatCurrency);
    // const fiatSymbol = getCurrencySymbol(fiatCurrency);
    //
    // const smartContractDeployFee =
    //   `~${feeSmartContractDeployEth} ETH (${fiatSymbol}${feeSmartContractDeployFiat.toFixed(2)})`;

    return (
      <ContainerWithHeader
        headerProps={{
          rightItems: [{ userIcon: true }],
          floating: true,
          transparent: true,
        }}
        backgroundColor={baseColors.zircon}
      >
        <ScrollWrapper contentContainerStyle={{ paddingTop: 80 }}>
          <CustomWrapper>
            <FeatureIcon source={smartWalletIcon} />
            <Title>
              Smart Wallet
            </Title>
            <BodyText>
              In order to enable sending assets from your Smart Wallet, it’s needed to deploy smart contract first.
              There is a small fee for that
            </BodyText>
            { /* <FeeText>{smartContractDeployFee}</FeeText> */ }
          </CustomWrapper>
          <ActionsWrapper>
            <ListItemChevron
              label="Buy ETH with credit card"
              onPress={() => {
                navigation.navigate(EXCHANGE, {
                  fromAssetCode: baseFiatCurrency || defaultFiatCurrency,
                  toAssetCode: 'ETH',
                });
              }}
              color={baseColors.persianBlue}
              bordered
              addon={(<LabelBadge label="NEW" />)}
            />
            <ListItemChevron
              label="Enable with ETH available"
              onPress={isDeploy
                ? () => deploySmartWallet()
                : () => navigation.navigate(CHOOSE_ASSETS_TO_TRANSFER)
              }
              color={baseColors.persianBlue}
              bordered
            />
            { /* <ListItemChevron
              label="Enable with PLR available"
              onPress={() => () => navigation.navigate(CHOOSE_ASSETS_TO_TRANSFER)}
              color={baseColors.persianBlue}
              bordered
            /> */ }
          </ActionsWrapper>
        </ScrollWrapper>
      </ContainerWithHeader>
    );
  }
}

const mapStateToProps = ({
  appSettings: { data: { baseFiatCurrency } },
  // history: { gasInfo },
  // rates: { data: rates },
}) => ({
  baseFiatCurrency,
  // gasInfo,
  // rates,
});


const mapDispatchToProps = (dispatch: Function) => ({
  deploySmartWallet: () => dispatch(deploySmartWalletAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SmartWalletIntro);
