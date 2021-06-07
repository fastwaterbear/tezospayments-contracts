declare namespace TezosPayments.ServiceContract {
  interface Storage {
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
    set_owner(newOwner: string, params?: unknown): Promise<Truffle.TransactionResult>;
    set_pause(paused: boolean, params?: unknown): Promise<Truffle.TransactionResult>;
    set_deleted(deleted: boolean, params?: unknown): Promise<Truffle.TransactionResult>;
    update_service_parameters(
      metadata: string | undefined,
      allowedTokensTez: boolean | undefined,
      allowedTokensAssets: string[] | undefined,
      params?: unknown
    ): Promise<Truffle.TransactionResult>;
  }

  interface Instance extends Truffle.ContractInstance<Storage>, OwnerActions {
    owner_action<T extends keyof OwnerActions>(actionName: T, ...params: Parameters<OwnerActions[T]>): Promise<Truffle.TransactionResult>;
  }
}

declare namespace Truffle {
  interface Artifacts {
    require(name: 'service'): Contract<TezosPayments.ServiceContract.Instance>;
  }
}
