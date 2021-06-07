import { expect } from 'chai';

import { contractErrors, useLastTezosToolkit, deployService } from '../helpers';
import { serviceParametersUpdates, simpleAccounts } from '../testData';

const [serviceContract] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Owner Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let serviceContractInstance: TezosPayments.ServiceContract.Instance;
  let serviceContractStorage: TezosPayments.ServiceContract.Storage;

  const deployServiceAndAssign = async (initialStorageState: Parameters<typeof deployService>['1']) =>
    [serviceContractInstance, serviceContractStorage] = await deployService(serviceContract, initialStorageState);

  beforeEach('Deploy new instance', () => deployServiceAndAssign({ owner: currentAccountAddress }));

  it('should prevent calls from non-owners', async () => {
    await deployServiceAndAssign({ owner: simpleAccounts[1].pkh });

    await expect(serviceContractInstance.set_owner(currentAccountAddress))
      .to.be.rejectedWith(contractErrors.notOwner);
    await expect(serviceContractInstance.owner_action('set_owner', currentAccountAddress))
      .to.be.rejectedWith(contractErrors.notOwner);

    await expect(serviceContractInstance.set_pause(true))
      .to.be.rejectedWith(contractErrors.notOwner);
    await expect(serviceContractInstance.owner_action('set_pause', true))
      .to.be.rejectedWith(contractErrors.notOwner);

    await expect(serviceContractInstance.set_deleted(true))
      .to.be.rejectedWith(contractErrors.notOwner);
    await expect(serviceContractInstance.owner_action('set_deleted', true))
      .to.be.rejectedWith(contractErrors.notOwner);

    for (const caseName of Object.keys(serviceParametersUpdates) as Array<keyof typeof serviceParametersUpdates>) {
      const update = serviceParametersUpdates[caseName];

      await expect(serviceContractInstance.update_service_parameters(...update))
        .to.be.rejectedWith(contractErrors.notOwner);
      await expect(serviceContractInstance.owner_action('update_service_parameters', ...update))
        .to.be.rejectedWith(contractErrors.notOwner);
    }

    const storageAfterActions = await serviceContractInstance.storage();
    expect(storageAfterActions).to.deep.equal(serviceContractStorage);
  });

  describe('Set_owner', () => {
    it('should change a contract owner if a caller is a current owner', async () => {
      const result = await serviceContractInstance.set_owner(simpleAccounts[1].pkh);
      const storageAfterAction = await serviceContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...serviceContractStorage, owner: simpleAccounts[1].pkh });

      await expect(serviceContractInstance.set_pause(true))
        .to.be.rejectedWith(contractErrors.notOwner);
    });
  });

  describe('Set_pause', () => {
    it('should change a contract state if a caller is a current owner', async () => {
      let result = await serviceContractInstance.set_pause(true);
      let storageAfterAction = await serviceContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...serviceContractStorage, paused: true });

      result = await serviceContractInstance.set_pause(false);
      storageAfterAction = await serviceContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...serviceContractStorage, paused: false });
    });
  });

  describe('Set_deleted', () => {
    it('should change a contract state if a caller is a current owner', async () => {
      let result = await serviceContractInstance.set_deleted(true);
      let storageAfterAction = await serviceContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...serviceContractStorage, deleted: true });

      result = await serviceContractInstance.set_deleted(false);
      storageAfterAction = await serviceContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...serviceContractStorage, deleted: false });
    });
  });
});
