import { contractErrors } from '../helpers';

export const validSigningKeys: readonly TezosPayments.SigningKey[] = [
  ['edpkuRtZToTUQA5hM2CnNppsHBUv6xS8SxjRH7FqA5EoWhx1xNFrUC', null],
  ['sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK', null],
  ['p2pk66XW5w6ryejQmLTD1JA7bdyzQJQNyDf83gahM55LPiWfmWxkU1q', null],
  ['edpkts56Rro7pvsnFWRt9oyB2eJC81sUEMqJphgFegr976NkFLkZMw', 'Key 1'],
  ['sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK', 'Key 2'],
  ['edpkuRtZToTUQA5hM2CnNppsHBUv6xS8SxjRH7FqA5EoWhx1xNFrUC', 'API Key 1'],
  ['sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK', 'API Key 2'],
];

const invalidKeyMichelsonError = 'Key is not valid';
export const invalidSigningKeyTestCases: ReadonlyArray<readonly [
  message: string,
  invalidSigningKey: TezosPayments.SigningKey,
  errorMessage?: string
]> = [
    [
      'Invalid key',
      ['invalid key', null],
      invalidKeyMichelsonError
    ],
    [
      'Invalid key',
      ['edpkts56Rro7pvsnFWRt9oyB2eJC81sUEMqJphgFegr976NkFLkZMt', null],
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (Ed25519)',
      ['edskS7JvBRSUtzzzj875ULcyxdrKoMma4328fHmhAqaAyohJ5MSTHazaaiTkTJbRMWAZ6K23iPD4wBHqYrkmJ4D6LtSBChjCxk', null],
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (Secp256k1)',
      ['spsk1diMvxaoQiiCCy27ftiY215L8paGTUJKbxA92HVRAFa1sFrceT', null],
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (P256)',
      ['p2sk3kH4n9PpGQg4Xk7u2p13KUpnbvNH1hagAATcfmPvGZSJhjukxv', null],
      invalidKeyMichelsonError
    ],
    [
      'Empty key name',
      ['edpkvU6zLEwcsN2T8FQpfYjyYQZdsLATCU34Q8oodLhhk5ZNXWAgrW', ''],
      contractErrors.invalidSigningKey
    ],
    [
      'The length of the key name is less than normal (length < 3)',
      ['edpkuyrcNJxAzWpd4LhqHDkYRMFVqGvGc2KdALRSqztMkMcc3kAEM8', 'AP'],
      contractErrors.invalidSigningKey
    ],
    [
      'The length of the key name is more than normal (length > 30)',
      ['edpkuyrcNJxAzWpd4LhqHDkYRMFVqGvGc2KdALRSqztMkMcc3kAEM8', 'p2sk3kH4n9PpGQg4Xk7u2p13KUpnbvNH1hagAATcfmPvGZSJhjukxv'],
      contractErrors.invalidSigningKey
    ],
  ];
