import { BigMapAbstraction } from '@taquito/taquito';

declare global {
  namespace ServicesFactoryContract {
    type Storage = {
      readonly services: BigMapAbstraction;
      readonly administrator: string;
      readonly paused: boolean;
      readonly service_factory_function?: readonly unknown[];
    };

    interface AdministratorActions {
      set_administrator(newAdministrator: string, params?: unknown): Promise<Truffle.TransactionResult>;
      set_pause(paused: boolean, params?: unknown): Promise<Truffle.TransactionResult>;
      set_service_factory_function(lambda: readonly unknown[], params?: unknown): Promise<Truffle.TransactionResult>;
    }

    interface Instance extends Truffle.ContractInstance<Storage>, AdministratorActions {
      administrator_action<T extends keyof AdministratorActions>(actionName: T, ...params: Parameters<AdministratorActions[T]>): Promise<Truffle.TransactionResult>;
    }
  }

  namespace Truffle {
    interface Artifacts {
      require(name: 'services-factory'): Contract<ServicesFactoryContract.Instance>;
    }
  }
}
