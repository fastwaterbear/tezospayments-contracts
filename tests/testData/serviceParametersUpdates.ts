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
  'Empty': [undefined, undefined, undefined] as ServiceParametersUpdate,
  'Only metadata': [serviceMetadataToBytes(validServiceMetadata), undefined, undefined] as ServiceParametersUpdate,
  'Only allowed tez tokens': [undefined, false, undefined] as ServiceParametersUpdate,
  'Only allowed assets': [undefined, undefined, allowedAssets] as ServiceParametersUpdate,
  'Metadata and allowed tez tokens': [serviceMetadataToBytes(validServiceMetadata), false, undefined] as ServiceParametersUpdate,
  'Metadata and allowed assets': [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets] as ServiceParametersUpdate,
  'Only allowed tokens': [undefined, false, allowedAssets] as ServiceParametersUpdate,
  'All parameters': [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets] as ServiceParametersUpdate,
} as const;
