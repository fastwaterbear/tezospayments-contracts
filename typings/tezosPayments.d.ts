declare namespace TezosPayments {
  interface ServiceMetadata {
    name: string;
    links: string[];
    description?: string;
  }

  type OperationTypeName = 'payment' | 'donation';

  type DistributeOperationType<T> = T extends OperationTypeName ? { [name in T]: undefined } : never;
  type OperationType = DistributeOperationType<OperationTypeName>;
}
