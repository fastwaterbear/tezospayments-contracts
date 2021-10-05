import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';

import { useLastTezosToolkit, servicesFactoryErrors, deployServicesFactory, deployServicesImplementationFactory, burnAddress } from '../helpers';
import { admins, invalidFactoryImplementation } from '../testData';

const [servicesFactoryContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('services-factory'));
const [servicesFactoryImplementationContract] = useLastTezosToolkit(artifacts.require('services-factory-implementation'));

contract('Services Factory | Administrator Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let servicesFactoryContractInstance: TezosPayments.ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: TezosPayments.ServicesFactoryContract.Storage;
  let servicesFactoryImplementationContractInstance: TezosPayments.ServicesFactoryImplementationContract.Instance;
  let servicesFactoryImplementationContractStorage: TezosPayments.ServicesFactoryImplementationContract.Storage;

  const deployServicesFactoryAndAssign = async (initialStorageState: Parameters<typeof deployServicesFactory>['1']) =>
    [servicesFactoryContractInstance, servicesFactoryContractStorage] = await deployServicesFactory(servicesFactoryContract, initialStorageState);

  const deployServicesImplementationFactoryAndAssign = async (initialStorageState: Parameters<typeof deployServicesImplementationFactory>['1']) =>
    // eslint-disable-next-line max-len
    [servicesFactoryImplementationContractInstance, servicesFactoryImplementationContractStorage] = await deployServicesImplementationFactory(servicesFactoryImplementationContract, initialStorageState);

  beforeEach('Deploy new instance', async () => {
    await deployServicesFactoryAndAssign({ administrator: currentAccountAddress });
    await deployServicesImplementationFactoryAndAssign({ factory: servicesFactoryContractInstance.address });
  });

  it('should prevent calls from non-administrators', async () => {
    await deployServicesFactoryAndAssign({ administrator: admins[0].pkh });

    await expect(servicesFactoryContractInstance.set_administrator(currentAccountAddress))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);
    await expect(servicesFactoryContractInstance.administrator_action('set_administrator', currentAccountAddress))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);

    await expect(servicesFactoryContractInstance.set_pause(true))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);
    await expect(servicesFactoryContractInstance.administrator_action('set_pause', true))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);

    await expect(servicesFactoryContractInstance.set_factory_implementation(servicesFactoryImplementationContractInstance.address))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);
    await expect(servicesFactoryContractInstance.administrator_action('set_factory_implementation', servicesFactoryImplementationContractInstance.address))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);

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
        .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);
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

  describe('Set_factory_implementation', () => {
    it('should launch the new implementation and disable the previous one when the implementation is updating', async () => {
      expect(servicesFactoryContractStorage.factory_implementation).to.equal(burnAddress);
      expect(servicesFactoryContractStorage.factory_implementation_version).to.deep.equal(new BigNumber(0));
      expect(servicesFactoryImplementationContractStorage).to.deep.equal({
        disabled: true,
        version: new BigNumber(0),
        factory: servicesFactoryContractInstance.address
      });

      let result = await servicesFactoryContractInstance.set_factory_implementation(servicesFactoryImplementationContractInstance.address);
      let factoryStorageAfterAction = await servicesFactoryContractInstance.storage();
      let factoryImplementationStorageAfterAction = await servicesFactoryImplementationContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(factoryStorageAfterAction).to.deep.equal({
        ...servicesFactoryContractStorage,
        factory_implementation: servicesFactoryImplementationContractInstance.address,
        factory_implementation_version: new BigNumber(1)
      });
      expect(factoryImplementationStorageAfterAction).to.deep.equal({
        disabled: false,
        version: new BigNumber(1),
        factory: servicesFactoryContractInstance.address
      });

      for (let i = 1; i <= 3; i++) {
        const previousFactoryImplementationContractInstance = await tezosToolkit.contract.at(servicesFactoryImplementationContractInstance.address);

        await deployServicesImplementationFactoryAndAssign({ factory: servicesFactoryContractInstance.address });
        result = await servicesFactoryContractInstance.set_factory_implementation(servicesFactoryImplementationContractInstance.address);
        factoryStorageAfterAction = await servicesFactoryContractInstance.storage();
        factoryImplementationStorageAfterAction = await servicesFactoryImplementationContractInstance.storage();
        const previousFactoryImplementationStorageAfterAction = await previousFactoryImplementationContractInstance
          .storage<TezosPayments.ServicesFactoryImplementationContract.Storage>();

        expect(result).to.exist;
        expect(result.tx).to.exist;
        expect(factoryStorageAfterAction).to.deep.equal({
          ...servicesFactoryContractStorage,
          factory_implementation: servicesFactoryImplementationContractInstance.address,
          factory_implementation_version: new BigNumber(i + 1)
        });
        expect(previousFactoryImplementationStorageAfterAction).to.deep.equal({
          disabled: true,
          version: new BigNumber(i),
          factory: servicesFactoryContractInstance.address
        });
        expect(factoryImplementationStorageAfterAction).to.deep.equal({
          disabled: false,
          version: new BigNumber(i + 1),
          factory: servicesFactoryContractInstance.address
        });
      }
    });

    it('should fail if a new implementation has the wrong interface', async () => {
      await expect(servicesFactoryContractInstance.set_factory_implementation(admins[0].pkh))
        .to.be.rejectedWith(servicesFactoryErrors.invalidFactoryImplementation);

      const originationOperation = (await tezosToolkit.contract.originate({ code: invalidFactoryImplementation, storage: {} }));
      const invalidFactoryImplementationContractAddress = originationOperation.contractAddress!;
      await originationOperation.confirmation();

      await expect(servicesFactoryContractInstance.set_factory_implementation(invalidFactoryImplementationContractAddress))
        .to.be.rejectedWith(servicesFactoryErrors.invalidFactoryImplementation);
    });
  });
});
