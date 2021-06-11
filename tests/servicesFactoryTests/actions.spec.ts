import { OperationResultOrigination } from '@taquito/rpc';
import { OpKind } from '@taquito/taquito';
import { expect } from 'chai';

import { contractErrors, useLastTezosToolkit, deployServicesFactory, serviceMetadataToBytes } from '../helpers';

const [servicesFactoryContract] = useLastTezosToolkit(artifacts.require('services-factory'));

contract('Services Factory | Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let servicesFactoryContractInstance: TezosPayments.ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: TezosPayments.ServicesFactoryContract.Storage;

  const deployServicesFactoryAndAssign = async (initialStorageState: Parameters<typeof deployServicesFactory>['1']) =>
    [servicesFactoryContractInstance, servicesFactoryContractStorage] = await deployServicesFactory(servicesFactoryContract, initialStorageState);

  beforeEach('Deploy new instance', () => deployServicesFactoryAndAssign({ administrator: currentAccountAddress }));

  describe('Create_service', () => {
    let commonServiceMetadataBytes: string;

    beforeEach('Deploy new instance', () => {
      const commonServiceMetadata: TezosPayments.ServiceMetadata = {
        name: 'Test Service',
        links: ['https://test.com']
      };
      commonServiceMetadataBytes = serviceMetadataToBytes(commonServiceMetadata);
    });

    it('should create a service as a separate contract and set the related record in its own contract storage', async () => {
      const result = await servicesFactoryContractInstance.create_service(commonServiceMetadataBytes, true, []);
      const internalOperationResult = result.receipt.operationResults[0]?.metadata.internal_operation_results?.[0];
      const storageAfterAction = await servicesFactoryContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(internalOperationResult).to.exist;
      expect(internalOperationResult?.kind).to.equal(OpKind.ORIGINATION);

      const internalOperationResultOrigination = (internalOperationResult?.result as OperationResultOrigination);
      const serviceContractAddress = internalOperationResultOrigination.originated_contracts?.[0];
      const servicesSet = await storageAfterAction.services.get<string[]>(currentAccountAddress);

      expect(storageAfterAction).to.deep.equal(servicesFactoryContractStorage);
      expect(servicesSet).to.deep.equal([serviceContractAddress]);
    });

    it('should store a set of created services when creating multiple services', async () => {
      const serviceMetadataList: TezosPayments.ServiceMetadata[] = [
        {
          name: 'Test Service 1',
          links: ['https://test.com']
        },
        {
          name: 'Test Service 2',
          links: ['https://test.com', 'https://test.org']
        },
        {
          name: 'Test Service 3',
          links: [],
          description: 'A description of the Test Service 3'
        },
      ];
      const serviceCreationParameters: Array<Parameters<typeof servicesFactoryContractInstance.create_service>> = [
        [
          serviceMetadataToBytes(serviceMetadataList[0]!),
          true,
          ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV', 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf']
        ],
        [
          serviceMetadataToBytes(serviceMetadataList[1]!),
          true,
          []
        ],
        [
          serviceMetadataToBytes(serviceMetadataList[2]!),
          false,
          ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV']
        ]
      ];

      const expectedServicesSet: Array<string | undefined> = [];
      for (const creationParameters of serviceCreationParameters) {
        const result = await servicesFactoryContractInstance.create_service(...creationParameters);
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

        expect(storageAfterAction).to.deep.equal(servicesFactoryContractStorage);
        expect(servicesSet?.sort()).to.deep.equal(expectedServicesSet.sort());
      }
    });

    it('should fail if the contract is paused', async () => {
      await servicesFactoryContractInstance.set_pause(true);
      servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();

      await expect(servicesFactoryContractInstance.create_service(commonServiceMetadataBytes, true, []))
        .to.be.rejectedWith(contractErrors.contractIsPaused);

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });

    it('should fail if service parameters have an invalid structure when creating the service', async () => {
      await expect(servicesFactoryContractInstance.create_service(
        'invalid metadata',
        true,
        ['KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt']
      )).to.be.rejectedWith('Invalid bytes');

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });

    it('should fail if there are no allowed tokens', async () => {
      await expect(servicesFactoryContractInstance.create_service(commonServiceMetadataBytes, false, []))
        .to.be.rejectedWith(contractErrors.noAllowedTokens);

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });

    it('should fail if a set of allowed assets has the same address', async () => {
      await expect(servicesFactoryContractInstance.create_service(
        commonServiceMetadataBytes, true,
        ['KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt', 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf', 'KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt']
      ))
        .to.be.rejectedWith('duplicate_set_values_in_literal');

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });

    it.skip('should fail if a set of allowed assets have invalid address (not FA tokens)', () => {
      // TODO: implement after test tokens;
    });
  });
});
