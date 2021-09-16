import { expect } from 'chai';

import {
  contractErrors, useLastTezosToolkit, deployService, getAccountPublicKey,
  createSigningKeyMichelsonMap, createSigningKeyUpdatesMichelsonMap
} from '../helpers';
import { invalidServiceParametersUpdates, serviceParametersUpdates, simpleAccounts, validSigningKeys } from '../testData';

const [serviceContract] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Owner Actions', accounts => {
  const currentAccountAddress = accounts[0]!;
  const currentAccountPublicKey = getAccountPublicKey(currentAccountAddress);

  let serviceContractInstance: TezosPayments.ServiceContract.Instance;
  let serviceContractStorage: TezosPayments.ServiceContract.Storage;

  const deployServiceAndAssign = async (initialStorageState: Parameters<typeof deployService>['1']) =>
    [serviceContractInstance, serviceContractStorage] = await deployService(serviceContract, initialStorageState);

  beforeEach('Deploy new instance', () => deployServiceAndAssign({
    owner: currentAccountAddress,
    signing_keys: createSigningKeyMichelsonMap([{ public_key: currentAccountPublicKey!, name: null }])
  }));

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

    for (const [_, update] of serviceParametersUpdates) {
      await expect(serviceContractInstance.update_service_parameters(...update))
        .to.be.rejectedWith(contractErrors.notOwner);
      await expect(serviceContractInstance.owner_action('update_service_parameters', ...update))
        .to.be.rejectedWith(contractErrors.notOwner);
    }

    await expect(serviceContractInstance.update_signing_keys(createSigningKeyUpdatesMichelsonMap({
      addOrUpdate: [validSigningKeys[0]!, validSigningKeys[3]!],
      delete: [currentAccountPublicKey!]
    }))).to.be.rejectedWith(contractErrors.notOwner);

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

  describe('Update_service_parameters', () => {
    serviceParametersUpdates.forEach(([caseName, update]) => {
      it(`should update ${caseName}`, async () => {
        await deployServiceAndAssign({ owner: currentAccountAddress });

        const result = await serviceContractInstance.update_service_parameters(...update);
        const storageAfterAction = await serviceContractInstance.storage();
        const expectedStorage: TezosPayments.ServiceContract.Storage = {
          ...serviceContractStorage,
          metadata: update[0] ?? serviceContractStorage.metadata,
          allowed_tokens: {
            tez: update[1] ?? serviceContractStorage.allowed_tokens.tez,
            assets: update[2] ?? serviceContractStorage.allowed_tokens.assets,
          }
        };

        expect(result).to.exist;
        expect(result.tx).to.exist;
        expect(storageAfterAction).to.deep.equal(expectedStorage);
      });
    });

    invalidServiceParametersUpdates.forEach(([caseName, update, errorMessage]) => {
      it(`should fail if updates is invalid: ${caseName}`, async () => {
        await expect(serviceContractInstance.update_service_parameters(...update))
          .to.be.rejectedWith(errorMessage!);
      });
    });
  });

  describe('Update_signing_keys', () => {
    it('should add new signing keys', async () => {
      let result = await serviceContractInstance.update_signing_keys(createSigningKeyUpdatesMichelsonMap({ addOrUpdate: validSigningKeys.slice(0, 3) }));
      let storageAfterAction = await serviceContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({
        ...serviceContractStorage,
        signing_keys: createSigningKeyMichelsonMap(validSigningKeys.slice(0, 3).concat([{ public_key: currentAccountPublicKey!, name: null }]))
      });

      result = await serviceContractInstance.update_signing_keys(createSigningKeyUpdatesMichelsonMap({ addOrUpdate: validSigningKeys.slice(3, 5) }));
      storageAfterAction = await serviceContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({
        ...serviceContractStorage,
        signing_keys: createSigningKeyMichelsonMap(validSigningKeys.slice(0, 5).concat([{ public_key: currentAccountPublicKey!, name: null }]))
      });
    });
  });

  it('should add new signing keys or update existing ones', async () => {
    let result = await serviceContractInstance.update_signing_keys(createSigningKeyUpdatesMichelsonMap({ addOrUpdate: validSigningKeys.slice(1, 4) }));
    let storageAfterAction = await serviceContractInstance.storage();

    expect(result).to.exist;
    expect(result.tx).to.exist;
    expect(storageAfterAction).to.deep.equal({
      ...serviceContractStorage,
      signing_keys: createSigningKeyMichelsonMap(validSigningKeys.slice(1, 4).concat([{ public_key: currentAccountPublicKey!, name: null }]))
    });

    result = await serviceContractInstance.update_signing_keys(createSigningKeyUpdatesMichelsonMap({
      addOrUpdate: validSigningKeys.slice(2, 4).concat(validSigningKeys.slice(4, 6).map(key => ({ ...key, name: 'Updated Key Name' })))
    }));
    storageAfterAction = await serviceContractInstance.storage();

    expect(result).to.exist;
    expect(result.tx).to.exist;
    expect(storageAfterAction).to.deep.equal({
      ...serviceContractStorage,
      signing_keys: createSigningKeyMichelsonMap(
        validSigningKeys.slice(1, 4)
          .concat(validSigningKeys.slice(4, 6).map(key => ({ ...key, name: 'Updated Key Name' })))
          .concat([{ public_key: currentAccountPublicKey!, name: null }])
      )
    });
  });

  it('should add new signing keys, update or delete existing ones', async () => {
    let result = await serviceContractInstance.update_signing_keys(createSigningKeyUpdatesMichelsonMap({
      addOrUpdate: validSigningKeys.slice(1, 4),
      delete: [validSigningKeys[4]!.public_key, currentAccountPublicKey!]
    }));
    let storageAfterAction = await serviceContractInstance.storage();

    expect(result).to.exist;
    expect(result.tx).to.exist;
    expect(storageAfterAction).to.deep.equal({
      ...serviceContractStorage,
      signing_keys: createSigningKeyMichelsonMap(validSigningKeys.slice(1, 4))
    });

    result = await serviceContractInstance.update_signing_keys(createSigningKeyUpdatesMichelsonMap({
      addOrUpdate: validSigningKeys.slice(2, 5).map(key => ({ ...key, name: 'Updated Key Name' })),
      delete: [validSigningKeys[0]!.public_key, validSigningKeys[1]!.public_key]
    }));
    storageAfterAction = await serviceContractInstance.storage();

    expect(result).to.exist;
    expect(result.tx).to.exist;
    expect(storageAfterAction).to.deep.equal({
      ...serviceContractStorage,
      signing_keys: createSigningKeyMichelsonMap(validSigningKeys.slice(2, 5).map(key => ({ ...key, name: 'Updated Key Name' })))
    });
  });
});
