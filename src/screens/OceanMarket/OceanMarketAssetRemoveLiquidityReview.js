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
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import { ScrollWrapper, Spacing } from 'components/Layout';
import TokenReviewSummary from 'components/ReviewSummary/TokenReviewSummary';

import t from 'translations/translate';
import { NavigationScreenProp } from 'react-navigation';
import { spacing } from 'utils/variables';
import Table, { TableAmount, TableFee, TableLabel, TableRow, TableTokenAndAmount } from 'components/Table';
import Button from 'components/Button';

import type { RootReducerState } from 'reducers/rootReducer';
import { OCEAN_PROTOCOL, OCEAN_MARKET_POOL_SHARE, OCEAN } from 'constants/assetsConstants';
import { SEND_TOKEN_PIN_CONFIRM } from 'constants/navigationConstants';
import { OCEAN_MARKET_TRANSACTION_TYPES } from 'constants/oceanMarketConstants';
import { getDatasetMetadata } from 'utils/oceanMarket';

type Props = {
  navigation: NavigationScreenProp<*>,
};

const Wrapper = styled.View`
  padding: 0 ${spacing.large}px ${spacing.large}px;
`;

const OceanMarketAssetRemoveLiquidityReview = (props: Props): React.Node => {
  const { navigation } = props;
  const {
    dataset,
    oceanTokenValue,
    poolSharesValue: poolShares,
    removeLiquidityTxPayload,
  } = navigation.getParam('reviewInfo', {});
  const { main: mainMetadata } = getDatasetMetadata(dataset) || {};

  const { feeInfo, isEstimating } =
    useSelector(({ transactionEstimate }: RootReducerState) => transactionEstimate);

  const removeLiquidity = async () => {
    navigation.navigate(SEND_TOKEN_PIN_CONFIRM, {
      transactionPayload: removeLiquidityTxPayload,
      transactionType: OCEAN_MARKET_TRANSACTION_TYPES.ADD_LIQUIDITY,
    });
  };

  return (
    <ContainerWithHeader
      headerProps={{
        centerItems: [{ title: t('oceanMarketContent.title.review') }],
      }}
    >
      <ScrollWrapper
        disableOnAndroid
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.large,
          paddingBottom: spacing.large,
        }}
      >
        <TokenReviewSummary
          assetSymbol={OCEAN_MARKET_POOL_SHARE}
          text={t('oceanMarketContent.label.liquidityRemoveReview', { asset: mainMetadata?.name })}
          amount={poolShares}
        />
        <Spacing h={28} />
        <Table title={t('oceanMarketContent.title.reviewReceive')}>
          <TableRow>
            <TableLabel>{OCEAN_PROTOCOL}</TableLabel>
            <TableTokenAndAmount
              amount={oceanTokenValue}
              token={OCEAN}
            />
          </TableRow>
        </Table>
        <Spacing h={28} />
        <Table title={t('transactions.label.fees')}>
          <TableRow>
            <TableLabel>{t('transactions.label.allowanceAndMaxEthFee')}</TableLabel>
            <TableFee txFeeInWei={feeInfo?.fee} gasToken={feeInfo?.gasToken} />
          </TableRow>
          <TableRow>
            <TableLabel>{t('transactions.label.pillarFee')}</TableLabel>
            <TableAmount amount={0} />
          </TableRow>
          <TableRow>
            <TableLabel>{t('transactions.label.maxTotalFee')}</TableLabel>
            <TableFee txFeeInWei={feeInfo?.fee} gasToken={feeInfo?.gasToken} />
          </TableRow>
        </Table>
      </ScrollWrapper>
      <Wrapper>
        <Button
          title={t('button.removeLiquidity')}
          onPress={removeLiquidity}
          isLoading={isEstimating}
          // disabled={!!errorMessage}
        />
      </Wrapper>
    </ContainerWithHeader>
  );
};

export default OceanMarketAssetRemoveLiquidityReview;
