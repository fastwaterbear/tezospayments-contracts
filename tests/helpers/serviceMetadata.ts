import { Buffer } from 'buffer';

export const serviceMetadataToBytes = (serviceMetadata: TezosPayments.ServiceMetadata): string =>
  Buffer.from(JSON.stringify(serviceMetadata), 'utf8').toString('hex');
