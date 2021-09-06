declare namespace TezosPayments {
  interface ServiceMetadata {
    name: string;
    links: string[];
    description?: string;
  }

  type SigningKey = readonly [keyName: string | null, key: string]
    | { 0: string | null, 1: string };
  type SigningKeys = readonly SigningKey[];

  const enum OperationType {
    Payment = 1,
    Donation = 2,
    All = Payment | Donation
  }
}
