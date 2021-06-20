import { contractErrors } from '../helpers';

type InvalidOperationType = readonly [value: number, errorMessage: string | undefined];

export const invalidOperationTypes: readonly InvalidOperationType[] = [
  [-1, undefined],
  [1.1, undefined],
  [0, contractErrors.invalidOperationType],
  [4, contractErrors.invalidOperationType],
  [100, contractErrors.invalidOperationType],
];
