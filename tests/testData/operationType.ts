import { contractErrors, NegativeTestCases } from '../helpers';

export const invalidOperationTypeTestCases: NegativeTestCases<number> = [
  ['Negative number', -1],
  ['Non-integer number', 1.1],
  ['Zero', 0, contractErrors.invalidOperationType],
  ['Unknown operation type', 4, contractErrors.invalidOperationType],
  ['Unknown operation type', 100, contractErrors.invalidOperationType],
];
