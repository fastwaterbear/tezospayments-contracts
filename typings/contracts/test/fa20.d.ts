import { MichelsonMap } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';

declare global {
  namespace TezosPayments.Testing.Fa20Contract {
    interface Storage {
      admin: {
        admin: string;
        pending_admin: string | null;
        paused: boolean
      },
      assets: {
        token_total_supply: MichelsonMap<number, BigNumber>;
        ledger: MichelsonMap<string, BigNumber>;
        operators: MichelsonMap<string, string>;
        token_metadata: MichelsonMap<number, string>;
      },
      metadata: MichelsonMap<string, string>,
    }
  }
}
