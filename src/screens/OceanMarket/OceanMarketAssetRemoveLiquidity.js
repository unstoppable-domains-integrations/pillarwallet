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
import styled, { withTheme } from 'styled-components/native';
import debounce from 'lodash.debounce';
import t from 'translations/translate';

import type { NavigationScreenProp } from 'react-navigation';
import type { Theme } from 'models/Theme';
import type { Asset, AssetData } from 'models/Asset';

import ValueInput from 'components/ValueInput';
import Button from 'components/Button';
import { BaseText } from 'components/Typography';
import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import { Container, ScrollWrapper, Spacing } from 'components/Layout';
import ArrowIcon from 'components/ArrowIcon';
import { Row } from 'components/Grid';
import Switcher from 'components/Switcher';
import Toast from 'components/Toast';

import { defaultFiatCurrency, OCEAN, OCEAN_MARKET_POOL_SHARE, OCEAN_TOKEN } from 'constants/assetsConstants';
import { OCEAN_MARKET_ASSET_REMOVE_LIQUIDITY_REVIEW } from 'constants/navigationConstants';

import oceanProtocolInstance from 'services/oceanProtocol';
import { getEnv } from 'configs/envConfig';
import { formatFiat, formatMoney } from 'utils/common';
import { images } from 'utils/images';
import { spacing } from 'utils/variables';
import { oceanTokenRateByCurrencySelector, oceanTokenRateSelector } from 'selectors/oceanMarket';
import {
  getOceanMarketRemoveLiquidityTransaction,
  getTotalUserLiquidityInPool,
} from 'utils/oceanMarket';
import ValueInputHeader from 'components/ValueInput/ValueInputHeader';
import { baseFiatCurrencySelector } from 'selectors';
import FeeLabelToggle from 'components/FeeLabelToggle';
import type { RootReducerState } from 'reducers/rootReducer';
import { estimateTransactionAction } from 'actions/transactionEstimateActions';


type Props = {
  navigation: NavigationScreenProp<*>,
  theme: Theme,
};

const Wrapper = styled.View`
  padding: 0 ${spacing.large}px ${spacing.large}px;
  align-items: center;
`;

const FormWrapper = styled.View`
  padding: 0 ${spacing.large}px 34px;
  align-items: center;
`;

const SettingsRow = styled(Row)`
  width: 100%;
  justify-content: space-between;
  margin-top: 10px;
`;


const { useState, useEffect, useCallback } = React;

