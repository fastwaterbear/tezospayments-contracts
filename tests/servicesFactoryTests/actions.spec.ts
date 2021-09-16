import { OperationResultOrigination } from '@taquito/rpc';
import { MichelsonMap, OpKind } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';

import {
  contractErrors, useLastTezosToolkit, deployServicesFactory,
  serviceMetadataToBytes, getAccountPublicKey, createSigningKeyMichelsonMap
} from '../helpers';
import { admins, invalidOperationTypes, invalidSigningKeyTestCases, validSigningKeys } from '../testData';

const [servicesFactoryContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('services-factory'));

contract('Services Factory | Actions', accounts => {
  const currentAccountAddress = accounts[0]!;
  const currentAccountPublicKey = getAccountPublicKey(currentAccountAddress)!;

  let servicesFactoryContractInstance: TezosPayments.ServicesFactoryContract.Instance;
  let servicesFactoryContractStorage: TezosPayments.ServicesFactoryContract.Storage;

  const deployServicesFactoryAndAssign = async (initialStorageState: Parameters<typeof deployServicesFactory>['1']) =>
    [servicesFactoryContractInstance, servicesFactoryContractStorage] = await deployServicesFactory(servicesFactoryContract, initialStorageState);

  beforeEach('Deploy new instance', () => deployServicesFactoryAndAssign({ administrator: admins[0].pkh }));

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
      const expectedServiceStorage: TezosPayments.ServiceContract.Storage = {
        version: new BigNumber(0),
        metadata: commonServiceMetadataBytes,
        allowed_tokens: {
          tez: true,
          assets: []
        },
        allowed_operation_type: new BigNumber(TezosPayments.OperationType.Payment),
        owner: currentAccountAddress,
        signing_keys: createSigningKeyMichelsonMap([]),
        paused: false,
        deleted: false
      };

      const result = await servicesFactoryContractInstance.create_service(
        commonServiceMetadataBytes,
        true,
        [],
        TezosPayments.OperationType.Payment,
        createSigningKeyMichelsonMap([])
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
      const serviceContractStorage = await tezosToolkit.contract.at(serviceContractAddress!).then(instance => instance.storage());

      expect(storageAfterAction).to.deep.equal(servicesFactoryContractStorage);
      expect(servicesSet).to.deep.equal([serviceContractAddress]);
      expect(serviceContractStorage).to.deep.equal(expectedServiceStorage);
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
        {
          name: 'Test Service 4',
          links: []
        },
      ];
      const serviceCreationParameters: Array<Parameters<typeof servicesFactoryContractInstance.create_service>> = [
        [
          serviceMetadataToBytes(serviceMetadataList[0]!),
          true,
          ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV', 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf'],
          TezosPayments.OperationType.Payment,
          createSigningKeyMichelsonMap([])
        ],
        [
          serviceMetadataToBytes(serviceMetadataList[1]!),
          true,
          [],
          TezosPayments.OperationType.Donation,
          createSigningKeyMichelsonMap([])
        ],
        [
          serviceMetadataToBytes(serviceMetadataList[2]!),
          false,
          ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV'],
          TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
          createSigningKeyMichelsonMap([])
        ],
        [
          serviceMetadataToBytes(serviceMetadataList[3]!),
          true,
          ['KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf'],
          TezosPayments.OperationType.Payment,
          createSigningKeyMichelsonMap([
            { public_key: currentAccountPublicKey, name: null },
            { public_key: 'edpkuE58W2PXAXGRHBZimjY3o4PdaTWJA9ACKQTbeK5rcYUT4dAcoH', name: 'API0' }
          ])
        ]
      ];
      const serviceCreationParametersAndExpectedServiceStorages = serviceCreationParameters.map(creationParameters => [
        creationParameters,
        {
          version: new BigNumber(0),
          metadata: creationParameters[0],
          allowed_tokens: {
            tez: creationParameters[1],
            assets: creationParameters[2]
          },
          allowed_operation_type: new BigNumber(creationParameters[3]),
          owner: currentAccountAddress,
          signing_keys: creationParameters[4],
          paused: false,
          deleted: false
        } as TezosPayments.ServiceContract.Storage
      ] as const);

      const expectedServicesSet: Array<string | undefined> = [];
      for (const [creationParameters, expectedServiceStorage] of serviceCreationParametersAndExpectedServiceStorages) {
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
        const serviceContractStorage = await tezosToolkit.contract.at(serviceContractAddress!).then(instance => instance.storage());

        expect(storageAfterAction).to.deep.equal(servicesFactoryContractStorage);
        expect(servicesSet?.sort()).to.deep.equal(expectedServicesSet.sort());
        expect(serviceContractStorage).to.deep.equal(expectedServiceStorage);
      }
    });

    it('should create a service with available types of signing keys', async () => {
      const expectedServiceStorage: TezosPayments.ServiceContract.Storage = {
        version: new BigNumber(0),
        metadata: commonServiceMetadataBytes,
        allowed_tokens: {
          tez: true,
          assets: []
        },
        allowed_operation_type: new BigNumber(TezosPayments.OperationType.Payment),
        owner: currentAccountAddress,
        signing_keys: createSigningKeyMichelsonMap(validSigningKeys),
        paused: false,
        deleted: false
      };

      const result = await servicesFactoryContractInstance.create_service(
        commonServiceMetadataBytes,
        true,
        [],
        TezosPayments.OperationType.Payment,
        createSigningKeyMichelsonMap(validSigningKeys)
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
      const serviceContractStorage = await tezosToolkit.contract.at(serviceContractAddress!).then(instance => instance.storage());

      expect(storageAfterAction).to.deep.equal(servicesFactoryContractStorage);
      expect(servicesSet).to.deep.equal([serviceContractAddress]);
      expect(serviceContractStorage).to.deep.equal(expectedServiceStorage);
    });

    it('should fail if the contract is paused', async () => {
      await deployServicesFactoryAndAssign({ administrator: admins[0].pkh, paused: true });

      servicesFactoryContractStorage = await servicesFactoryContractInstance.storage();

      await expect(servicesFactoryContractInstance.create_service(
        commonServiceMetadataBytes,
        true,
        [],
        TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
        createSigningKeyMichelsonMap([])
      )).to.be.rejectedWith(contractErrors.contractIsPaused);

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });

    it('should fail if service parameters have an invalid structure when creating the service', async () => {
      await expect(servicesFactoryContractInstance.create_service(
        'invalid metadata',
        true,
        ['KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt'],
        TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
        createSigningKeyMichelsonMap([])
      )).to.be.rejectedWith('Invalid bytes');

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });

    it('should fail if there are no allowed tokens', async () => {
      await expect(servicesFactoryContractInstance.create_service(
        commonServiceMetadataBytes,
        false,
        [],
        TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
        createSigningKeyMichelsonMap([])
      )).to.be.rejectedWith(contractErrors.noAllowedTokens);

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });

    it('should fail if a set of allowed assets has the same address', async () => {
      await expect(servicesFactoryContractInstance.create_service(
        commonServiceMetadataBytes,
        true,
        ['KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt', 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf', 'KT1Crp4yHcH1CmnJEmixzsgwgYC5artX4YYt'],
        TezosPayments.OperationType.Payment | TezosPayments.OperationType.Donation,
        createSigningKeyMichelsonMap([])
      )).to.be.rejectedWith('duplicate_set_values_in_literal');

      const storageAfterActions = await servicesFactoryContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
    });

    describe('should fail if the allowed operation type is invalid', () => {
      invalidOperationTypes.forEach(([invalidOperationType, errorMessage]) => {
        it(`the invalid operation type == ${invalidOperationType}`, async () => {
          await expect(servicesFactoryContractInstance.create_service(
            commonServiceMetadataBytes,
            true,
            [],
            invalidOperationType,
            createSigningKeyMichelsonMap([])
          )).to.be.rejectedWith(errorMessage!);

          const storageAfterActions = await servicesFactoryContractInstance.storage();
          expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
        });
      });
    });

    describe('should fail if the signing key is invalid', () => {
      invalidSigningKeyTestCases.forEach(([message, invalidSigningKey, errorMessage]) => {
        it(message, async () => {
          await expect(servicesFactoryContractInstance.create_service(
            commonServiceMetadataBytes,
            true,
            [],
            TezosPayments.OperationType.All,
            MichelsonMap.fromLiteral({ [invalidSigningKey.public_key]: invalidSigningKey }) as TezosPayments.SigningKeys
          )).to.be.rejectedWith(errorMessage!);

          const storageAfterActions = await servicesFactoryContractInstance.storage();
          expect(storageAfterActions).to.deep.equal(servicesFactoryContractStorage);
        });
      });
    });

    it.skip('should fail if a set of allowed assets have invalid address (not FA tokens)', () => {
      // TODO: implement after test tokens;
    });
  });
});
