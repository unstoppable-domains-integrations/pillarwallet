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

export const OCEAN_MARKET_ACTIONS = {
  SET_CONNECTOR_TO_OCEAN_MARKET: 'SET_CONNECTOR_TO_OCEAN_MARKET',
  SET_OCEAN_MARKET_SESSION: 'SET_OCEAN_MARKET_SESSION',
  SET_OCEAN_POOL_SHARES: 'SET_OCEAN_POOL_SHARES',
  START_GETTING_OCEAN_POOL_SHARES: 'START_GETTING_OCEAN_POOL_SHARES',
  SET_IS_CONNECTED_TO_OCEAN_MARKET: 'SET_IS_CONNECTED_TO_OCEAN_MARKET',
  SET_CONNECTED_TO_OCEAN_MARKET: 'SET_CONNECTED_TO_OCEAN_MARKET',
  SET_CONNECTED_TO_OCEAN_MARKET_ERROR: 'SET_CONNECTED_TO_OCEAN_MARKET_ERROR',
  START_ADDING_OCEAN_MARKET_ASSETS: 'START_ADDING_OCEAN_MARKET_ASSETS',
  SET_OCEAN_MARKET_ASSETS: 'SET_OCEAN_MARKET_ASSETS',
  APPEND_OCEAN_MARKET_ASSETS: 'APPEND_OCEAN_MARKET_ASSETS',
  ADD_OCEAN_MARKET_ASSETS_ERROR: 'ADD_OCEAN_MARKET_ASSETS_ERROR',
  START_GETTING_OCEAN_TOKEN_BALANCE: 'START_GETTING_OCEAN_TOKEN_BALANCE',
  SET_OCEAN_TOKEN_BALANCE: 'SET_OCEAN_TOKEN_BALANCE',
};

export const OCEAN_MARKET_TRANSACTION_TYPES = {
  ALLOWANCE: 'allowance',
  ADD_LIQUIDITY: 'add_liquidity',
};