const OceanMarketAssetAddLiquidity = (props: Props): React.Node => {
  const dispatch = useDispatch();
  const { navigation, theme } = props;

  const asset = navigation.getParam('asset', {});
  const assetPoolAddress = asset?.price?.address;
  const oceanPoolShares = useSelector(({ oceanMarket }) => oceanMarket?.oceanPoolShares) || {};
  const oceanRate: number = useSelector(oceanTokenRateSelector);
  const oceanRates = useSelector(oceanTokenRateByCurrencySelector);
  const baseFiatCurrency: string = useSelector(baseFiatCurrencySelector) || defaultFiatCurrency;
  const oceanTokenBalance: number = useSelector(({ oceanMarket }) => oceanMarket?.oceanTokenBalance);
  const { feeInfo, isEstimating, errorMessage: txEstimationError } =
    useSelector(({ transactionEstimate }: RootReducerState) => transactionEstimate);
  const supportedAssets: Asset[] = useSelector(({ assets: { supportedAssets: supAssets } }) => supAssets);

  const [maxPoolShares, setMaxPoolShares] = useState<string>('');
  const [maxPoolSharesInFiat, setMaxPoolSharesInFiat] = useState<string>('');
  const [poolSharesValue, setPoolSharesValue] = useState<string>('');
  const [oceanTokenValue, setOceanTokenValue] = useState<string>('');
  const [datatokenValue, setDatatokenValue] = useState<string>('');
  const [getDataTokens, setGetDataTokens] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isFetchingExpectedValues, setIsFetchingExpectedValues] = useState<boolean>(false);
  const [removeLiquidityTxPayload, setRemoveLiquidityTxPayload] = useState<?Object>(null);

  const [liquidityToken, setLiquidityToken] = useState<?Asset>(null);

  const { oceanDataSet } = images(theme);

  const getExpectedTokenValuesDebounced = useCallback(
    debounce((poolSharesAmount, shouldGetDataTokens) => {
      setHasError(false);
      if (!poolSharesAmount) {
        setOceanTokenValue('');
        setDatatokenValue('');
        return;
      }
      setIsFetchingExpectedValues(true);
      oceanProtocolInstance.getRemoveLiquidityExpectedAssetsValue(
        assetPoolAddress,
        poolSharesAmount,
        shouldGetDataTokens,
      ).then((tokens) => {
        if (!tokens?.oceanAmount || (shouldGetDataTokens && !tokens?.dtAmount)) {
          Toast.show({
            message: t('toast.oceanPools.couldNotCalculateExpectedTokens'),
            emoji: 'hushed',
            supportLink: true,
            autoClose: true,
          });
          setHasError(true);
          setOceanTokenValue('');
          setDatatokenValue('');
        } else {
          const formattedOceanTokenValue = formatMoney(tokens?.oceanAmount ?? 0, 3);
          setOceanTokenValue(formattedOceanTokenValue);
          setDatatokenValue('');
          if (shouldGetDataTokens) {
            const formattedDataTokenValue = formatMoney(tokens?.dtAmount ?? 0, 3);
            setDatatokenValue(formattedDataTokenValue);
          }
        }
        setIsFetchingExpectedValues(false);
      }).catch(() => {
        Toast.show({
          message: t('toast.oceanPools.couldNotCalculateExpectedTokens'),
          emoji: 'hushed',
          supportLink: true,
          autoClose: true,
        });
        setHasError(true);
        setIsFetchingExpectedValues(false);
      });
    }, 600),
    [],
  );

  useEffect(() => {
    if (isFormValid && poolSharesValue && parseFloat(poolSharesValue) > 0) {
      getExpectedTokenValuesDebounced(poolSharesValue, getDataTokens);
    }
  }, [poolSharesValue, getDataTokens, isFormValid]);

  useEffect(() => {
    const totalUserLiquidityInOcean = getTotalUserLiquidityInPool(oceanPoolShares, asset);
    const totalUserLiquidityInOceanInFiat = Number(totalUserLiquidityInOcean) * oceanRate;
    const formattedTotalUserLiquidityInOceanInFiat = formatFiat(totalUserLiquidityInOceanInFiat, baseFiatCurrency);

    setMaxPoolShares(oceanPoolShares[asset?.id]?.shares);
    setMaxPoolSharesInFiat(formattedTotalUserLiquidityInOceanInFiat);
  }, [oceanPoolShares, asset]);

  useEffect(() => {
    const oceanToken = supportedAssets.find(({ symbol }) => symbol === OCEAN) || {
      ...OCEAN_TOKEN,
      address: getEnv().OCEAN_ADDRESS,
    };
    if (!liquidityToken) setLiquidityToken(oceanToken);
  }, [supportedAssets]);


  const estimateTransactionDebounced = useCallback(
    debounce((token, poolSharesAmount, oceanTokenAmount, datasetAsset) => {
      const removeLiquidityTx =
        getOceanMarketRemoveLiquidityTransaction(token, poolSharesAmount, oceanTokenAmount, datasetAsset);
      const { to, data, amount } = removeLiquidityTx;
      setRemoveLiquidityTxPayload(removeLiquidityTx);
      const {
        symbol,
        address,
        name,
        decimals,
      } = liquidityToken || {};
      const liquidityTokenAssetData: AssetData = {
        token: symbol,
        contractAddress: address,
        name,
        decimals,
      };
      dispatch(estimateTransactionAction(to, amount, data, liquidityTokenAssetData));
    }, 600),
    [],
  );

  useEffect(() => {
    if (!liquidityToken || !oceanTokenValue || !poolSharesValue || !asset || !isFormValid) {
      return;
    }
    estimateTransactionDebounced(liquidityToken, poolSharesValue, oceanTokenValue, asset);
  }, [liquidityToken, poolSharesValue, oceanTokenValue, asset, isFormValid]);

  const removeLiquidity = () => {
    const reviewInfo = {
      dataset: asset,
      oceanTokenValue,
      liquidityToken,
      poolSharesValue,
      removeLiquidityTxPayload,
    };
    navigation.navigate(OCEAN_MARKET_ASSET_REMOVE_LIQUIDITY_REVIEW, { reviewInfo });
  };

  return (
    <ContainerWithHeader
      headerProps={{
        centerItems: [{ title: t('oceanMarketContent.title.removeLiquidity') }],
      }}
    >
      <Container>
        <ScrollWrapper
          disableOnAndroid
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: spacing.large,
            paddingBottom: spacing.large,
          }}
        >
          <FormWrapper>
            <ValueInput
              assetData={{
                id: OCEAN_MARKET_POOL_SHARE,
                name: asset?.dataTokenInfo?.name,
                symbol: OCEAN_MARKET_POOL_SHARE,
                imageUrl: oceanDataSet,
              }}
              value={poolSharesValue}
              onValueChange={setPoolSharesValue}
              customAssets={[]}
              customBalances={{
                [OCEAN_MARKET_POOL_SHARE]: { balance: maxPoolShares },
              }}
              onFormValid={setIsFormValid}
              customHeader={(
                <ValueInputHeader
                  asset={{
                    id: OCEAN_MARKET_POOL_SHARE,
                    name: asset?.dataTokenInfo?.name,
                    symbol: OCEAN_MARKET_POOL_SHARE,
                    imageUrl: oceanDataSet,
                  }}
                  labelText={
                    `${t('tokenValue', {
                      token: OCEAN_MARKET_POOL_SHARE,
                      value: formatMoney(maxPoolShares, 3),
                    })} (${maxPoolSharesInFiat})`
                  }
                  onLabelPress={() => setPoolSharesValue(maxPoolShares.toString())}
                  disableAssetSelection
                />
              )}
            />
            <Spacing h={10} />
            <ArrowIcon />
            <Spacing h={20} />
            {liquidityToken &&
              <ValueInput
                assetData={liquidityToken}
                onAssetDataChange={setLiquidityToken}
                value={oceanTokenValue}
                customAssets={[liquidityToken]}
                customRates={{
                  [OCEAN]: oceanRates,
                }}
                customBalances={{
                  [OCEAN]: { balance: oceanTokenBalance },
                }}
                hideMaxSend
                disabled
              />
            }
            {!!getDataTokens &&
            <>
              <Spacing h={10} />
              <ArrowIcon />
              <Spacing h={20} />
              <ValueInput
                assetData={{
                  id: asset?.dataTokenInfo?.symbol,
                  name: asset?.dataTokenInfo?.name,
                  symbol: asset?.dataTokenInfo?.symbol,
                  imageUrl: oceanDataSet,
                }}
                value={datatokenValue}
                customAssets={[]}
                customRates={{
                  [asset?.dataTokenInfo?.symbol]: oceanRates,
                }}
                onAssetDataChange={setLiquidityToken}
                hideMaxSend
                disabled
              />
            </>}
            <SettingsRow>
              <BaseText>{t('oceanMarketContent.label.useOneAsset')}</BaseText>
              <Switcher
                onToggle={() => setGetDataTokens(!getDataTokens)}
                isOn={getDataTokens}
              />
            </SettingsRow>
          </FormWrapper>
        </ScrollWrapper>
        <Wrapper>
          {!isEstimating && feeInfo?.fee && <FeeLabelToggle
            txFeeInWei={feeInfo?.fee}
            gasToken={feeInfo?.gasToken}
            hasError={!!txEstimationError}
          />}
          <Spacing h={18} />
          <Button
            title={t('button.next')}
            onPress={removeLiquidity}
            disabled={!(isFormValid && parseFloat(poolSharesValue) > 0) || hasError || !!txEstimationError}
            isLoading={isFetchingExpectedValues || isEstimating}
          />
        </Wrapper>
      </Container>
    </ContainerWithHeader>
  );
};

export default withTheme(OceanMarketAssetAddLiquidity);
