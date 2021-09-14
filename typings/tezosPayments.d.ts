import { MichelsonMap } from '@taquito/taquito';

declare global {
  namespace TezosPayments {
    interface ServiceMetadata {
      name: string;
      links: string[];
      description?: string;
    }

    interface SigningKey {
      readonly public_key: string;
      readonly name: string | null;
    }
    type SigningKeys = MichelsonMap<SigningKey['public_key'], SigningKey>;

    const enum OperationType {
      Payment = 1,
      Donation = 2,
      All = Payment | Donation
    }
  }
}
