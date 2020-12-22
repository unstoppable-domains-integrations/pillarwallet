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
import { withTheme } from 'styled-components/native';
import t from 'translations/translate';

import type { NavigationScreenProp } from 'react-navigation';
import type { Theme } from 'models/Theme';

import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import { Container } from 'components/Layout';

import Tabs from 'components/Tabs';
import { getDatasetMetadata } from 'utils/oceanMarket';
import { defaultFiatCurrency } from 'constants/assetsConstants';
import { formatFiat } from 'utils/common';
import { getAccountSinglePoolShareAction } from 'actions/oceanMarketActions';
import { oceanTokenRateSelector } from 'selectors/oceanMarket';
import { baseFiatCurrencySelector } from 'selectors';
import OceanMarketAssetBuyAndUseView from 'screens/OceanMarket/OceanMarketAssetBuyAndUseView';
import OceanMarketAssetPoolView from 'screens/OceanMarket/OceanMarketAssetPoolView';

type Props = {
  navigation: NavigationScreenProp<*>,
  theme: Theme,
};

const BUY_AND_USE = 'BUY_AND_USE';
const POOL = 'POOL';

const { useState, useEffect } = React;

const OceanMarketAssetScreen = (props: Props): React.Node => {
  const { navigation, theme } = props;
  const asset = navigation.getParam('asset', {});
  const { price } = asset;
  const { main: mainMetadata } = getDatasetMetadata(asset) || {};

  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState<string>(BUY_AND_USE);

  const oceanRate: number = useSelector(oceanTokenRateSelector);
  const baseFiatCurrency: string = useSelector(baseFiatCurrencySelector) || defaultFiatCurrency;

  const datasetPrice = price?.value || 0;
  const datasetPriceInFiat = Number(datasetPrice) * oceanRate;
  const formattedDatasetPriceInFiat = formatFiat(datasetPriceInFiat, baseFiatCurrency);

  useEffect(() => {
    if (!asset || !asset.price?.address) return;
    dispatch(getAccountSinglePoolShareAction(asset.price.address, asset.id));
  }, [asset]);

  const renderConsumeContent = (): React.Node => {
    if (activeTab === BUY_AND_USE) {
      return (
        <OceanMarketAssetBuyAndUseView
          datasetPriceInFiat={formattedDatasetPriceInFiat}
          navigation={navigation}
          theme={theme}
        />
      );
    }
    return (
      <OceanMarketAssetPoolView
        datasetPriceInFiat={formattedDatasetPriceInFiat}
        navigation={navigation}
        theme={theme}
      />
    );
  };

  const getTabs = () => {
    return [
      {
        id: BUY_AND_USE,
        key: BUY_AND_USE,
        name: t('oceanMarketContent.tabs.buyAndUse.title'),
        onPress: () => setActiveTab(BUY_AND_USE),
      },
      {
        id: POOL,
        key: POOL,
        name: t('oceanMarketContent.tabs.pool.title'),
        onPress: () => setActiveTab(POOL),
      },
    ];
  };

  return (
    <ContainerWithHeader
      headerProps={{
        centerItems: [{ title: mainMetadata?.name }],
      }}
    >
      <Container>
        <Tabs tabs={getTabs()} activeTab={activeTab} />
        {renderConsumeContent()}
      </Container>
    </ContainerWithHeader>
  );
};

export default withTheme(OceanMarketAssetScreen);
