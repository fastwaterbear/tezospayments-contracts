import { BigNumber } from 'bignumber.js';

declare global {
  namespace TezosPayments.ServiceContract {
    interface Storage {
      readonly version: BigNumber;
      readonly metadata: string;
      readonly allowed_tokens: {
        readonly tez: boolean;
        readonly assets: readonly string[];
      };
      readonly owner: string;
      readonly paused: boolean;
      readonly deleted: boolean;
    }

    interface OwnerActions {
      set_owner(newOwner: string, params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
      set_pause(paused: boolean, params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
      set_deleted(deleted: boolean, params?: Truffle.TransactionParameters): Promise<Truffle.TransactionResult>;
      update_service_parameters(
        metadata: string | undefined,
        allowedTokensTez: boolean | undefined,
        allowedTokensAssets: string[] | undefined,
        params?: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
    }

    interface Instance extends Truffle.ContractInstance<Storage>, OwnerActions {
      send_payment(
        assetTokenAddress: void,
        payloadType: 'public' | 'private',
        payload: string,
        assetValue: void,
        params: Truffle.TransactionParameters & { amount: number }
      ): Promise<Truffle.TransactionResult>;
      send_payment(
        assetTokenAddress: void,
        payloadType: 'public_and_private',
        public_payload: string,
        private_payload: string,
        assetValue: void,
        params: Truffle.TransactionParameters & { amount: number }
      ): Promise<Truffle.TransactionResult>;
      send_payment(
        assetTokenAddress: string,
        assetValue: number,
        payloadType: 'public' | 'private',
        payload: string,
        params?: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
      send_payment(
        assetTokenAddress: string,
        assetValue: number,
        payloadType: 'public_and_private',
        public_payload: string,
        private_payload: string,
        params?: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
      owner_action<T extends keyof OwnerActions>(actionName: T, ...params: Parameters<OwnerActions[T]>): Promise<Truffle.TransactionResult>;
    }
  }

  namespace Truffle {
    interface Artifacts {
      require(name: 'service'): Contract<TezosPayments.ServiceContract.Instance>;
    }
  }
}
