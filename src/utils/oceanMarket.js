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

import type { OceanMarketAsset, OceanMarketAssetMeta, SharesByDataAssetId } from 'models/OceanMarket';
import { parseTokenBigNumberAmount } from 'utils/common';
import { encodeContractMethod } from 'services/assets';
import OCEAN_MARKET_POOL_ABI from 'abi/oceanMarketPool.json';
import { OCEAN } from 'constants/assetsConstants';
import { getEnv } from 'configs/envConfig';
import type { Asset } from 'models/Asset';

export const getDatasetMetadata = (asset: OceanMarketAsset): ?OceanMarketAssetMeta => {
  const services = asset?.service;
  if (!services || !Array.isArray(services)) return null;

  const meta = services.find(({ type }) => type === 'metadata');
  return meta?.attributes;
};

export const createOceanMarketAddLiquidityTransactionData = (
  tokenIn: string,
  amount: number,
  decimals: number,
): string => {
  const tokenAmountIn = parseTokenBigNumberAmount(amount, decimals);
  const minPoolAmountOut = parseTokenBigNumberAmount('0', decimals);
  return encodeContractMethod(OCEAN_MARKET_POOL_ABI, 'joinswapExternAmountIn', [
    tokenIn,
    tokenAmountIn,
    minPoolAmountOut,
  ]);
};

export const createOceanMarketAddLiquidityAllowanceTransactionData = (
  spenderAddress: string,
  amount: number,
  decimals: number,
): string => {
  const allowedAmount = parseTokenBigNumberAmount(amount, decimals);
  return encodeContractMethod(OCEAN_MARKET_POOL_ABI, 'approve', [
    spenderAddress,
    allowedAmount,
  ]);
};

export const createOceanMarketRemoveLiquidityTransactionData = (
  tokenOut: string,
  amount: number,
  maximumPoolShares: number,
  decimals: number,
): string => {
  const tokenAmountOut = parseTokenBigNumberAmount(amount, decimals);
  const maxPoolAmount = parseTokenBigNumberAmount(maximumPoolShares, decimals);
  return encodeContractMethod(OCEAN_MARKET_POOL_ABI, 'exitswapExternAmountOut', [
    tokenOut,
    tokenAmountOut,
    maxPoolAmount,
  ]);
};

export const getOceanMarketAddLiquidityAllowanceTransaction = (amount: number, dataset: OceanMarketAsset) => {
  const data = createOceanMarketAddLiquidityAllowanceTransactionData(
    dataset?.price?.address,
    amount,
    dataset?.dataTokenInfo?.decimals,
  );

  return {
    to: getEnv().OCEAN_ADDRESS,
    data,
    amount: 0,
    symbol: OCEAN,
  };
};

export const getOceanMarketAddLiquidityTransaction = (token: Asset, value: number, dataset: OceanMarketAsset) => {
  const data = createOceanMarketAddLiquidityTransactionData(token.address, value, token.decimals);

  return {
    to: dataset.price.address,
    data,
    amount: 0,
    symbol: OCEAN,
  };
};

export const getOceanMarketRemoveLiquidityTransaction = (
  token: Asset, value: number, maximumPoolShares: number, dataset: OceanMarketAsset,
) => {
  const data = createOceanMarketRemoveLiquidityTransactionData(token.address, value, maximumPoolShares, token.decimals);

  return {
    to: dataset.price.address,
    data,
    amount: 0,
    symbol: OCEAN,
    contractAddress: getEnv().OCEAN_ADDRESS,
    decimals: token.decimals,
  };
};

export const getTotalUserLiquidityInPool = (oceanPoolShares: SharesByDataAssetId, asset: OceanMarketAsset) => {
  const relatedAssetPoolShares = oceanPoolShares[asset.id]?.shares;
  const totalPoolSupply = oceanPoolShares[asset.id]?.totalPoolSupply || 0;
  const { price } = asset;

  const userOceanBalance =
    (Number(relatedAssetPoolShares) / Number(totalPoolSupply)) * price.ocean;
  const userDtBalance =
    (Number(relatedAssetPoolShares) / Number(totalPoolSupply)) * price.datatoken;
  const userLiquidity = {
    ocean: userOceanBalance,
    datatoken: userDtBalance,
  };
  return userLiquidity?.ocean + (userLiquidity?.datatoken * price?.value);
};
