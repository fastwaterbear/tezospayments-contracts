import { commonErrors, NegativeTestCases } from '../helpers';

export const invalidOperationTypeTestCases: NegativeTestCases<number> = [
  ['Negative number', -1],
  ['Non-integer number', 1.1],
  ['Zero', 0, commonErrors.invalidOperationType],
  ['Unknown operation type', 4, commonErrors.invalidOperationType],
  ['Unknown operation type', 100, commonErrors.invalidOperationType],
];
