import { BigMapAbstraction } from '@taquito/taquito';

declare global {
  namespace ServicesFactoryContract {
    type Storage = {
      readonly services: BigMapAbstraction;
      readonly administrator: string;
      readonly paused: boolean;
      readonly service_factory_function?: readonly unknown[];
    };

    interface Instance extends Truffle.ContractInstance<Storage> {
      set_pause(entrypointParameter: boolean, params?: unknown): Promise<Truffle.TransactionResult>;
      set_service_factory_function(lambda: readonly unknown[], params?: unknown): Promise<Truffle.TransactionResult>;

      administrator_action(entrypointParameter: 'set_service_factory_function', lambda: readonly unknown[], params?: unknown): Promise<Truffle.TransactionResult>;
    }
  }

  namespace Truffle {
    interface Artifacts {
      require(name: 'services-factory'): Contract<ServicesFactoryContract.Instance>;
    }
  }
}
