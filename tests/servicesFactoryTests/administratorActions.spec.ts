import { MichelsonMap } from '@taquito/taquito';

import { useLastTezosToolkit } from '../helpers/useLastTezosToolkit';
import { notImplementedLambda } from '../testData/serviceFactoryFunctionLambdas';

const [servicesFactoryContract] = useLastTezosToolkit(artifacts.require('services-factory'));

contract('Services Factory | Administrator Actions | Set_administrator', accounts => {
  const currentAccount = accounts[0]!;

  let servicesFactoryContractInstance: ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: ServicesFactoryContract.Storage;

  beforeEach('Deploy new instance', async () => {
    servicesFactoryContractInstance = await servicesFactoryContract.new({
      services: new MichelsonMap(),
      administrator: currentAccount,
      paused: false,
      service_factory_function: notImplementedLambda,
    });
    servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();
  });

  it('should prevent calls from non-administrators', async () => {
    // TODO
  });
});
