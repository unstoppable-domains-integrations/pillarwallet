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
import { CachedImage } from 'react-native-cached-image';
import t from 'translations/translate';

import type { NavigationScreenProp } from 'react-navigation';
import type { Theme } from 'models/Theme';

import { Wrapper } from 'components/Layout';
import { BaseText, MediumText } from 'components/Typography';
import Spinner from 'components/Spinner';
import { Row } from 'components/Grid';
import CircleButton from 'components/CircleButton';

import { fontSizes, fontStyles, spacing } from 'utils/variables';
import { images } from 'utils/images';
import { getTotalUserLiquidityInPool } from 'utils/oceanMarket';
import { formatFiat, formatMoney } from 'utils/common';
import { defaultFiatCurrency, OCEAN } from 'constants/assetsConstants';
import { OCEAN_MARKET_ASSET_ADD_LIQUIDITY, OCEAN_MARKET_ASSET_REMOVE_LIQUIDITY } from 'constants/navigationConstants';
import { getAccountSinglePoolShareAction } from 'actions/oceanMarketActions';
import { oceanTokenRateSelector } from 'selectors/oceanMarket';
import { baseFiatCurrencySelector } from 'selectors';

import type { SharesByDataAssetId } from 'models/OceanMarket';

type Props = {
  navigation: NavigationScreenProp<*>,
  theme: Theme,
  datasetPriceInFiat: string,
};

const { useEffect } = React;

const MainInfoWrapper = styled.View`
  padding: 38px ${spacing.layoutSides}px 40px;
  align-items: center;
`;

const DataSetImage = styled(CachedImage)`
  width: 64px;
  height: 64px;
  margin-bottom: 32px;
`;

const PriceText = styled(MediumText)`
  ${fontStyles.giant};
  text-align: center;
  margin: 0 6px;
`;

const PoolShareValue = styled(BaseText)`
  margin-bottom: 32px;
`;

const PoolSharesLabel = styled(MediumText)`
  text-transform: uppercase;
  font-size: 20px;
  line-height: 20px;
  margin-top: 12px;
`;

const OceanMarketAssetPoolView = (props: Props): React.Node => {
  const { navigation, theme, datasetPriceInFiat } = props;
  const asset = navigation.getParam('asset', {});
  const { oceanDataSet } = images(theme);

  const dispatch = useDispatch();

  const oceanPoolShares: SharesByDataAssetId = useSelector(({ oceanMarket }) => oceanMarket?.oceanPoolShares) || {};
  const fetchingOceanPoolSharesId: string = useSelector(({ oceanMarket }) => oceanMarket?.fetchingOceanPoolSharesId);
  const oceanRate: number = useSelector(oceanTokenRateSelector);
  const baseFiatCurrency: string = useSelector(baseFiatCurrencySelector) || defaultFiatCurrency;

  const thisPoolShares = oceanPoolShares[asset?.id]?.shares || 0;
  const thisPoolSharePercentage = (oceanPoolShares[asset?.id]?.sharesPercentage || 0).toFixed(5);

  const hasThisPoolShares = parseFloat(thisPoolShares) > 0;
  const isUpdatingThisPoolShares = fetchingOceanPoolSharesId === asset?.id;

  const totalUserLiquidityInOcean = getTotalUserLiquidityInPool(oceanPoolShares, asset);

  const totalUserLiquidityInOceanInFiat = Number(totalUserLiquidityInOcean) * oceanRate;
  const formattedTotalUserLiquidityInOceanInFiat = formatFiat(totalUserLiquidityInOceanInFiat, baseFiatCurrency);

  useEffect(() => {
    if (!asset || !asset.price?.address) return;
    dispatch(getAccountSinglePoolShareAction(asset.price.address, asset.id));
  }, [asset]);

  const goToAddLiquidity = () => {
    navigation.navigate(OCEAN_MARKET_ASSET_ADD_LIQUIDITY, { asset });
  };

  const goToRemoveLiquidity = () => {
    navigation.navigate(OCEAN_MARKET_ASSET_REMOVE_LIQUIDITY, { asset });
  };

  const renderPoolSharesValue = (): React.Node => {
    if (isUpdatingThisPoolShares) return (<Spinner size={20} trackWidth={2} />);
    if (hasThisPoolShares) {
      return (
        <Row wrap>
          <PriceText>{formatMoney(oceanPoolShares[asset?.id]?.shares, 4)}</PriceText>
          <PoolSharesLabel secondary>{t('oceanMarketContent.label.poolShares')}</PoolSharesLabel>
        </Row>
      );
    }
    return (<PriceText>{datasetPriceInFiat}</PriceText>);
  };

  const renderAdditionalValue = (): ?React.Node => {
    if (isUpdatingThisPoolShares) return null;
    if (hasThisPoolShares) {
      return (
        <BaseText secondary>
          {formattedTotalUserLiquidityInOceanInFiat}
        </BaseText>
      );
    }
    return (
      <BaseText secondary>
        {t('tokenValue', { value: formatMoney(asset?.price?.value || 0, 3), token: OCEAN })}
      </BaseText>
    );
  };

  return (
    <>
      <MainInfoWrapper>
        {!!hasThisPoolShares &&
        <PoolShareValue secondary>
          {t('oceanMarketContent.label.poolSharePercentage', { value: thisPoolSharePercentage })}
        </PoolShareValue>}
        <DataSetImage source={oceanDataSet} resizeMode="contain" />
        <BaseText secondary>
          {hasThisPoolShares
            ? t('oceanMarketContent.label.available')
            : t('oceanMarketContent.label.datasetPrice')}
        </BaseText>
        {renderPoolSharesValue()}
        {renderAdditionalValue()}
      </MainInfoWrapper>
      <Wrapper horizontal center>
        <CircleButton
          label={t('button.addLiquidity')}
          onPress={goToAddLiquidity}
          fontIcon="plus"
          fontIconStyle={{ fontSize: fontSizes.big }}
        />
        <CircleButton
          label={t('button.removeLiquidity')}
          onPress={goToRemoveLiquidity}
          fontIcon="minus"
          fontIconStyle={{ fontSize: fontSizes.big }}
          disabled={isUpdatingThisPoolShares || !hasThisPoolShares}
        />
      </Wrapper>
    </>
  );
};

export default OceanMarketAssetPoolView;
