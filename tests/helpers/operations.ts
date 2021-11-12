import {
  InternalOperationResult, OperationBalanceUpdates, OperationContentsAndResult,
  OperationResultOrigination, OperationResultTransaction, OpKind
} from '@taquito/rpc';
import { TransactionOperation } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

export const isInternalOperationResult = (
  operationResult: OperationContentsAndResult | InternalOperationResult
): operationResult is InternalOperationResult => {
  return !!(operationResult as InternalOperationResult).result;
};

export const getBalanceUpdates = (operationResult: OperationContentsAndResult | InternalOperationResult): OperationBalanceUpdates => {
  if (isInternalOperationResult(operationResult)) {
    switch (operationResult.kind) {
      case OpKind.TRANSACTION:
      case OpKind.ORIGINATION:
        return (operationResult.result as OperationResultTransaction | OperationResultOrigination).balance_updates || [];
      default:
        return [];
    }
  }

  switch (operationResult.kind) {
    case OpKind.TRANSACTION:
    case OpKind.ORIGINATION: {
      const updates = operationResult.metadata.operation_result.balance_updates;
      const internalUpdates = operationResult.metadata.internal_operation_results?.flatMap(getBalanceUpdates);

      return updates && internalUpdates
        ? updates.concat(internalUpdates)
        : updates || internalUpdates || [];
    }
    default:
      return [];
  }
};

export const getBalanceUpdate = (operation: TransactionOperation, address: string, includeFees = true) => {
  return operation.results
    .reduce(
      (result, operationResult) => {
        const updates = getBalanceUpdates(operationResult);
        const updatesSum = updates.filter(u => u.contract === address)
          .reduce((acc, update) => acc.plus(update.change), new BigNumber(0));

        return result.plus(updatesSum);
      },
      new BigNumber(includeFees && address === operation.source ? -operation.fee : 0)
    );
};
