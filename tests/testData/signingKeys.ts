import { contractErrors } from '../helpers';

export const validSigningKeys: TezosPayments.SigningKeys = [
  [null, 'edpkuRtZToTUQA5hM2CnNppsHBUv6xS8SxjRH7FqA5EoWhx1xNFrUC'],
  [null, 'sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK'],
  [null, 'p2pk66XW5w6ryejQmLTD1JA7bdyzQJQNyDf83gahM55LPiWfmWxkU1q'],
  ['Key 1', 'edpkts56Rro7pvsnFWRt9oyB2eJC81sUEMqJphgFegr976NkFLkZMw'],
  ['Key 2', 'sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK'],
  ['API Key', 'sppk7c2z8sw34SPsStoy2FYKjQCUWocnTMsYi9HdEQBk7AfrknNL8aK']
];

const invalidKeyMichelsonError = 'Key is not valid';
export const invalidSigningKeyTestCases: ReadonlyArray<readonly [
  message: string,
  invalidSigningKey: TezosPayments.SigningKey,
  errorMessage?: string
]> = [
    [
      'Invalid key',
      [null, 'invalid key'],
      invalidKeyMichelsonError
    ],
    [
      'Invalid key',
      [null, 'edpkts56Rro7pvsnFWRt9oyB2eJC81sUEMqJphgFegr976NkFLkZMt'],
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (Ed25519)',
      [null, 'edskS7JvBRSUtzzzj875ULcyxdrKoMma4328fHmhAqaAyohJ5MSTHazaaiTkTJbRMWAZ6K23iPD4wBHqYrkmJ4D6LtSBChjCxk'],
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (Secp256k1)',
      [null, 'spsk1diMvxaoQiiCCy27ftiY215L8paGTUJKbxA92HVRAFa1sFrceT'],
      invalidKeyMichelsonError
    ],
    [
      'Secret key instead of the public key (P256)',
      [null, 'p2sk3kH4n9PpGQg4Xk7u2p13KUpnbvNH1hagAATcfmPvGZSJhjukxv'],
      invalidKeyMichelsonError
    ],
    [
      'Empty key name',
      ['', 'edpkvU6zLEwcsN2T8FQpfYjyYQZdsLATCU34Q8oodLhhk5ZNXWAgrW'],
      contractErrors.invalidSigningKey
    ],
    [
      'The length of the key name is less than normal (length < 3)',
      ['AP', 'edpkuyrcNJxAzWpd4LhqHDkYRMFVqGvGc2KdALRSqztMkMcc3kAEM8'],
      contractErrors.invalidSigningKey
    ],
    [
      'The length of the key name is more than normal (length > 30)',
      ['p2sk3kH4n9PpGQg4Xk7u2p13KUpnbvNH1hagAATcfmPvGZSJhjukxv', 'edpkuyrcNJxAzWpd4LhqHDkYRMFVqGvGc2KdALRSqztMkMcc3kAEM8'],
      contractErrors.invalidSigningKey
    ],
  ];
