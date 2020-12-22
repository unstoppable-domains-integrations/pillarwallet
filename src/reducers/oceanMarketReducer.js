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
import { OCEAN_MARKET_ACTIONS } from 'constants/oceanMarketConstants';
import type { OceanMarketAsset, SharesByDataAssetId } from 'models/OceanMarket';

export type OceanMarketReducerState = {|
  isConnectingToOceanMarket: boolean,
  topOceanMarketAssets: (?OceanMarketAsset)[],
  nextTopOceanMarketAssetsPage: ?number,
  isLoadingOceanMarketAssets: boolean,
  oceanTokenBalance: number,
  isFetchingOceanTokenBalance: boolean,
  fetchingOceanPoolSharesId: ?string,
  oceanPoolShares: ?SharesByDataAssetId,
|};

type StartConnectingToOceanMarket = {|
  type: 'SET_IS_CONNECTED_TO_OCEAN_MARKET',
|};

type SetConnectedToOceanMarket = {|
  type: 'SET_CONNECTED_TO_OCEAN_MARKET',
|};

type SetConnectedToOceanMarketError = {|
  type: 'SET_CONNECTED_TO_OCEAN_MARKET_ERROR',
|};

type StartAddingOceanMarketAssets = {|
  type: 'START_ADDING_OCEAN_MARKET_ASSETS',
|};

type SetOceanMarketAssets = {|
  type: 'SET_OCEAN_MARKET_ASSETS',
  payload: {
    assets: (?OceanMarketAsset)[],
    nextPage: ?number,
  },
|};

type AppendOceanMarketAssets = {|
  type: 'APPEND_OCEAN_MARKET_ASSETS',
  payload: {
    assets: (?OceanMarketAsset)[],
    nextPage: ?number,
  },
|};

type AddOceanMarketAssetsError = {|
  type: 'ADD_OCEAN_MARKET_ASSETS_ERROR',
|};

type StartGettingOceanTokenBalance = {|
  type: 'START_GETTING_OCEAN_TOKEN_BALANCE',
|};

type SetOceanTokenBalance = {|
  type: 'SET_OCEAN_TOKEN_BALANCE',
  payload: number,
|};

type StartGettingOceanPoolShares = {|
  type: 'START_GETTING_OCEAN_POOL_SHARES',
  payload: string,
|};

type SetOceanPoolShares = {|
  type: 'SET_OCEAN_POOL_SHARES',
  payload: SharesByDataAssetId,
|};

export type OceanMarketReducerAction =
  | StartConnectingToOceanMarket
  | SetConnectedToOceanMarket
  | SetConnectedToOceanMarketError
  | StartAddingOceanMarketAssets
  | SetOceanMarketAssets
  | AppendOceanMarketAssets
  | AddOceanMarketAssetsError
  | StartGettingOceanTokenBalance
  | SetOceanTokenBalance
  | StartGettingOceanPoolShares
  | SetOceanPoolShares;

const initialState: OceanMarketReducerState = {
  isConnectingToOceanMarket: false,
  topOceanMarketAssets: [],
  nextTopOceanMarketAssetsPage: null,
  isLoadingOceanMarketAssets: false,
  oceanTokenBalance: 0,
  isFetchingOceanTokenBalance: false,
  fetchingOceanPoolSharesId: '',
  oceanPoolShares: null,
};

const setMarketAssets = (
  state: OceanMarketReducerState,
  action: SetOceanMarketAssets,
): OceanMarketReducerState => {
  const { payload: { assets, nextPage } } = action;
  return {
    ...state,
    topOceanMarketAssets: assets,
    nextTopOceanMarketAssetsPage: nextPage,
    isLoadingOceanMarketAssets: false,
  };
};

const setOceanTokenBalance = (
  state: OceanMarketReducerState,
  action: SetOceanTokenBalance,
): OceanMarketReducerState => {
  const { payload } = action;
  return {
    ...state,
    oceanTokenBalance: payload,
    isFetchingOceanTokenBalance: false,
  };
};

const appendMarketAssets = (
  state: OceanMarketReducerState,
  action: AppendOceanMarketAssets,
): OceanMarketReducerState => {
  const { payload: { assets, nextPage } } = action;
  return {
    ...state,
    topOceanMarketAssets: [...state.topOceanMarketAssets, ...assets],
    nextTopOceanMarketAssetsPage: nextPage,
    isLoadingOceanMarketAssets: false,
  };
};

const startGettingOceanPoolShares = (
  state: OceanMarketReducerState,
  action: StartGettingOceanPoolShares,
): OceanMarketReducerState => {
  const { payload } = action;
  return {
    ...state,
    fetchingOceanPoolSharesId: payload,
  };
};

const setOceanPoolShares = (
  state: OceanMarketReducerState,
  action: SetOceanPoolShares,
): OceanMarketReducerState => {
  const { payload } = action;
  return {
    ...state,
    oceanPoolShares: { ...state.oceanPoolShares, ...payload },
    fetchingOceanPoolSharesId: '',
  };
};

const oceanMarketReducer = (
  state: OceanMarketReducerState = initialState,
  action: OceanMarketReducerAction,
): OceanMarketReducerState => {
  switch (action.type) {
    case OCEAN_MARKET_ACTIONS.SET_IS_CONNECTED_TO_OCEAN_MARKET:
      return { ...state, isConnectingToOceanMarket: true };

    case OCEAN_MARKET_ACTIONS.SET_CONNECTED_TO_OCEAN_MARKET:
    case OCEAN_MARKET_ACTIONS.SET_CONNECTED_TO_OCEAN_MARKET_ERROR:
      return { ...state, isConnectingToOceanMarket: false };

    case OCEAN_MARKET_ACTIONS.START_ADDING_OCEAN_MARKET_ASSETS:
      return { ...state, isLoadingOceanMarketAssets: true };

    case OCEAN_MARKET_ACTIONS.SET_OCEAN_MARKET_ASSETS:
      return setMarketAssets(state, action);

    case OCEAN_MARKET_ACTIONS.APPEND_OCEAN_MARKET_ASSETS:
      return appendMarketAssets(state, action);

    case OCEAN_MARKET_ACTIONS.ADD_OCEAN_MARKET_ASSETS_ERROR:
      return { ...state, isLoadingOceanMarketAssets: false };

    case OCEAN_MARKET_ACTIONS.START_GETTING_OCEAN_TOKEN_BALANCE:
      return { ...state, isFetchingOceanTokenBalance: true };

    case OCEAN_MARKET_ACTIONS.SET_OCEAN_TOKEN_BALANCE:
      return setOceanTokenBalance(state, action);

    case OCEAN_MARKET_ACTIONS.START_GETTING_OCEAN_POOL_SHARES:
      return startGettingOceanPoolShares(state, action);

    case OCEAN_MARKET_ACTIONS.SET_OCEAN_POOL_SHARES:
      return setOceanPoolShares(state, action);

    default:
      return state;
  }
};
export default oceanMarketReducer;
