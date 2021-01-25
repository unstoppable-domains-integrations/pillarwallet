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
import { getEnv } from 'configs/envConfig';
import { STAGING } from 'constants/envConstants';
import { LIQUIDITY_POOLS_TYPES } from 'models/LiquidityPools';
import type { LiquidityPool } from 'models/LiquidityPools';


export const SET_FETCHING_LIQUIDITY_POOLS_DATA = 'SET_FETCHING_LIQUIDITY_POOLS_DATA';
export const SET_UNIPOOL_DATA = 'SET_UNIPOOL_DATA';
export const SET_UNISWAP_POOL_DATA = 'SET_UNISWAP_POOL_DATA';
export const SET_LIQUIDITY_POOLS_GRAPH_QUERY_ERROR = 'SET_LIQUIDITY_POOLS_GRAPH_QUERY_ERROR';
export const SET_SHOWN_STAKING_ENABLED_MODAL = 'SET_SHOWN_STAKING_ENABLED_MODAL';

export const LIQUIDITY_POOLS_ADD_LIQUIDITY_TRANSACTION = 'LIQUIDITY_POOLS_ADD_LIQUIDITY_TRANSACTION';
export const LIQUIDITY_POOLS_REMOVE_LIQUIDITY_TRANSACTION = 'LIQUIDITY_POOLS_REMOVE_LIQUIDITY_TRANSACTION';
export const LIQUIDITY_POOLS_STAKE_TRANSACTION = 'LIQUIDITY_POOLS_STAKE_TRANSACTION';
export const LIQUIDITY_POOLS_UNSTAKE_TRANSACTION = 'LIQUIDITY_POOLS_UNSTAKE_TRANSACTION';
export const LIQUIDITY_POOLS_REWARDS_CLAIM_TRANSACTION = 'LIQUIDITY_POOLS_REWARDS_CLAIM_TRANSACTION';


