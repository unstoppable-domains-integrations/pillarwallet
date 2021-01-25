// @flow
const fetch = require('node-fetch');

const query = `
  {
    pairs(
      first: 1000,
      where: {reserveUSD_gt: 0},
      orderBy: volumeUSD, 
      orderDirection: desc,
    ) {
      id
      token0 {
        id
        name
        symbol
      }
      token1 {
        id
        name
        symbol
      }
      volumeUSD
      reserveUSD
    }
    pairDayDatas(first: 1000, where: {date: 1611446400, dailyVolumeUSD_gt: 0}) {
      id
      dailyVolumeUSD
    }
  }
`;

const selectBestPairs = ({ data: { pairs, pairDayDatas } }) => {
  const pairsVolumes = {};
  const pairsReserves = {};

  pairDayDatas.forEach(pair => {
    pairsVolumes[pair.id] = pair.dailyVolumeUSD;
  });

  pairs.forEach(pair => {
    pairsReserves[pair.id] = pair.reserveUSD;
  });

  const mappedPairs = pairs
    .filter(pair => pairsVolumes[pair.id] && pairsReserves[pair.id])
    .map(pair => ({ ...pair, rate: pairsVolumes[pair.id] / pairsReserves[pair.id] }));
  mappedPairs.sort((a, b) => b.rate - a.rate);
  return mappedPairs.slice(0, 20);
};

const handleWETH = (str) => str === 'WETH' ? 'ETH' : str;

fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2', {
  method: 'POST',
  body: JSON.stringify({
    query,
  }),
})
  .then(res => res.json())
  .then(json => {
    const pairs = selectBestPairs(json);
    pairs.forEach(pair => {
      const symbol0 = handleWETH(pair.token0.symbol);
      const symbol1 = handleWETH(pair.token1.symbol);
      console.log(`{
  name: 'Uniswap v2 ${symbol0}/${symbol1}',
  type: LIQUIDITY_POOLS_TYPES.UNISWAP,
  tokensProportions: [
    { symbol: '${symbol0}', proportion: 0.5 },
    { symbol: '${symbol1}', proportion: 0.5 },
  ],
  uniswapPairAddress: '${pair.id}',
  poolTokenData: {
    name: '${symbol0}-${symbol1} Uniswap V2 LP',
    symbol: 'UNI-V2',
    decimals: 18,
    address: '${pair.id}',
  }
  iconUrl: '',
},`);
    });
  });
