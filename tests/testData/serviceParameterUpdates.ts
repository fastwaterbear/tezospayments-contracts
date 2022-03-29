import { NegativeTestCases, PositiveTestCases, serviceErrors, serviceMetadataToBytes } from '../helpers';

const validServiceMetadata: TezosPayments.ServiceMetadata = {
  name: 'Service A',
  links: [
    'https://servicea.com'
  ],
  description: 'A short description of the Service A'
};
const allowedAssets = ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV'];

export const validServiceParameterUpdatesTestCases: PositiveTestCases<TezosPayments.ServiceContract.ServiceParameterUpdates> = [
  ['Only metadata', [serviceMetadataToBytes(validServiceMetadata), undefined, undefined]],
  ['Only allowed tez tokens', [undefined, false, undefined]],
  ['Only allowed assets', [undefined, undefined, allowedAssets]],

  ['Metadata and allowed tez tokens', [serviceMetadataToBytes(validServiceMetadata), false, undefined]],
  ['Metadata and allowed assets', [serviceMetadataToBytes(validServiceMetadata), undefined, allowedAssets]],
  ['Allowed tez tokens and assets', [undefined, false, allowedAssets]],

  ['All parameters', [serviceMetadataToBytes(validServiceMetadata), false, allowedAssets]],
];

export const invalidServiceParameterUpdatesTestCases: NegativeTestCases<TezosPayments.ServiceContract.ServiceParameterUpdates> = [
  ['Empty', [undefined, undefined, undefined], serviceErrors.emptyUpdate],
];
