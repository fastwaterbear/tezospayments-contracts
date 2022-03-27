import { BigNumber } from 'bignumber.js';

declare global {
  namespace TezosPayments.DonationContract {
    interface Storage {
      readonly previous_contract: string;
      readonly administrator: string;
      readonly pending_administrator: string | null;
      readonly disabled: boolean;
    }

    interface AdministratorActions {
      set_administrator(newAdministrator: string, params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
      confirm_administrator(params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
      set_disabled(disabled: boolean, params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
    }

    interface Instance extends Truffle.ContractInstance<Storage>, AdministratorActions {
      send_donation(
        asset: void,
        payload: string,
        params: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
      send_donation(
        assetTokenAddress: string,
        assetTokenId: number | null,
        assetValue: BigNumber,
        payload: string,
        params?: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
      administrator_action<T extends keyof AdministratorActions>(actionName: T, ...params: Parameters<AdministratorActions[T]>): Promise<Truffle.TransactionResult>;
    }
  }

  namespace Truffle {
    interface Artifacts {
      require(name: 'donation'): Contract<TezosPayments.DonationContract.Instance>;
    }
  }
}
