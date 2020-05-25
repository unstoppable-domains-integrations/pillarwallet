// @flow
import get from 'lodash.get';
import { createSelector } from 'reselect';
import { getEnabledAssets, getSmartWalletAddress } from 'utils/accounts';
import { getAssetData, getAssetsAsList } from 'utils/assets';
import { userHasSmartWallet } from 'utils/smartWallet';
import {
  assetsSelector,
  activeAccountIdSelector,
  hiddenAssetsSelector,
  supportedAssetsSelector,
  accountsSelector,
} from './selectors';


export const accountAssetsSelector = createSelector(
  assetsSelector,
  activeAccountIdSelector,
  hiddenAssetsSelector,
  (assets, activeAccountId, hiddenAssets) => {
    if (!activeAccountId) return {};
    const activeAccountAssets = get(assets, activeAccountId, {});
    const activeAccountHiddenAssets = get(hiddenAssets, activeAccountId, []);

    return getEnabledAssets(activeAccountAssets, activeAccountHiddenAssets);
  },
);

export const smartAccountAssetsSelector = createSelector(
  assetsSelector,
  accountsSelector,
  hiddenAssetsSelector,
  (assets, accounts, hiddenAssets) => {
    const userHasSW = userHasSmartWallet(accounts);
    if (!userHasSW) return {};
    const smartAccountId = getSmartWalletAddress(accounts);
    if (!smartAccountId) return {};

    const activeAccountAssets = get(assets, smartAccountId, {});
    const activeAccountHiddenAssets = get(hiddenAssets, smartAccountId, []);

    return getEnabledAssets(activeAccountAssets, activeAccountHiddenAssets);
  },
);

export const makeAccountEnabledAssetsSelector = (accountId: string) => createSelector(
  assetsSelector,
  hiddenAssetsSelector,
  (assets, hiddenAssets) => {
    const accountAssets = get(assets, accountId, {});
    const accountHiddenAssets = get(hiddenAssets, accountId, []);
    return getEnabledAssets(accountAssets, accountHiddenAssets);
  },
);

export const allAccountsAssetsSelector = createSelector(
  assetsSelector,
  hiddenAssetsSelector,
  (assets, hiddenAssets) => {
    return Object.keys(assets).reduce((memo, accountId) => {
      const accountAssets = get(assets, accountId, {});
      const accountHiddenAssets = get(hiddenAssets, accountId, []);
      const enabledAssets = getEnabledAssets(accountAssets, accountHiddenAssets);
      const newAssets = Object.keys(enabledAssets).filter((asset) => !memo.includes(asset));
      return [...memo, ...newAssets];
    }, []);
  },
);

export const assetDecimalsSelector = (assetSelector: (state: Object, props: Object) => number) => createSelector(
  assetsSelector,
  supportedAssetsSelector,
  assetSelector,
  (assets, supportedAssets, asset) => {
    const { decimals = 18 } = getAssetData(getAssetsAsList(assets), supportedAssets, asset);
    return decimals;
  },
);
