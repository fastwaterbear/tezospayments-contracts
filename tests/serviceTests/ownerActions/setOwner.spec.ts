import { expect } from 'chai';

import { contractErrors, useLastTezosToolkit, deployService, getAccountPublicKey, createSigningKeyMichelsonMap } from '../../helpers';
import { simpleAccounts } from '../../testData';

const [serviceContract] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Owner Actions | Set_owner', accounts => {
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
