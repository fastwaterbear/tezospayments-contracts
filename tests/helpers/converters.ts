import { Buffer } from 'buffer';

export const stringToBytes = (value: string): string => Buffer.from(value, 'utf8').toString('hex');

export const serviceMetadataToBytes = (serviceMetadata: TezosPayments.ServiceMetadata): string =>
  Buffer.from(JSON.stringify(serviceMetadata), 'utf8').toString('hex');

export function tezToMutez(tez: number): number;
export function tezToMutez(tez: bigint): bigint;
export function tezToMutez(tez: bigint | number): bigint | number {
  return typeof tez === 'number'
    ? tez * 1_000_000
    : tez * 1_000_000n;
}
