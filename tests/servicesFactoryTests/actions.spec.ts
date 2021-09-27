import { OperationResultOrigination } from '@taquito/rpc';
import { OpKind } from '@taquito/taquito';
import { expect } from 'chai';

import { contractErrors, useLastTezosToolkit, deployServicesFactory, getUninitializedServiceStorage } from '../helpers';
import { admins } from '../testData';

const [servicesFactoryContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('services-factory'));

contract('Services Factory | Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let servicesFactoryContractInstance: TezosPayments.ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: TezosPayments.ServicesFactoryContract.Storage;

  const deployServicesFactoryAndAssign = async (initialStorageState: Parameters<typeof deployServicesFactory>['1']) =>
    [servicesFactoryContractInstance, servicesFactoryContractStorage] = await deployServicesFactory(servicesFactoryContract, initialStorageState);

  beforeEach('Deploy new instance', () => deployServicesFactoryAndAssign({ administrator: admins[0].pkh }));

  describe('Create_service', () => {
    it('should create a service as a separate contract and set the related record in its own contract storage', async () => {
      const result = await servicesFactoryContractInstance.create_service(undefined);
      const internalOperationResult = result.receipt.operationResults[0]?.metadata.internal_operation_results?.[0];
      const storageAfterAction = await servicesFactoryContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(internalOperationResult).to.exist;
      expect(internalOperationResult?.kind).to.equal(OpKind.ORIGINATION);

      const internalOperationResultOrigination = (internalOperationResult?.result as OperationResultOrigination);
      const serviceContractAddress = internalOperationResultOrigination.originated_contracts?.[0];
      const servicesSet = await storageAfterAction.services.get<string[]>(currentAccountAddress);
      const serviceContractStorage = await tezosToolkit.contract.at(serviceContractAddress!).then(instance => instance.storage());

      expect(storageAfterAction).to.deep.equal(servicesFactoryContractStorage);
      expect(servicesSet).to.deep.equal([serviceContractAddress]);
      expect(serviceContractStorage).to.deep.equal(getUninitializedServiceStorage(currentAccountAddress));
    });

    it('should store a set of created services when creating multiple services', async () => {
      const expectedServicesSet: Array<string | undefined> = [];
      for (let index = 0; index < 5; index++) {
        const result = await servicesFactoryContractInstance.create_service(undefined);
        const internalOperationResult = result.receipt.operationResults[0]?.metadata.internal_operation_results?.[0];
        const storageAfterAction = await servicesFactoryContractInstance.storage();
        const servicesSet = await storageAfterAction.services.get<string[]>(currentAccountAddress);

        expect(result).to.exist;
        expect(result.tx).to.exist;
        expect(internalOperationResult).to.exist;
        expect(internalOperationResult?.kind).to.equal(OpKind.ORIGINATION);

        const internalOperationResultOrigination = (internalOperationResult?.result as OperationResultOrigination);
        const serviceContractAddress = internalOperationResultOrigination.originated_contracts?.[0];
        expectedServicesSet.push(serviceContractAddress);
        const serviceContractStorage = await tezosToolkit.contract.at(serviceContractAddress!).then(instance => instance.storage());

        expect(storageAfterAction).to.deep.equal(servicesFactoryContractStorage);
        expect(servicesSet?.sort()).to.deep.equal(expectedServicesSet.sort());
        expect(serviceContractStorage).to.deep.equal(getUninitializedServiceStorage(currentAccountAddress));
      }
    });

    it('should fail if the contract is paused', async () => {
      await deployServicesFactoryAndAssign({ administrator: admins[0].pkh, paused: true });

      servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();

      await expect(servicesFactoryContractInstance.create_service(undefined)).to.be.rejectedWith(contractErrors.contractIsPaused);

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });
  });
});
