declare namespace TezosPayments {
  interface ServiceMetadata {
    name: string;
    links: string[];
    description?: string;
  }

  const enum OperationType {
    Payment = 1,
    Donation = 2,
    All = Payment | Donation
  }
}
