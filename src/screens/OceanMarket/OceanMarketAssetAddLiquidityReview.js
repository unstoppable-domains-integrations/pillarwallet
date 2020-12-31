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
import { useDispatch, useSelector } from 'react-redux';
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
import { OCEAN, OCEAN_PROTOCOL, OCEAN_MARKET_POOL_SHARE } from 'constants/assetsConstants';
import { estimateTransactionAction } from 'actions/transactionEstimateActions';
import { oceanTokenRateSelector } from 'selectors/oceanMarket';
import { SEND_TOKEN_PIN_CONFIRM } from 'constants/navigationConstants';
import { OCEAN_MARKET_TRANSACTION_TYPES } from 'constants/oceanMarketConstants';
import {
  getOceanMarketAddLiquidityAllowanceTransaction,
  getOceanMarketAddLiquidityTransaction,
} from 'utils/oceanMarket';

type Props = {
  navigation: NavigationScreenProp<*>,
};

const Wrapper = styled.View`
  padding: 0 ${spacing.large}px ${spacing.large}px;
`;

const { useState, useEffect } = React;

const OceanMarketAssetAddLiquidityReview = (props: Props): React.Node => {
  const { navigation } = props;
  const dispatch = useDispatch();

  const {
    dataset,
    oceanTokenValue: value,
    selectedLiquidityToken,
    poolSharesValue: poolShares,
    totalPoolShares,
    expectedPoolShare,
  } = navigation.getParam('reviewInfo', {});
  const { price } = dataset;
  const { feeInfo, isEstimating, errorMessage } =
    useSelector(({ transactionEstimate }: RootReducerState) => transactionEstimate);
  const oceanRate: number = useSelector(oceanTokenRateSelector);

  const addLiquidity = async () => {
    const allowanceTx = getOceanMarketAddLiquidityAllowanceTransaction(value, dataset);
    const addLiquidityTx = getOceanMarketAddLiquidityTransaction(selectedLiquidityToken, value, dataset);

    const transactionPayload = {
      ...allowanceTx,
      sequentialSmartWalletTransactions: [addLiquidityTx],
    };

    navigation.navigate(SEND_TOKEN_PIN_CONFIRM, {
      transactionPayload,
      transactionType: OCEAN_MARKET_TRANSACTION_TYPES.ADD_LIQUIDITY,
    });
  };

  const [poolOcean, setPoolOcean] = useState<number>(0);
  const [poolDataToken, setPoolDataToken] = useState<number>(0);
  const [poolDataTokenInFiat, setPoolDataTokenInFiat] = useState<number>(0);
  const [poolSharesInFiat, setPoolSharesInFiat] = useState<number>(0);

  useEffect(() => {
    const allowanceTx = getOceanMarketAddLiquidityAllowanceTransaction(value, dataset);
    const addLiquidityTx = getOceanMarketAddLiquidityTransaction(selectedLiquidityToken, value, dataset);
    dispatch(estimateTransactionAction(
      allowanceTx.to,
      allowanceTx.amount,
      allowanceTx.data,
      null,
      [{
        recipient: addLiquidityTx.to,
        value: addLiquidityTx.amount,
        data: addLiquidityTx.data,
      }],
    ));
  }, [value, dataset]);

  useEffect(() => {
    if (!value || !price || !totalPoolShares) return;

    const newPoolSupply = totalPoolShares + expectedPoolShare;
    const ratio = expectedPoolShare / newPoolSupply;
    const newOceanReserve = selectedLiquidityToken?.symbol === OCEAN
      ? price.ocean + Number(value)
      : price.ocean;
    const newDataTokenReserve = selectedLiquidityToken?.symbol === OCEAN
      ? price?.datatoken
      : price?.datatoken + Number(value);
    const poolOceanValue = newOceanReserve * ratio;
    const poolDataTokenValue = newDataTokenReserve * ratio;
    const poolDataTokenFiatValue = poolDataTokenValue * price?.value * oceanRate;
    const poolSharesFiatValue = value * oceanRate;
    setPoolOcean(poolOceanValue);
    setPoolDataToken(poolDataTokenValue);
    setPoolSharesInFiat(poolSharesFiatValue);

    setPoolDataTokenInFiat(poolDataTokenFiatValue);
  }, [value, price, totalPoolShares, expectedPoolShare]);

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
          assetSymbol={selectedLiquidityToken.symbol}
          text={t('oceanMarketContent.label.liquidityAddReview')}
          amount={value}
        />
        <Spacing h={28} />
        <Table title={t('oceanMarketContent.title.reviewReceive')}>
          <TableRow>
            <TableLabel>{t('oceanMarketContent.label.poolShares')}</TableLabel>
            <TableTokenAndAmount
              amount={poolShares}
              token={OCEAN_MARKET_POOL_SHARE}
              customFiatValue={poolSharesInFiat}
            />
          </TableRow>
        </Table>
        <Spacing h={28} />
        <Table title={t('oceanMarketContent.title.reviewTokenAllocation')}>
          <TableRow>
            <TableLabel>{OCEAN_PROTOCOL}</TableLabel>
            <TableTokenAndAmount amount={poolOcean} token={OCEAN} />
          </TableRow>
          <TableRow>
            <TableLabel>{dataset?.dataTokenInfo?.name}</TableLabel>
            <TableTokenAndAmount
              amount={poolDataToken}
              token={dataset?.dataTokenInfo?.symbol}
              customFiatValue={poolDataTokenInFiat}
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
          title={t('button.addLiquidity')}
          onPress={addLiquidity}
          isLoading={isEstimating}
          disabled={!!errorMessage}
        />
      </Wrapper>
    </ContainerWithHeader>
  );
};

export default OceanMarketAssetAddLiquidityReview;
