import { MichelsonMap } from '@taquito/taquito';

import { commonErrors, createSigningKeyMichelsonMap, NegativeTestCase, NegativeTestCases, serviceMetadataToBytes } from '../helpers';
import { invalidOperationTypeTestCases } from './operationType';
import { invalidSigningKeyTestCases, validSigningKeys } from './signingKeys';

export const validServiceParameters: readonly TezosPayments.ServicesFactoryImplementationContract.ServiceParameters[] = [
  [
    serviceMetadataToBytes({
      name: 'Test Service 1',
      links: ['https://test.com']
    }),
    true,
    ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV', 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf'],
    TezosPayments.OperationType.Payment,
    createSigningKeyMichelsonMap([])
  ],
  [
    serviceMetadataToBytes({
      name: 'Test Service 2',
      links: ['https://test.com', 'https://test.org']
    }),
    true,
    [],
    TezosPayments.OperationType.Donation,
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
    TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
    createSigningKeyMichelsonMap([])
  ],
  [
    serviceMetadataToBytes({
      name: 'Test Service 4',
      links: []
    }),
    true,
    ['KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf'],
    TezosPayments.OperationType.Payment,
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
    TezosPayments.OperationType.All,
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
      TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
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
      TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
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
      TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
      createSigningKeyMichelsonMap([])
    ],
    'duplicate_set_values_in_literal'
  ],
  ...invalidOperationTypeTestCases.map<NegativeTestCase<TezosPayments.ServicesFactoryImplementationContract.ServiceParameters>>(
    ([invalidOperationTypeDescription, invalidOperationType, errorMessage]) => [
      `allowed operation type is invalid. The allowed operation type == ${invalidOperationType} (${invalidOperationTypeDescription})`,
      [
        validServiceParameters[0]![0],
        true,
        [],
        invalidOperationType,
        createSigningKeyMichelsonMap([])
      ],
      errorMessage
    ]
  ),
  ...invalidSigningKeyTestCases.map<NegativeTestCase<TezosPayments.ServicesFactoryImplementationContract.ServiceParameters>>(
    ([invalidSigningKeyDescription, invalidSigningKey, errorMessage]) => [
      `signing key is invalid. ${invalidSigningKeyDescription}`,
      [
        validServiceParameters[0]![0],
        true,
        [],
        TezosPayments.OperationType.All,
        MichelsonMap.fromLiteral({ [invalidSigningKey.public_key]: invalidSigningKey }) as TezosPayments.SigningKeys
      ],
      errorMessage
    ]
  ),
];
