export type PositiveTestCase<TData> = readonly [
  message: string,
  data: TData
];
export type PositiveTestCases<TData> = ReadonlyArray<PositiveTestCase<TData>>;

type NegativeTestCaseError = string | (new (message?: string) => Error);
export type NegativeTestCase<TData, TError extends NegativeTestCaseError = string> = readonly [
  message: string,
  data: TData,
  expectedErrors?: TError
];
export type NegativeTestCases<TData, TError extends NegativeTestCaseError = string> = ReadonlyArray<NegativeTestCase<TData, TError>>;
