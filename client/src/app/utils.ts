import { ethers } from 'ethers';

export function convertAmount(currency: string | undefined, amount: string) {
  let output: string = amount;
  const ccy: string | undefined = currency?.toUpperCase();
  if (ccy === 'USDC' || ccy === 'USDT') {
    output = ethers.formatUnits(amount, 6);
  } else if (ccy === 'WETH' || ccy === 'DAI') {
    output = ethers.formatUnits(amount, 18);
  }
  return output;
}