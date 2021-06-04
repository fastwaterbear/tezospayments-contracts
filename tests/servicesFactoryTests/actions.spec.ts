import { Buffer } from 'buffer';

import { OperationResultOrigination } from '@taquito/rpc';
import { OpKind } from '@taquito/taquito';
import { expect } from 'chai';

import { useLastTezosToolkit } from '../helpers';
import { deployServiceFactory } from '../helpers/contractDeployment';

const [servicesFactoryContract] = useLastTezosToolkit(artifacts.require('services-factory'));

contract('Services Factory | Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let servicesFactoryContractInstance: ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: ServicesFactoryContract.Storage;

  const deployServiceFactoryAndAssign = async (initialStorageState: Parameters<typeof deployServiceFactory>['1']) =>
    [servicesFactoryContractInstance, servicesFactoryContractStorage] = await deployServiceFactory(servicesFactoryContract, initialStorageState);

  beforeEach('Deploy new instance', () => deployServiceFactoryAndAssign({ administrator: currentAccountAddress }));

  it('should create a service as a separate contract and set the related record in its own contract storage', async () => {
    const serviceMetadata: ServicesFactoryContract.ServiceMetadata = {
      name: 'Test Service',
      links: ['https://test.com']
    };

    const result = await servicesFactoryContractInstance.create_service(
      Buffer.from(JSON.stringify(serviceMetadata), 'utf8').toString('hex'),
      true,
      []
    );
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
    const serviceMetadataList: ServicesFactoryContract.ServiceMetadata[] = [
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
        Buffer.from(JSON.stringify(serviceMetadataList[0]), 'utf8').toString('hex'),
        true,
        ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV', 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf']
      ],
      [
        Buffer.from(JSON.stringify(serviceMetadataList[1]), 'utf8').toString('hex'),
        true,
        []
      ],
      [
        Buffer.from(JSON.stringify(serviceMetadataList[2]), 'utf8').toString('hex'),
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

  it('should fail if the contract is paused', () => {
    // TODO
  });

  it('should fail if service parameters have an invalid structure when creating the service', () => {
    // TODO
  });

  it('should fail if there are no allowed tokens', () => {
    // TODO
  });

  it('should fail if a set of allowed assets has the same address', () => {
    // TODO
  });
});
