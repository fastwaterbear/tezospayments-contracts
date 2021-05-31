import { MichelsonMap } from '@taquito/taquito';
import { expect } from 'chai';

import { useLastTezosToolkit, contractErrors } from '../helpers';
import { admins, notImplementedLambda } from '../testData';

const [servicesFactoryContract] = useLastTezosToolkit(artifacts.require('services-factory'));

contract('Services Factory | Administrator Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let servicesFactoryContractInstance: ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: ServicesFactoryContract.Storage;

  const deployNewInstanceAndAssign = async (storage?: Partial<Parameters<typeof servicesFactoryContract['new']>[0]>) => {
    servicesFactoryContractInstance = await servicesFactoryContract.new({
      services: new MichelsonMap(),
      administrator: currentAccountAddress,
      paused: false,
      service_factory_function: notImplementedLambda,
      ...storage
    });
    servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();
  };

  beforeEach('Deploy new instance', () => deployNewInstanceAndAssign());

  it('should prevent calls from non-administrators', async () => {
    await deployNewInstanceAndAssign({ administrator: admins[0].pkh });

    await expect(servicesFactoryContractInstance.set_administrator(currentAccountAddress))
      .to.be.rejectedWith(contractErrors.notAdministrator);
    await expect(servicesFactoryContractInstance.administrator_action('set_administrator', currentAccountAddress))
      .to.be.rejectedWith(contractErrors.notAdministrator);

    await expect(servicesFactoryContractInstance.set_pause(true))
      .to.be.rejectedWith(contractErrors.notAdministrator);
    await expect(servicesFactoryContractInstance.administrator_action('set_pause', true))
      .to.be.rejectedWith(contractErrors.notAdministrator);

    await expect(servicesFactoryContractInstance.set_service_factory_function(notImplementedLambda))
      .to.be.rejectedWith(contractErrors.notAdministrator);
    await expect(servicesFactoryContractInstance.administrator_action('set_service_factory_function', notImplementedLambda))
      .to.be.rejectedWith(contractErrors.notAdministrator);

    const storageAfterActions = await servicesFactoryContractInstance.storage();
    expect(storageAfterActions).deep.equal(servicesFactoryContractStorage);
  });

  describe('Set_administrator', () => {
    it('should change a contract administrator if a caller is a current administrator', async () => {
      const result = await servicesFactoryContractInstance.set_administrator(admins[0].pkh);
      servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(servicesFactoryContractStorage.administrator).to.equal(admins[0].pkh);

      await expect(servicesFactoryContractInstance.set_pause(true))
        .to.be.rejectedWith(contractErrors.notAdministrator);
    });
  });
});
