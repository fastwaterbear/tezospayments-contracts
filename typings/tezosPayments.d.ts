declare namespace TezosPayments {
  interface ServiceMetadata {
    name: string;
    links: string[];
    description?: string;
  }

  type SigningKeys = ReadonlyArray<readonly [keyName: string | null, key: string]>;

  const enum OperationType {
    Payment = 1,
    Donation = 2,
    All = Payment | Donation
  }
}
