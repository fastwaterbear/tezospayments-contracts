import { MichelsonMap } from '@taquito/taquito';

import { commonErrors, createSigningKeyMichelsonMap, NegativeTestCase, NegativeTestCases, serviceMetadataToBytes } from '../helpers';
import { invalidSigningKeyTestCases, validSigningKeys } from './signingKeys';

export const validServiceParameters: readonly TezosPayments.ServicesFactoryImplementationContract.ServiceParameters[] = [
  [
    serviceMetadataToBytes({
      name: 'Test Service 1',
      links: ['https://test.com']
    }),
    true,
    ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV', 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf'],
    createSigningKeyMichelsonMap([])
  ],
  [
    serviceMetadataToBytes({
      name: 'Test Service 2',
      links: ['https://test.com', 'https://test.org']
    }),
    true,
    [],
    createSigningKeyMichelsonMap([])
  ],
  [
    serviceMetadataToBytes({
      name: 'Test Service 3',
      links: [],
      description: 'A description of the Test Service 3'
    }),
    false,
    ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV'],
    createSigningKeyMichelsonMap([])
  ],
  [
    serviceMetadataToBytes({
      name: 'Test Service 4',
      links: []
    }),
    true,
    ['KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf'],
    createSigningKeyMichelsonMap([
      { public_key: 'edpkuE58W2PXAXGRHBZimjY3o4PdaTWJA9ACKQTbeK5rcYUT4dAcoH', name: 'API0' }
    ])
  ],
  [
    serviceMetadataToBytes({
      name: 'Test Service 5',
      links: ['https://test5.com']
    }),
    true,
    ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV'],
    createSigningKeyMichelsonMap(validSigningKeys)
  ],
];

export const invalidServiceParametersTestCases: NegativeTestCases<TezosPayments.ServicesFactoryImplementationContract.ServiceParameters> = [
  [
    'Invalid metadata',
    [
      'invalid metadata',
      true,
      ['KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt'],
      createSigningKeyMichelsonMap([])
    ],
    'Invalid bytes'
  ],
  [
    'There is not allowed tokens',
    [
      validServiceParameters[0]![0],
      false,
      [],
      createSigningKeyMichelsonMap([])
    ],
    commonErrors.noAllowedTokens
  ],
  [
    'Duplicate assets',
    [
      validServiceParameters[1]![0],
      true,
      ['KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt', 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf', 'KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt'],
      createSigningKeyMichelsonMap([])
    ],
    'duplicate_set_values_in_literal'
  ],
  ...invalidSigningKeyTestCases.map<NegativeTestCase<TezosPayments.ServicesFactoryImplementationContract.ServiceParameters>>(
    ([invalidSigningKeyDescription, invalidSigningKey, errorMessage]) => [
      `signing key is invalid. ${invalidSigningKeyDescription}`,
      [
        validServiceParameters[0]![0],
        true,
        [],
        MichelsonMap.fromLiteral({ [invalidSigningKey.public_key]: invalidSigningKey }) as TezosPayments.SigningKeys
      ],
      errorMessage
    ]
  ),
];
