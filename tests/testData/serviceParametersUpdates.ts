import { serviceMetadataToBytes } from '../helpers';

type ServiceParametersUpdate = Parameters<TezosPayments.ServiceContract.Instance['update_service_parameters']>;

const validServiceMetadata: TezosPayments.ServiceMetadata = {
  name: 'Service A',
  links: [
    'https://servicea.com'
  ],
  description: 'A short description of the Service A'
};
const allowedAssets = ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV'];
const allowedOperationTypes: readonly TezosPayments.OperationType[] = [{ payment: undefined }];

export const serviceParametersUpdates = {
  'empty': [undefined, undefined, undefined, undefined] as ServiceParametersUpdate,

  'only metadata': [serviceMetadataToBytes(validServiceMetadata), undefined, undefined, undefined] as ServiceParametersUpdate,
  'only allowed tez tokens': [undefined, false, undefined, undefined] as ServiceParametersUpdate,
  'only allowed assets': [undefined, undefined, allowedAssets, undefined] as ServiceParametersUpdate,
  'only allowed operation types': [undefined, undefined, undefined, allowedOperationTypes] as ServiceParametersUpdate,

  'metadata and allowed tez tokens': [serviceMetadataToBytes(validServiceMetadata), false, undefined, undefined] as ServiceParametersUpdate,
  'metadata and allowed assets': [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets, undefined] as ServiceParametersUpdate,
  'metadata and operation types': [serviceMetadataToBytes(validServiceMetadata), undefined, undefined, allowedOperationTypes] as ServiceParametersUpdate,

  'allowed tez tokens and assets': [undefined, false, allowedAssets, undefined] as ServiceParametersUpdate,
  'allowed assets and operation types': [undefined, undefined, allowedAssets, allowedOperationTypes] as ServiceParametersUpdate,
  'allowed tez tokens and operation types': [undefined, false, undefined, allowedOperationTypes] as ServiceParametersUpdate,

  'metadata, allowed tez tokens and assets': [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets, undefined] as ServiceParametersUpdate,
  'metadata, allowed tez tokens and operation types': [serviceMetadataToBytes(validServiceMetadata), false, undefined, allowedOperationTypes] as ServiceParametersUpdate,
  'metadata, allowed assets and operation types': [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets, allowedOperationTypes] as ServiceParametersUpdate,
  'allowed tez tokens, assets and operation types': [undefined, false, allowedAssets, allowedOperationTypes] as ServiceParametersUpdate,

  'all parameters': [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets, allowedOperationTypes] as ServiceParametersUpdate,
} as const;
