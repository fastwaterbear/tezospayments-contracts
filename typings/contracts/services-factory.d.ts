import { BigMapAbstraction } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';

declare global {
  namespace TezosPayments.ServicesFactoryContract {
    interface Storage {
      readonly services: BigMapAbstraction;
      readonly administrator: string;
      readonly paused: boolean;
      readonly service_factory_function?: readonly unknown[];
      readonly service_factory_function_version: BigNumber;
    }

    interface AdministratorActions {
      set_administrator(newAdministrator: string, params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
      set_pause(paused: boolean, params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
      set_service_factory_function(lambda: readonly unknown[], params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
    }

    interface Instance extends Truffle.ContractInstance<Storage>, AdministratorActions {
      create_service(
        metadata: string,
        allowedTokensTez: boolean,
        allowedTokensAssets: string[],
        params?: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
      administrator_action<T extends keyof AdministratorActions>(actionName: T, ...params: Parameters<AdministratorActions[T]>): Promise<Truffle.TransactionResult>;
    }
  }

  namespace Truffle {
    interface Artifacts {
      require(name: 'services-factory'): Contract<TezosPayments.ServicesFactoryContract.Instance>;
    }
  }
}
