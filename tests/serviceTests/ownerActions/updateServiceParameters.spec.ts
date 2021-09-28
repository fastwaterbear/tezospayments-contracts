import { expect } from 'chai';

import { useLastTezosToolkit, deployService, getAccountPublicKey, createSigningKeyMichelsonMap, decapitalize } from '../../helpers';
import { invalidServiceParameterUpdatesTestCases, validServiceParameterUpdatesTestCases } from '../../testData';

const [serviceContract] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Owner Actions | Update_service_parameters', accounts => {
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

  validServiceParameterUpdatesTestCases.forEach(([caseName, update]) => {
    it(`should update ${decapitalize(caseName)}`, async () => {
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

  invalidServiceParameterUpdatesTestCases.forEach(([caseName, update, errorMessage]) => {
    it(`should fail if updates is invalid: ${decapitalize(caseName)}`, async () => {
      await expect(serviceContractInstance.update_service_parameters(...update))
        .to.be.rejectedWith(errorMessage!);
    });
  });
});
