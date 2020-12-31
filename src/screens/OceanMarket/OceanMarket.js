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
import { FlatList, RefreshControl, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import styled, { withTheme } from 'styled-components/native';
import { CachedImage } from 'react-native-cached-image';
import t from 'translations/translate';

import type { NavigationScreenProp } from 'react-navigation';
import type { Theme } from 'models/Theme';
import type { Asset } from 'models/Asset';
import type { OceanMarketAsset } from 'models/OceanMarket';

import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import Button from 'components/Button';
import { BaseText, MediumText } from 'components/Typography';
import {
  connectToOceanMarketAction,
  getTopOceanMarketAssetsAction,
  getAccountOceanTokenBalanceAction,
} from 'actions/oceanMarketActions';
import { EXCHANGE, OCEAN_MARKET_ASSET } from 'constants/navigationConstants';
import { defaultFiatCurrency, OCEAN, OCEAN_TOKEN } from 'constants/assetsConstants';
import ListItemWithImage from 'components/ListItem/ListItemWithImage';
import ShadowedCard from 'components/ShadowedCard';
import { fontStyles, lineHeights, spacing } from 'utils/variables';
import { getDatasetMetadata } from 'utils/oceanMarket';
import { images } from 'utils/images';
import { formatFiat, formatMoney } from 'utils/common';
import { oceanTokenRateSelector } from 'selectors/oceanMarket';
import { baseFiatCurrencySelector } from 'selectors';
import { getEnv } from 'configs/envConfig';

type Props = {
  navigation: NavigationScreenProp<*>,
  theme: Theme,
};

const { useEffect, useState } = React;

const OceanTokenInfoRow = styled.View`
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
`;

const TokenValueWrapper = styled.View`
  flex-direction: row;
  margin-bottom: 6px;
`;

const OceanTokenInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TokenValue = styled(BaseText)`
  font-size: 20px;
  line-height: 20px;
  margin-right: 4px;
`;

const Title = styled(MediumText)`
  ${fontStyles.big};
  padding: 0 ${spacing.layoutSides}px;
  margin-bottom: 14px;
`;

const OceanMarket = (props: Props): React.Node => {
  const { navigation, theme } = props;
  const dispatch = useDispatch();

  const marketAssets: (?OceanMarketAsset)[] = useSelector(({ oceanMarket }) => oceanMarket?.topOceanMarketAssets);
  const isUpdating: boolean = useSelector(({ oceanMarket }) =>
    oceanMarket?.isLoadingOceanMarketAssets ||
    oceanMarket?.isConnectingToOceanMarket ||
    oceanMarket?.isFetchingOceanTokenBalance,
  );
  const oceanTokenBalance: number = useSelector(({ oceanMarket }) => oceanMarket?.oceanTokenBalance);
  const oceanRate: number = useSelector(oceanTokenRateSelector);
  const baseFiatCurrency: string = useSelector(baseFiatCurrencySelector) || defaultFiatCurrency;
  const supportedAssets: Asset[] = useSelector(({ assets: { supportedAssets: supAssets } }) => supAssets);

  const [oceanBalanceInFiat, setOceanBalanceInFiat] = useState<number>(0);
  const [oceanToken, setOceanToken] = useState<?Asset>(null);

  useEffect(() => {
    const connectToOceanMarket = async () => {
      dispatch(getTopOceanMarketAssetsAction(true));
      await dispatch(connectToOceanMarketAction());
      dispatch(getAccountOceanTokenBalanceAction());
    };
    connectToOceanMarket();
  }, [dispatch]);

  useEffect(() => {
    const oceanBalanceFiatValue = oceanTokenBalance * oceanRate;
    setOceanBalanceInFiat(oceanBalanceFiatValue);
  }, [oceanTokenBalance, oceanRate]);

  useEffect(() => {
    const oceanTokenInfo = supportedAssets.find(({ symbol }) => symbol === OCEAN) || {
      ...OCEAN_TOKEN,
      address: getEnv().OCEAN_ADDRESS,
    };
    setOceanToken(oceanTokenInfo);
  }, [supportedAssets]);

  const renderDatasetItem = ({ item }: { item: OceanMarketAsset }) => {
    const { main: mainMetadata } = getDatasetMetadata(item) || {};
    const { oceanDataSet } = images(theme);
    const price = item?.price?.value || 0;
    const fiatValue = Number(price) * oceanRate;
    return (
      <ListItemWithImage
        onPress={() => navigation.navigate(OCEAN_MARKET_ASSET, { asset: item })}
        customLabel={(<MediumText big numberOfLines={1} ellipsizeMode="tail">{mainMetadata?.name}</MediumText>)}
        itemImageSource={oceanDataSet}
        itemValue={formatFiat(fiatValue, baseFiatCurrency)}
      />
    );
  };

  const renderOceanCard = (): React.Node => {
    const { genericToken } = images(theme);
    const oceanIconUri = oceanToken && oceanToken.iconUrl
      ? `${getEnv().SDK_PROVIDER}/${oceanToken.iconUrl}?size=3`
      : null;

    return (
      <>
        <Title>{t('oceanMarketContent.title.balance')}</Title>
        <ShadowedCard
          wrapperStyle={{ marginHorizontal: spacing.layoutSides, marginBottom: 35 }}
          upperContentWrapperStyle={{ padding: spacing.layoutSides }}
        >
          <OceanTokenInfoRow>
            <OceanTokenInfo>
              <CachedImage
                key={OCEAN}
                style={{
                  height: 48,
                  width: 48,
                  marginRight: 8,
                }}
                source={{ uri: oceanIconUri }}
                fallbackSource={genericToken}
                resizeMode="contain"
              />
              <View>
                <TokenValueWrapper>
                  <TokenValue>{formatMoney(oceanTokenBalance, 4)}</TokenValue>
                  <BaseText secondary>{OCEAN}</BaseText>
                </TokenValueWrapper>
                <BaseText secondary>{formatFiat(oceanBalanceInFiat, baseFiatCurrency)}</BaseText>
              </View>
            </OceanTokenInfo>
            <Button
              onPress={() => navigation.navigate(EXCHANGE, { toAssetCode: OCEAN })}
              title={t('button.buy')}
              small
              width="auto"
            />
          </OceanTokenInfoRow>
          <BaseText secondary lineHeight={lineHeights.regular}>
            {t('oceanMarketContent.paragraph.oceanTokenInfo')}
          </BaseText>
        </ShadowedCard>
        <Title>{t('oceanMarketContent.title.availableDatatasets')}</Title>
      </>
    );
  };

  return (
    <ContainerWithHeader
      headerProps={{
        centerItems: [{ title: t('oceanMarketContent.title.oceanMarketMain') }],
      }}
    >
      <FlatList
        data={marketAssets}
        extraData={oceanRate}
        keyExtractor={({ id }) => id}
        ListHeaderComponent={renderOceanCard}
        renderItem={renderDatasetItem}
        initialNumToRender={5}
        refreshControl={
          <RefreshControl
            refreshing={isUpdating}
            onRefresh={() => {
              dispatch(getAccountOceanTokenBalanceAction());
              dispatch(getTopOceanMarketAssetsAction(true));
            }}
          />
        }
        scrollEventThrottle={16}
        onEndReached={() => dispatch(getTopOceanMarketAssetsAction())}
        onEndReachedThreshold={0.2}
        contentContainerStyle={{ paddingTop: spacing.large }}
      />
    </ContainerWithHeader>
  );
};

export default withTheme(OceanMarket);
