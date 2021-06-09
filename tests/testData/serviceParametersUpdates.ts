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

export const serviceParametersUpdates = {
  'empty': [undefined, undefined, undefined] as ServiceParametersUpdate,
  'only metadata': [serviceMetadataToBytes(validServiceMetadata), undefined, undefined] as ServiceParametersUpdate,
  'only allowed tez tokens': [undefined, false, undefined] as ServiceParametersUpdate,
  'only allowed assets': [undefined, undefined, allowedAssets] as ServiceParametersUpdate,
  'metadata and allowed tez tokens': [serviceMetadataToBytes(validServiceMetadata), false, undefined] as ServiceParametersUpdate,
  'metadata and allowed assets': [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets] as ServiceParametersUpdate,
  'only allowed tokens': [undefined, false, allowedAssets] as ServiceParametersUpdate,
  'all parameters': [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets] as ServiceParametersUpdate,
} as const;