export const LIQUIDITY_POOLS = (): LiquidityPool[] => getEnv().ENVIRONMENT === STAGING ?
  [
    {
      name: 'Uniswap v2 ETH/PLR',
      type: LIQUIDITY_POOLS_TYPES.UNIPOOL,
      tokensProportions: [
        { symbol: 'ETH', proportion: 0.5, progressBarColor: '#497391' },
        { symbol: 'PLR', proportion: 0.5, progressBarColor: '#00ff24' },
      ],
      rewards: [
        { symbol: 'PLR', amount: 49999 },
      ],
      uniswapPairAddress: '0xddA2eCA2c9cB356ECd9b0135951ffBf5d577401D',
      unipoolAddress: '0xFfD8C07309d3A3ce473Feb1d98ebF1F3171A83d9',
      unipoolSubgraphName: 'graszka22/unipool-plr-eth-kovan',
      iconUrl: 'asset/images/tokens/icons/ethplruniColor.png',
      rewardsEnabled: true,
      poolTokenData: {
        name: 'UNI-V2',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xddA2eCA2c9cB356ECd9b0135951ffBf5d577401D',
      },
    },
  ] : [
    {
      name: 'Uniswap v2 ETH/PLR',
      type: LIQUIDITY_POOLS_TYPES.UNIPOOL,
      tokensProportions: [
        { symbol: 'ETH', proportion: 0.5, progressBarColor: '#497391' },
        { symbol: 'PLR', proportion: 0.5, progressBarColor: '#00ff24' },
      ],
      rewards: [
        { symbol: 'PLR', amount: 49999 },
      ],
      uniswapPairAddress: '0xae2d4004241254aed3f93873604d39883c8259f0',
      unipoolAddress: '0x32105017918Cb9CD9A5f21fd6984Ee7DC82B9E7E',
      unipoolSubgraphName: 'graszka22/unipool-plr-eth',
      iconUrl: 'asset/images/tokens/icons/ethplruniColor.png',
      rewardsEnabled: true,
      poolTokenData: {
        name: 'ETH-PLR Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xae2d4004241254aed3f93873604d39883c8259f0',
        iconUrl: 'asset/images/tokens/icons/ethplruniColor.png',
      },
    },
    {
      name: 'Uniswap v2 DAI/PLR',
      type: LIQUIDITY_POOLS_TYPES.UNIPOOL,
      tokensProportions: [
        { symbol: 'DAI', proportion: 0.5, progressBarColor: '#FABA34' },
        { symbol: 'PLR', proportion: 0.5, progressBarColor: '#00ff24' },
      ],
      rewards: [
        { symbol: 'PLR', amount: 29999 },
      ],
      uniswapPairAddress: '0x025d34acfd5c65cfd5a73209f99608c9e13338f3',
      unipoolAddress: '0x71B4A17E4254F85420B06bC55f431A5EEb97E7fB',
      unipoolSubgraphName: 'graszka22/unipool-plr-dai',
      iconUrl: 'asset/images/tokens/icons/daiplrColor.png',
      rewardsEnabled: true,
      poolTokenData: {
        name: 'DAI-PLR Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x025d34acfd5c65cfd5a73209f99608c9e13338f3',
        iconUrl: 'asset/images/tokens/icons/daiplrColor.png',
      },
    },
    {
      name: 'Uniswap v2 ETH/USDT',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'ETH', proportion: 0.5 },
        { symbol: 'USDT', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
      poolTokenData: {
        name: 'ETH-USDT Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
      },
    },
    {
      name: 'Uniswap v2 USDC/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'USDC', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
      poolTokenData: {
        name: 'USDC-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
      },
    },
    {
      name: 'Uniswap v2 DAI/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'DAI', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
      poolTokenData: {
        name: 'DAI-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
      },
    },
    {
      name: 'Uniswap v2 WBTC/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'WBTC', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xbb2b8038a1640196fbe3e38816f3e67cba72d940',
      poolTokenData: {
        name: 'WBTC-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xbb2b8038a1640196fbe3e38816f3e67cba72d940',
      },
    },
    {
      name: 'Uniswap v2 UNI/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'UNI', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xd3d2e2692501a5c9ca623199d38826e513033a17',
      poolTokenData: {
        name: 'UNI-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xd3d2e2692501a5c9ca623199d38826e513033a17',
      },
    },
    {
      name: 'Uniswap v2 YFI/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'YFI', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x2fdbadf3c4d5a8666bc06645b8358ab803996e28',
      poolTokenData: {
        name: 'YFI-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x2fdbadf3c4d5a8666bc06645b8358ab803996e28',
      },
    },
    {
      name: 'Uniswap v2 ETH/AMPL',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'ETH', proportion: 0.5 },
        { symbol: 'AMPL', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xc5be99a02c6857f9eac67bbce58df5572498f40c',
      poolTokenData: {
        name: 'ETH-AMPL Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xc5be99a02c6857f9eac67bbce58df5572498f40c',
      },
    },
    {
      name: 'Uniswap v2 SUSHI/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'SUSHI', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xce84867c3c02b05dc570d0135103d3fb9cc19433',
      poolTokenData: {
        name: 'SUSHI-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xce84867c3c02b05dc570d0135103d3fb9cc19433',
      },
    },
    {
      name: 'Uniswap v2 LINK/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'LINK', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974',
      poolTokenData: {
        name: 'LINK-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974',
      },
    },
    {
      name: 'Uniswap v2 TEND/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'TEND', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xcfb8cf118b4f0abb2e8ce6dbeb90d6bc0a62693d',
      poolTokenData: {
        name: 'TEND-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xcfb8cf118b4f0abb2e8ce6dbeb90d6bc0a62693d',
      },
    },
    {
      name: 'Uniswap v2 CORE/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'CORE', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x32ce7e48debdccbfe0cd037cc89526e4382cb81b',
      poolTokenData: {
        name: 'CORE-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x32ce7e48debdccbfe0cd037cc89526e4382cb81b',
      },
    },
    {
      name: 'Uniswap v2 KP3R/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'KP3R', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x87febfb3ac5791034fd5ef1a615e9d9627c2665d',
      poolTokenData: {
        name: 'KP3R-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x87febfb3ac5791034fd5ef1a615e9d9627c2665d',
      },
    },
    {
      name: 'Uniswap v2 DAI/BAS',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'DAI', proportion: 0.5 },
        { symbol: 'BAS', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x0379da7a5895d13037b6937b109fa8607a659adf',
      poolTokenData: {
        name: 'DAI-BAS Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x0379da7a5895d13037b6937b109fa8607a659adf',
      },
    },
    {
      name: 'Uniswap v2 BAC/DAI',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'BAC', proportion: 0.5 },
        { symbol: 'DAI', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xd4405f0704621dbe9d4dea60e128e0c3b26bddbd',
      poolTokenData: {
        name: 'BAC-DAI Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xd4405f0704621dbe9d4dea60e128e0c3b26bddbd',
      },
    },
    {
      name: 'Uniswap v2 ESD/USDC',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'ESD', proportion: 0.5 },
        { symbol: 'USDC', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x88ff79eb2bc5850f27315415da8685282c7610f9',
      poolTokenData: {
        name: 'ESD-USDC Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x88ff79eb2bc5850f27315415da8685282c7610f9',
      },
    },
    {
      name: 'Uniswap v2 USDC/DSD',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'USDC', proportion: 0.5 },
        { symbol: 'DSD', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x66e33d2605c5fb25ebb7cd7528e7997b0afa55e8',
      poolTokenData: {
        name: 'USDC-DSD Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x66e33d2605c5fb25ebb7cd7528e7997b0afa55e8',
      },
    },
    {
      name: 'Uniswap v2 PICKLE/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'PICKLE', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0xdc98556ce24f007a5ef6dc1ce96322d65832a819',
      poolTokenData: {
        name: 'PICKLE-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0xdc98556ce24f007a5ef6dc1ce96322d65832a819',
      },
    },
    {
      name: 'Uniswap v2 SNX/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'SNX', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x43ae24960e5534731fc831386c07755a2dc33d47',
      poolTokenData: {
        name: 'SNX-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x43ae24960e5534731fc831386c07755a2dc33d47',
      },
    },
    {
      name: 'Uniswap v2 USDC/USDT',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'USDC', proportion: 0.5 },
        { symbol: 'USDT', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x3041cbd36888becc7bbcbc0045e3b1f144466f5f',
      poolTokenData: {
        name: 'USDC-USDT Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x3041cbd36888becc7bbcbc0045e3b1f144466f5f',
      },
    },
    {
      name: 'Uniswap v2 WISE/ETH',
      type: LIQUIDITY_POOLS_TYPES.UNISWAP,
      tokensProportions: [
        { symbol: 'WISE', proportion: 0.5 },
        { symbol: 'ETH', proportion: 0.5 },
      ],
      uniswapPairAddress: '0x21b8065d10f73ee2e260e5b47d3344d3ced7596e',
      poolTokenData: {
        name: 'WISE-ETH Uniswap V2 LP',
        symbol: 'UNI-V2',
        decimals: 18,
        address: '0x21b8065d10f73ee2e260e5b47d3344d3ced7596e',
      },
    },
  ];

export const UNISWAP_FEE_RATE = 0.003;
