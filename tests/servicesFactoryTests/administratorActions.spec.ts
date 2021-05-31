import { MichelsonMap } from '@taquito/taquito';
import { expect } from 'chai';

import { useLastTezosToolkit } from '../helpers/useLastTezosToolkit';
import { admins } from '../testData/accounts';
import { notImplementedLambda } from '../testData/serviceFactoryFunctionLambdas';

const [servicesFactoryContract] = useLastTezosToolkit(artifacts.require('services-factory'));

contract('Services Factory | Administrator Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let servicesFactoryContractInstance: ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: ServicesFactoryContract.Storage;

  beforeEach('Deploy new instance', async () => {
    servicesFactoryContractInstance = await servicesFactoryContract.new({
      services: new MichelsonMap(),
      administrator: currentAccountAddress,
      paused: false,
      service_factory_function: notImplementedLambda,
    });
    servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();
  });

  it('should prevent calls from non-administrators', async () => {
    servicesFactoryContractInstance = await servicesFactoryContract.new({
      services: new MichelsonMap(),
      administrator: admins[0].pkh,
      paused: false,
      service_factory_function: notImplementedLambda,
    });
    servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();

    const errorMessage = 'Only administrator can do this';
    await expect(servicesFactoryContractInstance.administrator_action('set_administrator', currentAccountAddress))
      .to.be.rejectedWith(errorMessage);
    await expect(servicesFactoryContractInstance.administrator_action('set_pause', true))
      .to.be.rejectedWith(errorMessage);
    await expect(servicesFactoryContractInstance.administrator_action('set_service_factory_function', notImplementedLambda))
      .to.be.rejectedWith(errorMessage);

    const storageAfterActions = await servicesFactoryContractInstance.storage();
    expect(storageAfterActions).deep.equal(servicesFactoryContractStorage);
  });
});
