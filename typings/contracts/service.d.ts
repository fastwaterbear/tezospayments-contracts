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
      readonly allowed_operation_type: BigNumber;
      readonly owner: string;
      readonly signing_keys: SigningKeys;
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
        allowedOperationType: OperationType | undefined,
        params?: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
      update_signing_keys(signingKeyUpdates: SigningKeyUpdates): Promise<Truffle.TransactionResult>;
    }

    interface Instance extends Truffle.ContractInstance<Storage>, OwnerActions {
      send_payment(
        paymentId: string,
        asset: void,
        signature: string,
        params: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
      send_payment(
        paymentId: string,
        assetTokenAddress: string,
        assetTokenId: number | null,
        assetValue: number,
        signature: string,
        params?: Truffle.TransactionParameters
      ): Promise<Truffle.TransactionResult>;
      owner_action<T extends keyof OwnerActions>(actionName: T, ...params: Parameters<OwnerActions[T]>): Promise<Truffle.TransactionResult>;
    }

    type ServiceParameterUpdates = ExcludeTruffleParameters<Parameters<ServiceContract.Instance['update_service_parameters']>>;
  }

  namespace Truffle {
    interface Artifacts {
      require(name: 'service'): Contract<TezosPayments.ServiceContract.Instance>;
    }
  }
}
