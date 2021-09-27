/* eslint-disable @typescript-eslint/no-explicit-any */
type PromiseType<T extends Promise<unknown>> = T extends Promise<infer R> ? R : unknown;

type ExcludeTruffleParameters<T extends [...parameters: any, truffleParameters?: Truffle.TransactionParameters]> = T extends [
  ...parameters: infer Parameters,
  truffleParameters?: Truffle.TransactionParameters
] ? Parameters : never;
