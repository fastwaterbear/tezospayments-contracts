import { expect } from 'chai';

import { useLastTezosToolkit, contractErrors, deployServicesFactory } from '../helpers';
import { admins, createEmptyContractLambda, invalidSignatureLambda, notImplementedLambda } from '../testData';

const [servicesFactoryContract] = useLastTezosToolkit(artifacts.require('services-factory'));

contract('Services Factory | Administrator Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let servicesFactoryContractInstance: TezosPayments.ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: TezosPayments.ServicesFactoryContract.Storage;

  const deployServicesFactoryAndAssign = async (initialStorageState: Parameters<typeof deployServicesFactory>['1']) =>
    [servicesFactoryContractInstance, servicesFactoryContractStorage] = await deployServicesFactory(servicesFactoryContract, initialStorageState);

  beforeEach('Deploy new instance', () => deployServicesFactoryAndAssign({ administrator: currentAccountAddress }));

  it('should prevent calls from non-administrators', async () => {
    await deployServicesFactoryAndAssign({ administrator: admins[0].pkh });

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
    expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
  });

  describe('Set_administrator', () => {
    it('should change a contract administrator if a caller is a current administrator', async () => {
      const result = await servicesFactoryContractInstance.set_administrator(admins[0].pkh);
      const storageAfterAction = await servicesFactoryContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...servicesFactoryContractStorage, administrator: admins[0].pkh });

      await expect(servicesFactoryContractInstance.set_pause(true))
        .to.be.rejectedWith(contractErrors.notAdministrator);
    });
  });

  describe('Set_pause', () => {
    it('should change a contract state if a caller is a current administrator', async () => {
      let result = await servicesFactoryContractInstance.set_pause(true);
      let storageAfterAction = await servicesFactoryContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...servicesFactoryContractStorage, paused: true });

      result = await servicesFactoryContractInstance.set_pause(false);
      storageAfterAction = await servicesFactoryContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...servicesFactoryContractStorage, paused: false });
    });
  });

  describe('Set_service_factory_function', () => {
    it('should change a service factory function if a caller is a current administrator', async () => {
      let result = await servicesFactoryContractInstance.set_service_factory_function(notImplementedLambda);
      let storageAfterAction = await servicesFactoryContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...servicesFactoryContractStorage, service_factory_function: notImplementedLambda });

      result = await servicesFactoryContractInstance.set_service_factory_function(createEmptyContractLambda);
      storageAfterAction = await servicesFactoryContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...servicesFactoryContractStorage, service_factory_function: createEmptyContractLambda });
    });

    it('should fail if a new service factory function has the wrong signature', async () => {
      await expect(servicesFactoryContractInstance.set_service_factory_function(invalidSignatureLambda))
        .to.be.rejectedWith('inconsistent_types');
    });
  });
});
