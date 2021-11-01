import { MichelsonMap } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';

declare global {
  namespace TezosPayments.Testing.Fa12Contract {
    type Ledger = MichelsonMap<string, {
      readonly balance: BigNumber,
      readonly allowances: MichelsonMap<string, BigInt>
    }>;

    interface Storage {
      readonly totalSupply: BigNumber;
      readonly ledger: Ledger;
    }
  }
}
