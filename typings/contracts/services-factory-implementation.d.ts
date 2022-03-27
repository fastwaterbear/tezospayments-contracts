import { BigNumber } from 'bignumber.js';

declare global {
  namespace TezosPayments.ServicesFactoryImplementationContract {
    interface Storage {
      readonly factory: string;
      readonly version: BigNumber;
      readonly disabled: boolean;
    }

    interface Instance extends Truffle.ContractInstance<Storage> {
      set_disabled(disabled: boolean, version?: number, params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
      create_service(
        metadata: string,
        allowedTokensTez: boolean,
        allowedTokensAssets: string[],
        signingKeys: SigningKeys,
        params?: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
    }

    type ServiceParameters = ExcludeTruffleParameters<Parameters<ServicesFactoryImplementationContract.Instance['create_service']>>;
  }

  namespace Truffle {
    interface Artifacts {
      require(name: 'services-factory-implementation'): Contract<TezosPayments.ServicesFactoryImplementationContract.Instance>;
    }
  }
}
