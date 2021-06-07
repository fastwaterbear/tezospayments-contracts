import { MichelsonMap } from '@taquito/taquito';

import { actualServiceFactoryFunctionLambda } from '../testData';

export const deployServiceFactory = async (
  contract: Truffle.Contract<TezosPayments.ServicesFactoryContract.Instance>,
  initialStorageState: Pick<
    Truffle.InitialStorageState<TezosPayments.ServicesFactoryContract.Storage>, 'administrator'>
    & Partial<Truffle.InitialStorageState<TezosPayments.ServicesFactoryContract.Storage>>
): Promise<readonly [TezosPayments.ServicesFactoryContract.Instance, TezosPayments.ServicesFactoryContract.Storage]> => {
  const instance = await contract.new({
    services: new MichelsonMap(),
    paused: false,
    service_factory_function: actualServiceFactoryFunctionLambda,
    ...initialStorageState
  });
  const storage = await instance.storage();

  return [instance, storage];
};
