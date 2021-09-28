import { expect } from 'chai';

import { useLastTezosToolkit, deployService, getAccountPublicKey, createSigningKeyMichelsonMap } from '../../helpers';

const [serviceContract] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Owner Actions | Set_deleted', accounts => {
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
