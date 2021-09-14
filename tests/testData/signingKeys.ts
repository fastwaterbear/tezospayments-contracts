import { contractErrors } from '../helpers';

export const validSigningKeys: readonly TezosPayments.SigningKey[] = [
  { public_key: 'edpkuRtZToTUQA5hM2CnNppsHBUv6xS8SxjRH7FqA5EoWhx1xNFrUC', name: null },
  { public_key: 'sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK', name: null },
  { public_key: 'p2pk66XW5w6ryejQmLTD1JA7bdyzQJQNyDf83gahM55LPiWfmWxkU1q', name: null },
  { public_key: 'edpkts56Rro7pvsnFWRt9oyB2eJC81sUEMqJphgFegr976NkFLkZMw', name: 'Key 1' },
  { public_key: 'sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK', name: 'Key 2' },
  { public_key: 'edpkuRtZToTUQA5hM2CnNppsHBUv6xS8SxjRH7FqA5EoWhx1xNFrUC', name: 'API Key 1' },
  { public_key: 'sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK', name: 'API Key 2' },
];

const invalidKeyMichelsonError = 'Key is not valid';
export const invalidSigningKeyTestCases: ReadonlyArray<readonly [
  message: string,
  invalidSigningKey: TezosPayments.SigningKey,
  errorMessage?: string
]> = [
    [
      'Invalid key',
      { public_key: 'invalid key', name: null },
      invalidKeyMichelsonError
    ],
    [
      'Invalid key',
      { public_key: 'edpkts56Rro7pvsnFWRt9oyB2eJC81sUEMqJphgFegr976NkFLkZMt', name: null },
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (Ed25519)',
      { public_key: 'edskS7JvBRSUtzzzj875ULcyxdrKoMma4328fHmhAqaAyohJ5MSTHazaaiTkTJbRMWAZ6K23iPD4wBHqYrkmJ4D6LtSBChjCxk', name: null },
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (Secp256k1)',
      { public_key: 'spsk1diMvxaoQiiCCy27ftiY215L8paGTUJKbxA92HVRAFa1sFrceT', name: null },
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (P256)',
      { public_key: 'p2sk3kH4n9PpGQg4Xk7u2p13KUpnbvNH1hagAATcfmPvGZSJhjukxv', name: null },
      invalidKeyMichelsonError
    ],
    [
      'Empty key name',
      { public_key: 'edpkvU6zLEwcsN2T8FQpfYjyYQZdsLATCU34Q8oodLhhk5ZNXWAgrW', name: '' },
      contractErrors.invalidSigningKey
    ],
    [
      'The length of the key name is less than normal (length < 3)',
      { public_key: 'edpkuyrcNJxAzWpd4LhqHDkYRMFVqGvGc2KdALRSqztMkMcc3kAEM8', name: 'AP' },
      contractErrors.invalidSigningKey
    ],
    [
      'The length of the key name is more than normal (length > 30)',
      { public_key: 'edpkuyrcNJxAzWpd4LhqHDkYRMFVqGvGc2KdALRSqztMkMcc3kAEM8', name: 'p2sk3kH4n9PpGQg4Xk7u2p13KUpnbvNH1hagAATcfmPvGZSJhjukxv' },
      contractErrors.invalidSigningKey
    ],
  ];
