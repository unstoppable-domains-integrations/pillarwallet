// @flow
import { Config, ConfigHelper, Ocean } from '@oceanprotocol/lib';
import { PoolShare } from '@oceanprotocol/lib/dist/node/balancer/OceanPool';
import Web3 from 'web3';
import { createConnector } from 'services/walletConnect';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { SESSION_REQUEST_EVENT } from 'constants/walletConnectConstants';
import axios, { AxiosResponse } from 'axios';

import { reportErrorLog } from 'utils/common';
import { getEnv } from 'configs/envConfig';
import type {
  OceanMarketAccount,
  OceanMarketAsset,
  OceanMarketAssetsResponse,
  TransactionReceipt,
} from 'models/OceanMarket';
import type { Connector } from 'models/WalletConnect';

const defaultConfig: Config = new ConfigHelper().getConfig(
  getEnv().OCEAN_MARKET_NETWORK,
  getEnv().INFURA_PROJECT_ID,
);

const ERROR = {
  NO_PROVIDER: 'no provider',
  NO_ACCOUNT: 'no account',
  NO_ACCOUNT_ID: 'no account id',
};

class OceanProtocolProvider {
  walletConnectProvider: any;
  smartAccAddress: string;
  oceanProvider: Ocean;
  wrappedWalletConnectProvider: any;
  config: Config;
  account: OceanMarketAccount;
  walletConnectConnector: Connector;

  setWeb3Provider = async () => {
    if (!this.walletConnectProvider) {
      this.walletConnectProvider = new WalletConnectProvider({
        infuraId: getEnv().INFURA_PROJECT_ID,
        qrcode: false,
      });
    }

    await this.enableSession();

    if (!this.wrappedWalletConnectProvider) {
      this.wrappedWalletConnectProvider = new Web3(this.walletConnectProvider);
    }
  }

  enableSession = async (): Promise<void> => {
    this.subscribeToConnectRequest();
    await this.walletConnectProvider.enable();
  }

  connect = async (smartWalletAddress: string): Promise<?Error> => {
    this.smartAccAddress = smartWalletAddress;
    try {
      await this.setWeb3Provider();

      this.config = {
        ...defaultConfig,
        web3Provider: this.wrappedWalletConnectProvider,
      };

      this.oceanProvider = await Ocean.getInstance(this.config);
      return null;
    } catch (error) {
      reportErrorLog('Unable to connect to Ocean Market', { error });
      return error;
    }
  }

  getAccount = async (): Promise<?OceanMarketAccount> => {
    try {
      if (!this.oceanProvider) throw new Error(ERROR.NO_PROVIDER);
      return (await this.oceanProvider.accounts.list())?.[0];
    } catch (error) {
      reportErrorLog('Unable to get Ocean Market account', { error });
      return Promise.resolve(null);
    }
  }

  getConnector = (): ?Connector => {
    if (!this.oceanProvider) {
      reportErrorLog('Unable to get Ocean Market connector - no provider');
      return null;
    }
    if (!this.walletConnectConnector) {
      reportErrorLog('Unable to get Ocean Market connector - no connector');
      return null;
    }
    return this.walletConnectConnector;
  }

  subscribeToConnectRequest = (): void => {
    // eslint-disable-next-line i18next/no-literal-string
    this.walletConnectProvider.connector.on('display_uri', (err, payload) => {
      const uri = payload.params[0];
      this.walletConnectConnector = createConnector({ uri });
      this.subscribeToConnectorEvents(this.walletConnectConnector);
    });
  }

  subscribeToConnectorEvents = (connector: Connector) => {
    connector.on(SESSION_REQUEST_EVENT, async (error: any) => {
      if (error) {
        reportErrorLog('Wallet Connect connector\'s issue while connecting to Ocean market', { error });
        return;
      }
      await connector.approveSession({
        accounts: [this.smartAccAddress],
        chainId: parseInt(getEnv().OCEAN_MARKET_CHAIN_ID, 10),
      });
    });
  }

  getOceanTokenBalance = async (): Promise<?number> => {
    const account = await this.getAccount();
    try {
      if (!account) throw new Error(ERROR.NO_ACCOUNT);
      return (await account.getOceanBalance()) ?? 0;
    } catch (error) {
      reportErrorLog('Unable to get Ocean token balance', { error });
      return Promise.resolve(0);
    }
  };

  getAssetsWithLiquidity = async (page: number = 1): Promise<?OceanMarketAssetsResponse> => {
    try {
      const response: AxiosResponse = await axios.post(
        `${getEnv().OCEAN_MARKET_METADATA_URI}/api/v1/aquarius/assets/ddo/query`,
        {
          offset: 20,
          page,
          query: {
            nativeSearch: 1,
            query_string: {
              query: '(price.type:pool) -isInPurgatory:true',
            },
          },
          sort: {
            'price.ocean': -1,
          },
        },
      );
      if (!response || response.status !== 200 || !response.data) return null;
      return response.data;
    } catch (error) {
      reportErrorLog('Unable to get Ocean Market assets', { error });
      return Promise.resolve(null);
    }
  };

