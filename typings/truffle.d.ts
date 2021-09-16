declare const contract: Truffle.ContractFunction;
declare const artifacts: Truffle.Artifacts;

declare namespace Truffle {
  type Accounts = string[];

  interface ContractFunction extends Mocha.SuiteFunction {
    (title: string, fn: (this: Mocha.Suite, accounts: Truffle.Accounts) => void): Mocha.Suite;
    only: ExclusiveContractFunction;
    skip: PendingContractFunction;
  }

  interface ExclusiveContractFunction extends Mocha.ExclusiveSuiteFunction {
    (title: string, fn: (this: Mocha.Suite, accounts: Truffle.Accounts) => void): Mocha.Suite;
  }

  interface PendingContractFunction extends Mocha.PendingSuiteFunction {
    (title: string, fn: (this: Mocha.Suite, accounts: Truffle.Accounts) => void): Mocha.Suite | void;
  }

  interface Contract<TInstance extends ContractInstance<unknown>> {
    autoGas: boolean;

    'new'<TTxParams extends unknown[] = []>(
      initialStorageState: InitialStorageState<ContractStorage<TInstance>>,
      txParams?: TTxParams
    ): Promise<TInstance>;
    at(address: string): Promise<TInstance>;
    deployed(): Promise<TInstance>;
  }

  interface ContractInstance<TStorage> {
    readonly address: string;

    storage(): Promise<TStorage>;
  }

  type ContractStorage<TInstance extends ContractInstance<unknown>> = (
    TInstance['storage'] extends () => Promise<infer Storage> ? Storage : never
  );

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Artifacts {
  }

  interface Deployer {
    deploy<TInstance extends ContractInstance<unknown>>(
      contract: Contract<TInstance>,
      initialStorageState: InitialStorageState<ContractStorage<TInstance>>
    ): Promise<void>;
  }

  interface TransactionParameters {
    amount?: number;
    fee?: number;
    gasLimit?: number;
  }

  interface TransactionResult {
    receipt: PromiseType<ReturnType<import('@taquito/taquito').ContractProvider['transfer']>>,
    tx: string;
  }

  type InitialStorageState<T> = T extends import('@taquito/taquito').BigMapAbstraction
    ? import('@taquito/michelson-encoder').MichelsonMap<import('@taquito/michelson-encoder').MichelsonMapKey, unknown>
    : {
      [P in keyof T]: InitialStorageState<T[P]>
    };
}
