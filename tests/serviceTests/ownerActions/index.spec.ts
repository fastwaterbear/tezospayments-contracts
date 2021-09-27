import { expect } from 'chai';

import {
  contractErrors, useLastTezosToolkit, deployService, getAccountPublicKey,
  createSigningKeyMichelsonMap, createSigningKeyUpdatesMichelsonMap, serviceMetadataToBytes
} from '../../helpers';
import { validServiceParameterUpdatesTestCases, simpleAccounts, validSigningKeys } from '../../testData';

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

    const serviceParameters: TezosPayments.ServiceContract.ServiceParameters = [
      serviceMetadataToBytes({
        name: 'Test Service',
        links: ['https://test.com']
      }),
      true,
      [],
      TezosPayments.OperationType.Payment,
      createSigningKeyMichelsonMap([])
    ];
    await expect(serviceContractInstance.initialize(...serviceParameters))
      .to.be.rejectedWith(contractErrors.notOwner);
    await expect(serviceContractInstance.owner_action('initialize', ...serviceParameters))
      .to.be.rejectedWith(contractErrors.notOwner);

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

    for (const [_, serviceParameterUpdates] of validServiceParameterUpdatesTestCases) {
      await expect(serviceContractInstance.update_service_parameters(...serviceParameterUpdates))
        .to.be.rejectedWith(contractErrors.notOwner);
      await expect(serviceContractInstance.owner_action('update_service_parameters', ...serviceParameterUpdates))
        .to.be.rejectedWith(contractErrors.notOwner);
    }

    await expect(serviceContractInstance.update_signing_keys(createSigningKeyUpdatesMichelsonMap({
      addOrUpdate: [validSigningKeys[0]!, validSigningKeys[3]!],
      delete: [currentAccountPublicKey!]
    }))).to.be.rejectedWith(contractErrors.notOwner);

    const storageAfterActions = await serviceContractInstance.storage();
    expect(storageAfterActions).to.deep.equal(serviceContractStorage);
  });
});
