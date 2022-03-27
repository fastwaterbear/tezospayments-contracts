import { OperationResultOrigination } from '@taquito/rpc';
import { OpKind } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';

import {
  useLastTezosToolkit, deployServicesFactory, deployServicesImplementationFactory,
  setServicesFactoryImplementation, decapitalize, servicesFactoryImplementationErrors, createCompletedPaymentsBigMap
} from '../helpers';
import { admins, invalidServiceParametersTestCases, validServiceParameters } from '../testData';

const [servicesFactoryContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('services-factory'));
const [servicesFactoryImplementationContract] = useLastTezosToolkit(artifacts.require('services-factory-implementation'));

contract('Services Factory Implementation | Actions', accounts => {
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
    await deployServicesFactoryAndAssign({ administrator: admins[0].pkh });
    await deployServicesImplementationFactoryAndAssign({ factory: servicesFactoryContractInstance.address });
    await setServicesFactoryImplementation(
      servicesFactoryContractInstance.address,
      servicesFactoryImplementationContractInstance.address,
      tezosToolkit,
      admins[0].formattedSk
    );

    servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();
    servicesFactoryImplementationContractStorage = await servicesFactoryImplementationContractInstance.storage();
  });

  describe('Create_service', () => {
    validServiceParameters.forEach(serviceParameters => {
      it('should create a service as a separate contract, and set the related record in the storage of the factory contract', async () => {
        const expectedServiceStorage: Omit<TezosPayments.ServiceContract.Storage, 'completed_payments'> = {
          version: new BigNumber(1),
          metadata: serviceParameters[0],
          allowed_tokens: {
            tez: serviceParameters[1],
            assets: serviceParameters[2]
          },
          signing_keys: serviceParameters[3],
          owner: currentAccountAddress,
          paused: false,
          deleted: false,
        };

        const result = await servicesFactoryImplementationContractInstance.create_service(...serviceParameters);
        const factoryImplementationStorageAfterAction = await servicesFactoryImplementationContractInstance.storage();
        const factoryStorageAfterAction = await servicesFactoryContractInstance.storage();
        const internalOperations = result.receipt.operationResults[0]?.metadata.internal_operation_results;

        expect(result).to.exist;
        expect(result.tx).to.exist;
        expect(internalOperations).to.exist;
        expect(internalOperations).to.have.lengthOf(2);
        expect(internalOperations?.[0]?.kind).to.equal(OpKind.ORIGINATION);
        expect(internalOperations?.[1]?.kind).to.equal(OpKind.TRANSACTION);
        expect(internalOperations?.[1]?.parameters?.entrypoint).to.equal('add_service');

        const internalOperationResultOrigination = (internalOperations?.[0]?.result as OperationResultOrigination);
        const serviceContractAddress = internalOperationResultOrigination.originated_contracts?.[0];
        const servicesSet = await factoryStorageAfterAction.services.get<string[]>(currentAccountAddress);
        const serviceContractStorage = await tezosToolkit.contract.at(serviceContractAddress!)
          .then(instance => instance.storage<TezosPayments.ServiceContract.Storage>());

        expect(factoryStorageAfterAction).to.deep.equal(servicesFactoryContractStorage);
        expect(factoryImplementationStorageAfterAction).to.deep.equal(servicesFactoryImplementationContractStorage);
        expect(servicesSet).to.deep.equal([serviceContractAddress]);
        expect(serviceContractStorage).to.deep.equal({
          ...expectedServiceStorage,
          completed_payments: createCompletedPaymentsBigMap(serviceContractStorage.completed_payments.toString(), tezosToolkit)
        });
      });
    });

    it('should create services as separate contracts, and set the related records in the storage of the factory contract when creating multiple services', async () => {
      const serviceCreationParametersAndExpectedServiceStorages = validServiceParameters.map(creationParameters => [
        creationParameters,
        {
          version: new BigNumber(1),
          metadata: creationParameters[0],
          allowed_tokens: {
            tez: creationParameters[1],
            assets: creationParameters[2]
          },
          signing_keys: creationParameters[3],
          owner: currentAccountAddress,
          paused: false,
          deleted: false
        } as Omit<TezosPayments.ServiceContract.Storage, 'completed_payments'>
      ] as const);

      const expectedServicesSet: Array<string | undefined> = [];
      for (const [creationParameters, expectedServiceStorage] of serviceCreationParametersAndExpectedServiceStorages) {
        const result = await servicesFactoryImplementationContractInstance.create_service(...creationParameters);
        const factoryImplementationStorageAfterAction = await servicesFactoryImplementationContractInstance.storage();
        const factoryStorageAfterAction = await servicesFactoryContractInstance.storage();
        const servicesSet = await factoryStorageAfterAction.services.get<string[]>(currentAccountAddress);
        const internalOperations = result.receipt.operationResults[0]?.metadata.internal_operation_results;

        expect(result).to.exist;
        expect(result.tx).to.exist;
        expect(internalOperations).to.exist;
        expect(internalOperations).to.have.lengthOf(2);
        expect(internalOperations?.[0]?.kind).to.equal(OpKind.ORIGINATION);
        expect(internalOperations?.[1]?.kind).to.equal(OpKind.TRANSACTION);
        expect(internalOperations?.[1]?.parameters?.entrypoint).to.equal('add_service');

        const internalOperationResultOrigination = (internalOperations?.[0]?.result as OperationResultOrigination);
        const serviceContractAddress = internalOperationResultOrigination.originated_contracts?.[0];
        expectedServicesSet.push(serviceContractAddress);
        const serviceContractStorage = await tezosToolkit.contract.at(serviceContractAddress!)
          .then(instance => instance.storage<TezosPayments.ServiceContract.Storage>());

        expect(factoryStorageAfterAction).to.deep.equal(servicesFactoryContractStorage);
        expect(factoryImplementationStorageAfterAction).to.deep.equal(servicesFactoryImplementationContractStorage);
        expect(servicesSet?.sort()).to.deep.equal(expectedServicesSet.sort());
        expect(serviceContractStorage).to.deep.equal({
          ...expectedServiceStorage,
          completed_payments: createCompletedPaymentsBigMap(serviceContractStorage.completed_payments.toString(), tezosToolkit)
        });
      }
    });

    invalidServiceParametersTestCases.forEach(([caseName, invalidServiceParameters, expectedError]) => {
      it(`should fail if ${decapitalize(caseName)}`, async () => {
        const expectedServicesSet = await servicesFactoryContractStorage.services.get<string[]>(currentAccountAddress);

        await expect(servicesFactoryImplementationContractInstance.create_service(...invalidServiceParameters))
          .to.be.rejectedWith(expectedError!);
        const factoryImplementationStorageAfterAction = await servicesFactoryImplementationContractInstance.storage();
        const factoryStorageAfterAction = await servicesFactoryContractInstance.storage();
        const servicesSet = await factoryStorageAfterAction.services.get<string[]>(currentAccountAddress);

        expect(factoryStorageAfterAction).to.deep.equal(servicesFactoryContractStorage);
        expect(factoryImplementationStorageAfterAction).to.deep.equal(servicesFactoryImplementationContractStorage);
        expect(servicesSet).to.deep.equal(expectedServicesSet);
      });
    });

    it.skip('should fail if a set of allowed assets have invalid address (not FA tokens)', () => {
      // TODO: implement after test tokens;
    });

    it('should fail if the contract is disabled', async () => {
      await deployServicesFactoryAndAssign({ administrator: admins[0].pkh });
      await deployServicesImplementationFactoryAndAssign({ factory: servicesFactoryContractInstance.address });
      const expectedServicesSet = await servicesFactoryContractStorage.services.get<string[]>(currentAccountAddress);

      await expect(servicesFactoryImplementationContractInstance.create_service(...validServiceParameters[0]!))
        .to.be.rejectedWith(servicesFactoryImplementationErrors.factoryImplementationIsDisabled);
      const factoryImplementationStorageAfterAction = await servicesFactoryImplementationContractInstance.storage();
      const factoryStorageAfterAction = await servicesFactoryContractInstance.storage();
      const servicesSet = await factoryStorageAfterAction.services.get<string[]>(currentAccountAddress);

      expect(factoryStorageAfterAction).to.deep.equal(servicesFactoryContractStorage);
      expect(factoryImplementationStorageAfterAction).to.deep.equal(servicesFactoryImplementationContractStorage);
      expect(servicesSet).to.deep.equal(expectedServicesSet);
    });
  });

  describe('Set_disabled', () => {
    it('should prevent calls from non-current factory accounts', async () => {
      await expect(servicesFactoryImplementationContractInstance.set_disabled(false, 2))
        .to.be.rejectedWith(servicesFactoryImplementationErrors.notFactory);

      await deployServicesFactoryAndAssign({ administrator: currentAccountAddress });
      await expect(servicesFactoryContractInstance.set_factory_implementation(servicesFactoryImplementationContractInstance.address))
        .to.be.rejectedWith(servicesFactoryImplementationErrors.notFactory);
    });
  });
});
