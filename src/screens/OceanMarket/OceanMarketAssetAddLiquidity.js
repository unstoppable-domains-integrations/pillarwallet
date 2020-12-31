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
import styled, { withTheme } from 'styled-components/native';
import t from 'translations/translate';

import type { NavigationScreenProp } from 'react-navigation';
import type { Theme } from 'models/Theme';
import type { Asset } from 'models/Asset';

import ValueInput from 'components/ValueInput';
import Table, { TableLabel, TableRow } from 'components/Table';
import Button from 'components/Button';
import { BaseText } from 'components/Typography';
import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import { Container, ScrollWrapper, Spacing } from 'components/Layout';

import { OCEAN, OCEAN_MARKET_POOL_SHARE, OCEAN_TOKEN } from 'constants/assetsConstants';
import { OCEAN_MARKET_ASSET_ADD_LIQUIDITY_REVIEW } from 'constants/navigationConstants';

import oceanProtocolInstance from 'services/oceanProtocol';
import { getEnv } from 'configs/envConfig';
import { formatMoney } from 'utils/common';
import { images } from 'utils/images';
import { spacing } from 'utils/variables';

type Props = {
  navigation: NavigationScreenProp<*>,
  theme: Theme,
};

const Wrapper = styled.View`
  padding: 0 ${spacing.large}px ${spacing.large}px;
`;

const FormWrapper = styled.View`
  padding: 0 ${spacing.large}px 34px;
`;


const { useState, useEffect } = React;

const OceanMarketAssetAddLiquidity = (props: Props): React.Node => {
  const { navigation, theme } = props;

  const asset = navigation.getParam('asset', {});
  const assetPoolAddress = asset?.price?.address;
  const oceanTokenBalance = useSelector(({ oceanMarket }) => oceanMarket?.oceanTokenBalance);
  const supportedAssets: Asset[] = useSelector(({ assets: { supportedAssets: supAssets } }) => supAssets);

  const [oceanTokenValue, setOceanTokenValue] = useState<string>('');
  const [poolSharesValue, setPoolSharesValue] = useState<string>('0');
  const [poolSharesPercentage, setPoolSharesPercentage] = useState<string>('0');
  const [maxAddValue, setMaxAddValue] = useState<number>(0);
  const [totalPoolShares, setTotalPoolShares] = useState<number>(0);
  const [expectedPoolShare, setExpectedPoolShare] = useState<number>(0);
  const [liquidityTokens, setLiquidityTokens] = useState<(?Asset)[]>([]);
  const [selectedLiquidityToken, setSelectedLiquidityToken] = useState<?Asset>(null);
  const [isGettingMaxAddValue, setIsGettingMaxAddValue] = useState<boolean>(false);

  const { oceanDataSet } = images(theme);

  useEffect(() => {
    const oceanToken = supportedAssets.find(({ symbol }) => symbol === OCEAN) || {
      ...OCEAN_TOKEN,
      address: getEnv().OCEAN_ADDRESS,
    };
    setLiquidityTokens([oceanToken]);
    if (!selectedLiquidityToken) setSelectedLiquidityToken(oceanToken);
  }, [supportedAssets]);

  const addLiquidity = () => {
    const reviewInfo = {
      dataset: asset,
      oceanTokenValue,
      selectedLiquidityToken,
      poolSharesValue,
      totalPoolShares,
      expectedPoolShare,
    };
    navigation.navigate(OCEAN_MARKET_ASSET_ADD_LIQUIDITY_REVIEW, { reviewInfo });
  };

  useEffect(() => {
    const getMaxAddValue = async () => {
      const maxLiquidityValue =
        await oceanProtocolInstance.getMaxAddLiquidity(assetPoolAddress, getEnv().OCEAN_ADDRESS);
      const maxAllowedValue = Number(maxLiquidityValue) > Number(oceanTokenBalance)
        ? oceanTokenBalance
        : maxLiquidityValue;
      setMaxAddValue(maxAllowedValue);
    };
    getMaxAddValue();
  }, [asset]);

  useEffect(() => {
    const setPoolShares = async () => {
      if (oceanTokenValue && assetPoolAddress) {
        setIsGettingMaxAddValue(true);
        const newPoolShare = await oceanProtocolInstance.getExpectedPoolShare(
          assetPoolAddress, getEnv().OCEAN_ADDRESS, oceanTokenValue,
        );
        const totalPoolSharesSupply = await oceanProtocolInstance.getPoolSharesTotalSupply(assetPoolAddress);
        const formattedExpectedPoolShare = formatMoney(newPoolShare, 3);
        setPoolSharesValue(formattedExpectedPoolShare);
        const shareInPercentage = (newPoolShare && totalPoolSharesSupply &&
          (Number(newPoolShare) / (totalPoolSharesSupply + Number(newPoolShare))) * 100) || 0;
        const formattedShareInPercentage = shareInPercentage.toFixed(4);
        setPoolSharesPercentage(formattedShareInPercentage);
        setTotalPoolShares(totalPoolSharesSupply);
        setExpectedPoolShare(newPoolShare);
        setIsGettingMaxAddValue(false);
      } else {
        setPoolSharesValue('0');
        setPoolSharesPercentage('0');
        setTotalPoolShares(0);
        setExpectedPoolShare(0);
      }
    };

    setPoolShares();
  }, [assetPoolAddress, oceanTokenValue]);


  return (
    <ContainerWithHeader
      headerProps={{
        centerItems: [{ title: t('oceanMarketContent.title.addLiquidity') }],
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
            {!!liquidityTokens && selectedLiquidityToken &&
            <ValueInput
              assetData={selectedLiquidityToken}
              onAssetDataChange={setSelectedLiquidityToken}
              value={oceanTokenValue}
              onValueChange={setOceanTokenValue}
              customAssets={liquidityTokens}
              customBalances={{
                [OCEAN]: { balance: maxAddValue },
              }}
              disableSelector
            />}
            <Spacing h={54} />
            <ValueInput
              assetData={{
                id: OCEAN_MARKET_POOL_SHARE,
                name: asset?.dataTokenInfo?.name,
                symbol: OCEAN_MARKET_POOL_SHARE,
                imageUrl: oceanDataSet,
              }}
              value={poolSharesValue}
              onValueChange={setOceanTokenValue}
              customAssets={[]}
              hideMaxSend
              disabled
              hideLeftAddon
            />
          </FormWrapper>
          <Table>
            <TableRow>
              <TableLabel>{t('oceanMarketContent.label.exchangeRate')}</TableLabel>
              <BaseText regular>
                0
              </BaseText>
            </TableRow>
            <TableRow>
              <TableLabel>{t('oceanMarketContent.label.shareOfPool')}</TableLabel>
              <BaseText regular>{t('percentValue', { value: poolSharesPercentage })}</BaseText>
            </TableRow>
          </Table>
        </ScrollWrapper>
        <Wrapper>
          <Button
            title={t('button.next')}
            onPress={addLiquidity}
            disabled={!oceanTokenValue || isGettingMaxAddValue}
            isLoading={isGettingMaxAddValue}
          />
        </Wrapper>
      </Container>
    </ContainerWithHeader>
  );
};

export default withTheme(OceanMarketAssetAddLiquidity);
