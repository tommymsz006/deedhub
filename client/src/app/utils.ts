import { ethers } from 'ethers';

export function convertAmount(amount: string, currency: string | undefined = undefined) {
  let output: number = 0;
  const ccy: string | undefined = currency ? toReadableCurrency(currency).toUpperCase() : currency;
  if (ccy === 'USDC' || ccy === 'USDT') {
    output = Math.floor(Number(ethers.formatUnits(amount, 6)));
  } else if (ccy === 'WETH' || ccy === 'DAI') {
    //console.log(amount);
    output = Math.round(Number(ethers.formatUnits(amount, 18 - 4))) / 10000;
  } else {
    output = Math.floor(Number(amount) * 10000) / 10000;
  }
  return output;
}

export function toReadableCurrency(currency: string) {
  let output: string | undefined = currency;
  if (currency?.startsWith('0x')) {
    const currencyMap: {[key: string]: string} = {
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
      '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT'
    };
    output = currencyMap[currency] || currency;
  }

  return output;
}