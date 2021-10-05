import { NegativeTestCase, NegativeTestCases, PositiveTestCases, serviceErrors, serviceMetadataToBytes } from '../helpers';
import { invalidOperationTypeTestCases } from './operationType';

const validServiceMetadata: TezosPayments.ServiceMetadata = {
  name: 'Service A',
  links: [
    'https://servicea.com'
  ],
  description: 'A short description of the Service A'
};
const allowedAssets = ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV'];
const allowedOperationType = TezosPayments.OperationType.Payment;

export const validServiceParameterUpdatesTestCases: PositiveTestCases<TezosPayments.ServiceContract.ServiceParameterUpdates> = [
  ['Only metadata', [serviceMetadataToBytes(validServiceMetadata), undefined, undefined, undefined]],
  ['Only allowed tez tokens', [undefined, false, undefined, undefined]],
  ['Only allowed assets', [undefined, undefined, allowedAssets, undefined]],
  ['Only allowed operation type', [undefined, undefined, undefined, allowedOperationType]],

  ['Metadata and allowed tez tokens', [serviceMetadataToBytes(validServiceMetadata), false, undefined, undefined]],
  ['Metadata and allowed assets', [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets, undefined]],
  ['Metadata and operation type', [serviceMetadataToBytes(validServiceMetadata), undefined, undefined, allowedOperationType]],

  ['Allowed tez tokens and assets', [undefined, false, allowedAssets, undefined]],
  ['Allowed assets and operation type', [undefined, undefined, allowedAssets, allowedOperationType]],
  ['Allowed tez tokens and operation type', [undefined, false, undefined, allowedOperationType]],

  ['Metadata, allowed tez tokens and assets', [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets, undefined]],
  ['Metadata, allowed tez tokens and operation type', [serviceMetadataToBytes(validServiceMetadata), false, undefined, allowedOperationType]],
  ['Metadata, allowed assets and operation type', [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets, allowedOperationType]],
  ['Allowed tez tokens, assets and operation type', [undefined, false, allowedAssets, allowedOperationType]],

  ['All parameters', [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets, allowedOperationType]],
];

export const invalidServiceParameterUpdatesTestCases: NegativeTestCases<TezosPayments.ServiceContract.ServiceParameterUpdates> = [
  ['Empty', [undefined, undefined, undefined, undefined], serviceErrors.emptyUpdate],

  ...invalidOperationTypeTestCases.map<NegativeTestCase<TezosPayments.ServiceContract.ServiceParameterUpdates>>(
    ([invalidOperationTypeDescription, invalidOperationType, errorMessage]) => [
      `all parameters with invalid operation type == ${invalidOperationType} (${invalidOperationTypeDescription})`,
      [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets, invalidOperationType],
      errorMessage
    ]
  ),
  ...invalidOperationTypeTestCases.map<NegativeTestCase<TezosPayments.ServiceContract.ServiceParameterUpdates>>(
    ([invalidOperationTypeDescription, invalidOperationType, errorMessage]) => [
      `allowed tez tokens and invalid operation type == ${invalidOperationType} (${invalidOperationTypeDescription})`,
      [undefined, false, undefined, invalidOperationType],
      errorMessage
    ]
  ),
];
