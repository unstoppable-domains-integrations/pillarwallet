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

import t from 'translations/translate';

import type { Dispatch, GetState, ThunkAction } from 'reducers/rootReducer';

import oceanProtocolInstance from 'services/oceanProtocol';
import { findFirstSmartAccount, getAccountAddress } from 'utils/accounts';

import { OCEAN_MARKET_ACTIONS } from 'constants/oceanMarketConstants';

import Toast from 'components/Toast';

export const connectToOceanMarketAction = (): ThunkAction => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      accounts: { data: accounts },
    } = getState();

    dispatch({ type: OCEAN_MARKET_ACTIONS.SET_IS_CONNECTED_TO_OCEAN_MARKET });

    const smartAccount = findFirstSmartAccount(accounts);
    if (!smartAccount) {
      Toast.show({
        message: t('toast.cannotConnectToOcean.noAccount'),
        emoji: 'hushed',
        supportLink: true,
      });
      dispatch({ type: OCEAN_MARKET_ACTIONS.SET_CONNECTED_TO_OCEAN_MARKET_ERROR });
      return;
    }
    const smartAccountAddress = getAccountAddress(smartAccount);

    const error = await oceanProtocolInstance.connect(smartAccountAddress);
    if (error) {
      Toast.show({
        message: t('toast.cannotConnectToOcean.default', { error: error.message }),
        emoji: 'hushed',
        supportLink: true,
      });
      dispatch({ type: OCEAN_MARKET_ACTIONS.SET_CONNECTED_TO_OCEAN_MARKET_ERROR });
    } else {
      dispatch({ type: OCEAN_MARKET_ACTIONS.SET_CONNECTED_TO_OCEAN_MARKET });
    }
  };
};

const INITIAL_OCEAN_MARKET_ASSETS_PAGE = 1;

export const getTopOceanMarketAssetsAction = (isRefresh?: boolean): ThunkAction => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      oceanMarket: { nextTopOceanMarketAssetsPage, isLoadingOceanMarketAssets },
    } = getState();

    // do not fetch if assets are already being fetched
    if (!isRefresh && isLoadingOceanMarketAssets) return;

    const requestPage = isRefresh ? INITIAL_OCEAN_MARKET_ASSETS_PAGE : nextTopOceanMarketAssetsPage;
    // do not fetch new data if no new pages are available
    if (!requestPage) return;

    dispatch({ type: OCEAN_MARKET_ACTIONS.START_ADDING_OCEAN_MARKET_ASSETS });

    const assetsResponse = await oceanProtocolInstance.getAssetsWithLiquidity(requestPage);
    if (!assetsResponse) {
      dispatch({ type: OCEAN_MARKET_ACTIONS.ADD_OCEAN_MARKET_ASSETS_ERROR });
      return;
    }

    const { results, page, total_pages: totalPages } = assetsResponse;
    const nextPage = (page + 1 <= totalPages) ? page + 1 : null;

    if (isRefresh) {
      dispatch({
        type: OCEAN_MARKET_ACTIONS.SET_OCEAN_MARKET_ASSETS,
        payload: {
          assets: results,
          nextPage,
        },
      });
    } else {
      dispatch({
        type: OCEAN_MARKET_ACTIONS.APPEND_OCEAN_MARKET_ASSETS,
        payload: {
          assets: results,
          nextPage,
        },
      });
    }
  };
};

export const getAccountOceanTokenBalanceAction = (): ThunkAction => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: OCEAN_MARKET_ACTIONS.START_GETTING_OCEAN_TOKEN_BALANCE });
    const oceanTokenBalance = await oceanProtocolInstance.getOceanTokenBalance();
    dispatch({
      type: OCEAN_MARKET_ACTIONS.SET_OCEAN_TOKEN_BALANCE,
      payload: oceanTokenBalance,
    });
  };
};

export const getAccountSinglePoolShareAction = (poolAddress: string, did: string): ThunkAction => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      oceanMarket: { oceanPoolShares = {} },
    } = getState();

    dispatch({
      type: OCEAN_MARKET_ACTIONS.START_GETTING_OCEAN_POOL_SHARES,
      payload: did,
    });

    const poolShare = await oceanProtocolInstance.getAccountSinglePoolShare(poolAddress);
    const totalPoolSupply = await oceanProtocolInstance.getPoolSharesTotalSupply(poolAddress) || 0;
    const sharesPercentage = (poolShare && totalPoolSupply && ((Number(poolShare) / Number(totalPoolSupply)) * 100))
      || 0;

    const poolSharesCopy = { ...oceanPoolShares };
    if (poolShare) {
      poolSharesCopy[did] = {
        shares: poolShare,
        totalPoolSupply,
        sharesPercentage,
        poolAddress,
        did,
      };
    }

    dispatch({
      type: OCEAN_MARKET_ACTIONS.SET_OCEAN_POOL_SHARES,
      payload: poolSharesCopy,
    });
  };
};
