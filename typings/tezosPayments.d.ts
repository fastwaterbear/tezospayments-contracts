import { MichelsonMap } from '@taquito/taquito';

declare global {
  namespace TezosPayments {
    interface ServiceMetadata {
      name: string;
      links: string[];
      description?: string;
    }

    type SigningKey = readonly [key: string, keyName: string | null];
    type SigningKeys = MichelsonMap<SigningKey['0'], SigningKey['1']>;

    const enum OperationType {
      Payment = 1,
      Donation = 2,
      All = Payment | Donation
    }
  }
}
