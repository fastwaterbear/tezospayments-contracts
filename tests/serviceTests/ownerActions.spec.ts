import { expect } from 'chai';

import { useLastTezosToolkit } from '../helpers';
import { deployService } from '../helpers/contractDeployment';

const [serviceContract] = useLastTezosToolkit(artifacts.require('service'));

contract.skip('Service | Owner Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let servicesFactoryContractInstance: TezosPayments.ServiceContract.Instance;
  let servicesFactoryContractStorage: TezosPayments.ServiceContract.Storage;

  const deployServiceFactoryAndAssign = async (initialStorageState: Parameters<typeof deployService>['1']) =>
    [servicesFactoryContractInstance, servicesFactoryContractStorage] = await deployService(serviceContract, initialStorageState);

  beforeEach('Deploy new instance', () => deployServiceFactoryAndAssign({ owner: currentAccountAddress }));

  it('should prevent calls from non-owners', async () => {
    //
  });
});
