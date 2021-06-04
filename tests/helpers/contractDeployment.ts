import { MichelsonMap } from '@taquito/taquito';

import { createEmptyContractLambda } from '../testData';

export const deployServiceFactory = async (
  contract: Truffle.Contract<ServicesFactoryContract.Instance>,
  initialStorageState: Pick<Truffle.InitialStorageState<ServicesFactoryContract.Storage>, 'administrator'> & Partial<Truffle.InitialStorageState<ServicesFactoryContract.Storage>>
): Promise<readonly [ServicesFactoryContract.Instance, ServicesFactoryContract.Storage]> => {
  const instance = await contract.new({
    services: new MichelsonMap(),
    paused: false,
    service_factory_function: createEmptyContractLambda,
    ...initialStorageState
  });
  const storage = await instance.storage();

  return [instance, storage];
};
