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

import { BaseText, MediumText } from 'components/Typography';

import CircleButton from 'components/CircleButton';
import { fontSizes, fontStyles, spacing } from 'utils/variables';
import { images } from 'utils/images';
import { OCEAN } from 'constants/assetsConstants';
import { formatMoney } from 'utils/common';
import { getAccountSinglePoolShareAction } from 'actions/oceanMarketActions';

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

const OceanMarketAssetBuyAndUseView = (props: Props): React.Node => {
  const { navigation, theme, datasetPriceInFiat } = props;
  const asset = navigation.getParam('asset', {});
  const { oceanDataSet } = images(theme);

  const dispatch = useDispatch();

  const oceanTokenBalance = useSelector(({ oceanMarket }) => oceanMarket?.oceanTokenBalance) || 0;
  const hasEnoughOceanToBuy = oceanTokenBalance && oceanTokenBalance >= asset?.price?.value;

  useEffect(() => {
    if (!asset || !asset.price?.address) return;
    dispatch(getAccountSinglePoolShareAction(asset.price.address, asset.id));
  }, [asset]);

  return (
    <>
      <MainInfoWrapper>
        <DataSetImage source={oceanDataSet} resizeMode="contain" />
        <BaseText secondary>{t('oceanMarketContent.label.datasetPrice')}</BaseText>
        <PriceText>{datasetPriceInFiat}</PriceText>
        <BaseText secondary>
          {t('tokenValue', { value: formatMoney(asset?.price?.value || 0, 3), token: OCEAN })}
        </BaseText>
      </MainInfoWrapper>
      <CircleButton
        label={t('button.buyDataset')}
        onPress={() => {}}
        fontIcon="up-arrow"
        fontIconStyle={{ fontSize: fontSizes.big, transform: [{ rotate: '180deg' }] }}
        disabled={!hasEnoughOceanToBuy}
      />
    </>
  );
};

export default OceanMarketAssetBuyAndUseView;
