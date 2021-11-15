import { Buffer } from 'buffer';

import BigNumber from 'bignumber.js';

export const stringToBytes = (value: string): string => Buffer.from(value, 'utf8').toString('hex');

export const serviceMetadataToBytes = (serviceMetadata: TezosPayments.ServiceMetadata): string =>
  Buffer.from(JSON.stringify(serviceMetadata), 'utf8').toString('hex');

export const tokensAmountToNat = (tokensAmount: BigNumber | number, decimals: number): BigNumber => {
  return new BigNumber(tokensAmount).multipliedBy(10 ** decimals).integerValue();
};

export const numberToTokensAmount = (value: BigNumber | number, decimals: number): BigNumber => {
  return new BigNumber(value).div(10 ** decimals).integerValue();
};

const tezDecimals = 6;
export const tezToMutez = (tez: BigNumber | number): BigNumber => tokensAmountToNat(tez, tezDecimals);
export const mutezToTez = (mutez: BigNumber | number): BigNumber => numberToTokensAmount(mutez, tezDecimals);
