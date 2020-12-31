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

import { createStackNavigator } from 'react-navigation';

// screens
import OceanMarketScreen from 'screens/OceanMarket';
import OceanMarketAssetScreen from 'screens/OceanMarket/OceanMarketAsset';
import OceanMarketAssetAddLiquidityScreen from 'screens/OceanMarket/OceanMarketAssetAddLiquidity';
import OceanMarketAssetRemoveLiquidityScreen from 'screens/OceanMarket/OceanMarketAssetRemoveLiquidity';
import OceanMarketAssetAddLiquidityReviewScreen from 'screens/OceanMarket/OceanMarketAssetAddLiquidityReview';
import OceanMarketAssetRemoveLiquidityReviewScreen from 'screens/OceanMarket/OceanMarketAssetRemoveLiquidityReview';
import SendTokenPinConfirmScreen from 'screens/SendToken/SendTokenPinConfirmScreen';
import SendTokenTransactionScreen from 'screens/SendToken/SendTokenTransaction';

// constants
import {
  OCEAN_MARKET,
  OCEAN_MARKET_ASSET,
  OCEAN_MARKET_ASSET_ADD_LIQUIDITY,
  OCEAN_MARKET_ASSET_REMOVE_LIQUIDITY,
  OCEAN_MARKET_ASSET_ADD_LIQUIDITY_REVIEW,
  SEND_TOKEN_PIN_CONFIRM,
  SEND_TOKEN_TRANSACTION, OCEAN_MARKET_ASSET_REMOVE_LIQUIDITY_REVIEW,
} from 'constants/navigationConstants';

import { hideTabNavigatorOnChildView, StackNavigatorConfig } from './configs';

const oceanMarketFlow = createStackNavigator(
  {
    [OCEAN_MARKET]: OceanMarketScreen,
    [OCEAN_MARKET_ASSET]: OceanMarketAssetScreen,
    [OCEAN_MARKET_ASSET_ADD_LIQUIDITY]: OceanMarketAssetAddLiquidityScreen,
    [OCEAN_MARKET_ASSET_REMOVE_LIQUIDITY]: OceanMarketAssetRemoveLiquidityScreen,
    [OCEAN_MARKET_ASSET_ADD_LIQUIDITY_REVIEW]: OceanMarketAssetAddLiquidityReviewScreen,
    [OCEAN_MARKET_ASSET_REMOVE_LIQUIDITY_REVIEW]: OceanMarketAssetRemoveLiquidityReviewScreen,
    [SEND_TOKEN_PIN_CONFIRM]: SendTokenPinConfirmScreen,
    [SEND_TOKEN_TRANSACTION]: SendTokenTransactionScreen,
  },
  StackNavigatorConfig,
);
oceanMarketFlow.navigationOptions = hideTabNavigatorOnChildView;

export default oceanMarketFlow;
