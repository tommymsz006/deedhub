import { ethers } from 'ethers';

export function convertAmount(amount: string, currency: string | undefined = undefined) {
  let output: number = 0;
  const ccy: string | undefined = currency?.toUpperCase();
  if (ccy === 'USDC' || ccy === 'USDT') {
    output = Math.floor(Number(ethers.formatUnits(amount, 6)));
  } else if (ccy === 'WETH' || ccy === 'DAI') {
    output = Number(ethers.formatUnits(amount, 18 - 4)) / 10000;
  } else {
    output = Math.floor(Number(amount) * 10000) / 10000;
  }
  return output;
}