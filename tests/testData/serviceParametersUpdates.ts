import { contractErrors, serviceMetadataToBytes } from '../helpers';
import { invalidOperationTypes } from './operationType';

type ServiceParametersUpdate = Parameters<TezosPayments.ServiceContract.Instance['update_service_parameters']>;
type ServiceParametersUpdateCase = readonly [caseName: string, serviceParametersUpdate: ServiceParametersUpdate];
type InvalidServiceParametersUpdateCase = readonly [
  caseName: string,
  serviceParametersUpdate: ServiceParametersUpdate,
  errorMessage: string | undefined
];

const validServiceMetadata: TezosPayments.ServiceMetadata = {
  name: 'Service A',
  links: [
    'https://servicea.com'
  ],
  description: 'A short description of the Service A'
};
const allowedAssets = ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV'];
const allowedOperationType = TezosPayments.OperationType.Payment;

export const serviceParametersUpdates: readonly ServiceParametersUpdateCase[] = [
  ['only metadata', [serviceMetadataToBytes(validServiceMetadata), undefined, undefined, undefined]],
  ['only allowed tez tokens', [undefined, false, undefined, undefined]],
  ['only allowed assets', [undefined, undefined, allowedAssets, undefined]],
  ['only allowed operation type', [undefined, undefined, undefined, allowedOperationType]],

  ['metadata and allowed tez tokens', [serviceMetadataToBytes(validServiceMetadata), false, undefined, undefined]],
  ['metadata and allowed assets', [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets, undefined]],
  ['metadata and operation type', [serviceMetadataToBytes(validServiceMetadata), undefined, undefined, allowedOperationType]],

  ['allowed tez tokens and assets', [undefined, false, allowedAssets, undefined]],
  ['allowed assets and operation type', [undefined, undefined, allowedAssets, allowedOperationType]],
  ['allowed tez tokens and operation type', [undefined, false, undefined, allowedOperationType]],

  ['metadata, allowed tez tokens and assets', [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets, undefined]],
  ['metadata, allowed tez tokens and operation type', [serviceMetadataToBytes(validServiceMetadata), false, undefined, allowedOperationType]],
  ['metadata, allowed assets and operation type', [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets, allowedOperationType]],
  ['allowed tez tokens, assets and operation type', [undefined, false, allowedAssets, allowedOperationType]],

  ['all parameters', [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets, allowedOperationType]],
];

export const invalidServiceParametersUpdates: readonly InvalidServiceParametersUpdateCase[] = [
  ['empty', [undefined, undefined, undefined, undefined], contractErrors.emptyUpdate],

  ...invalidOperationTypes.map<InvalidServiceParametersUpdateCase>(([invalidOperationType, errorMessage]) => [
    `all parameters with invalid operation type == ${invalidOperationType}`,
    [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets, invalidOperationType],
    errorMessage
  ]),
  ...invalidOperationTypes.map<InvalidServiceParametersUpdateCase>(([invalidOperationType, errorMessage]) => [
    `allowed tez tokens and invalid operation type == ${invalidOperationType}`,
    [undefined, false, undefined, invalidOperationType],
    errorMessage
  ]),
];