  getSingleAsset = async (did: string): Promise<?OceanMarketAsset> => {
    try {
      if (!this.oceanProvider) throw new Error(ERROR.NO_PROVIDER);
      return this.oceanProvider.assets.resolve(did);
    } catch (error) {
      reportErrorLog('Unable to get single Ocean Market asset', { error });
      return Promise.resolve(null);
    }
  };

  getUserAssets = async (): Promise<?OceanMarketAssetsResponse> => {
    try {
      if (!this.oceanProvider) throw new Error(ERROR.NO_PROVIDER);
      const account = await this.getAccount();
      const accountId = account?.id;
      if (!accountId) throw new Error(ERROR.NO_ACCOUNT_ID);
      return this.oceanProvider.assets.ownerAssets(this.account.id);
    } catch (error) {
      reportErrorLog('Unable to get user Ocean Market assets', { error });
      return Promise.resolve(null);
    }
  };

  getAccountPoolShares = async () => {
    try {
      if (!this.oceanProvider) throw new Error(ERROR.NO_PROVIDER);
      const account = await this.getAccount();
      const accountId = account?.id;
      if (!accountId) throw new Error(ERROR.NO_ACCOUNT_ID);
      const shares: PoolShare[] = await this.oceanProvider.pool.getPoolSharesByAddress(accountId);
      return shares.reduce((sharesByDid, dataset) => {
        if (dataset?.did) sharesByDid[dataset.did] = dataset;
        return sharesByDid;
      }, {});
    } catch (error) {
      reportErrorLog('Unable to get account pool shares', { error });
      return Promise.resolve(null);
    }
  }

  getAccountSinglePoolShare = async (poolAddress: string): Promise<number> => {
    try {
      if (!this.oceanProvider) throw new Error(ERROR.NO_PROVIDER);
      const account = await this.getAccount();
      const accountId = account?.id;
      if (!accountId) throw new Error(ERROR.NO_ACCOUNT_ID);
      const sharesBalanceString = await this.oceanProvider.pool.sharesBalance(accountId, poolAddress);
      return Number(sharesBalanceString) || 0;
    } catch (error) {
      reportErrorLog('Unable to get account\'s single pool share', { error });
      return Promise.resolve(0);
    }
  };

  getPoolSharesTotalSupply = async (poolAddress: string): Promise<number> => {
    try {
      if (!this.oceanProvider) throw new Error(ERROR.NO_PROVIDER);
      const totalSupplyString = await this.oceanProvider.pool.getPoolSharesTotalSupply(poolAddress);
      return Number(totalSupplyString) || 0;
    } catch (error) {
      reportErrorLog('Unable to get user Ocean Market assets', { error });
      return Promise.resolve(0);
    }
  };

  addLiquidity = async (poolAddress: string, amount: string): Promise<?TransactionReceipt> => {
    try {
      if (!this.oceanProvider) throw new Error(ERROR.NO_PROVIDER);
      const account = await this.getAccount();
      const accountId = account?.id;
      if (!accountId) throw new Error(ERROR.NO_ACCOUNT_ID);
      return this.oceanProvider.pool.addOceanLiquidity(accountId, poolAddress, amount);
    } catch (error) {
      reportErrorLog('Unable to add liquidity', { error });
      return Promise.resolve(null);
    }
  }

  getMaxAddLiquidity = async (poolAddress: string, tokenAddress: string): Promise<number> => {
    try {
      if (!this.oceanProvider) throw new Error(ERROR.NO_PROVIDER);
      const maxLiquidityString = await this.oceanProvider.pool.getMaxAddLiquidity(poolAddress, tokenAddress);
      return Number(maxLiquidityString) || 0;
    } catch (error) {
      reportErrorLog('Unable to get max liquidity', { error });
      return Promise.resolve(0);
    }
  }

  getExpectedPoolShare = async (poolAddress: string, tokenAddress: string, tokenAmount: string): Promise<number> => {
    if (!this.oceanProvider) {
      reportErrorLog('Unable to get max liquidity - no provider');
      return 0;
    }

    try {
      const poolShareString =
        await this.oceanProvider.pool.calcPoolOutGivenSingleIn(poolAddress, tokenAddress, tokenAmount);
      return Number(poolShareString) || 0;
    } catch (error) {
      reportErrorLog('Unable to get max liquidity', { error });
      return 0;
    }
  }

  getSwapFee = async (poolAddress: string): Promise<number> => {
    if (!this.oceanProvider) {
      reportErrorLog('Unable to get max liquidity - no provider');
      return 0;
    }

    try {
      const swapFee =
        await this.oceanProvider.pool.getSwapFee(poolAddress);
      return Number(swapFee) || 0;
    } catch (error) {
      reportErrorLog('Unable to get max liquidity', { error });
      return 0;
    }
  }
}


const oceanProtocolInstance = new OceanProtocolProvider();

export default oceanProtocolInstance;
