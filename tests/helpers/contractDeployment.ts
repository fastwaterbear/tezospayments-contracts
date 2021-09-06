import { MichelsonMap } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';

import { actualServicesFactoryFunctionLambda } from '../testData';
import { serviceMetadataToBytes } from './converters';

export const deployServicesFactory = async (
  contract: Truffle.Contract<TezosPayments.ServicesFactoryContract.Instance>,
  initialStorageState: Pick<
    Truffle.InitialStorageState<TezosPayments.ServicesFactoryContract.Storage>, 'administrator'>
    & Partial<Truffle.InitialStorageState<TezosPayments.ServicesFactoryContract.Storage>>
): Promise<readonly [TezosPayments.ServicesFactoryContract.Instance, TezosPayments.ServicesFactoryContract.Storage]> => {
  const instance = await contract.new({
    services: new MichelsonMap(),
    paused: false,
    service_factory_function: actualServicesFactoryFunctionLambda,
    service_factory_function_version: new BigNumber(0),
    ...initialStorageState
  });
  const storage = await instance.storage();

  return [instance, storage];
};

export const deployService = async (
  contract: Truffle.Contract<TezosPayments.ServiceContract.Instance>,
  initialStorageState: Pick<
    Truffle.InitialStorageState<TezosPayments.ServiceContract.Storage>, 'owner'>
    & Partial<Truffle.InitialStorageState<TezosPayments.ServiceContract.Storage>>
): Promise<readonly [TezosPayments.ServiceContract.Instance, TezosPayments.ServiceContract.Storage]> => {
  const serviceMetadata: TezosPayments.ServiceMetadata = {
    name: 'Test Service',
    links: ['https://test.com']
  };

  const instance = await contract.new({
    version: new BigNumber(0),
    metadata: serviceMetadataToBytes(serviceMetadata),
    allowed_tokens: {
      tez: true,
      assets: []
    },
    allowed_operation_type: new BigNumber(TezosPayments.OperationType.Payment),
    signing_keys: [],
    paused: false,
    deleted: false,
    ...initialStorageState
  });
  const storage = await instance.storage();

  return [instance, storage];
};
