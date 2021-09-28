import { expect } from 'chai';

import { useLastTezosToolkit, deployService, getAccountPublicKey, createSigningKeyMichelsonMap, createSigningKeyUpdatesMichelsonMap } from '../../helpers';
import { validSigningKeys } from '../../testData';

const [serviceContract] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Owner Actions | Update_signing_keys', accounts => {
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
