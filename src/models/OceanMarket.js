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

import { DDO, Account } from '@oceanprotocol/lib';
import { Metadata } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Metadata';

export type OceanMarketAccount = Account;

export type OceanMarketAsset = DDO;

export type OceanMarketAssetsResponse = {
  results: (?OceanMarketAsset)[],
  page: number,
  total_pages: number,
  total_results: number,
};

export type OceanMarketAssetMeta = Metadata;

export type TransactionReceipt = {
  status: boolean;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  contractAddress?: string;
  cumulativeGasUsed: number;
  gasUsed: number;
};

export type SharesByDataAssetId = {
  [did: string]: {
    poolAddress: string;
    shares: string;
    did: string;
    totalPoolSupply: number,
    sharesPercentage: number,
  },
};

export type TokensReceived = {
  dtAmount?: string,
  oceanAmount?: string,
}
