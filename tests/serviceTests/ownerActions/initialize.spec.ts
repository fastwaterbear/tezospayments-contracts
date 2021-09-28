import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';

import { useLastTezosToolkit, getUninitializedServiceStorage, decapitalize } from '../../helpers';
import { invalidServiceParametersTestCases, validServiceParameters } from '../../testData';

const [serviceContract] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Owner Actions | Initialize', accounts => {
  const currentAccountAddress = accounts[0]!;

  let serviceContractInstance: TezosPayments.ServiceContract.Instance;
  let serviceContractStorage: TezosPayments.ServiceContract.Storage;

  const deployServiceAndAssign = async (owner: Truffle.InitialStorageState<TezosPayments.ServiceContract.Storage['owner']>) => {
    serviceContractInstance = await serviceContract.new(getUninitializedServiceStorage(owner));
    serviceContractStorage = await serviceContractInstance.storage();
  };

  beforeEach('Deploy new instance', () => deployServiceAndAssign(currentAccountAddress));

  validServiceParameters.forEach(serviceParameters => {
    it('should initialize the service and update the storage', async () => {
      const expectedServiceStorage: TezosPayments.ServiceContract.Storage = {
        version: new BigNumber(0),
        metadata: serviceParameters[0],
        allowed_tokens: {
          tez: serviceParameters[1],
          assets: serviceParameters[2]
        },
        allowed_operation_type: new BigNumber(serviceParameters[3]),
        owner: currentAccountAddress,
        signing_keys: serviceParameters[4],
        paused: false,
        deleted: false,
        initialized: true
      };

      const result = await serviceContractInstance.initialize(...serviceParameters);
      const storageAfterAction = await serviceContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal(expectedServiceStorage);
    });
  });

  invalidServiceParametersTestCases.forEach(([caseName, invalidServiceParameters, expectedError]) => {
    it(`should fail if ${decapitalize(caseName)}`, async () => {
      await expect(serviceContractInstance.initialize(...invalidServiceParameters)).to.be.rejectedWith(expectedError!);

      const storageAfterActions = await serviceContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(serviceContractStorage);
    });
  });

  it.skip('should fail if a set of allowed assets have invalid address (not FA tokens)', () => {
    // TODO: implement after test tokens;
  });
});
