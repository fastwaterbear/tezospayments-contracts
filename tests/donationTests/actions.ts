import { expect } from 'chai';

import { useLastTezosToolkit, deployDonation, commonErrors } from '../helpers';
import { admins, simpleAccounts } from '../testData';

const [donationContract] = useLastTezosToolkit(artifacts.require('donation'));

contract('Donation | Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let donationContractInstance: TezosPayments.DonationContract.Instance;
  let donationContractStorage: TezosPayments.DonationContract.Storage;

  const deployDonationAndAssign = async (initialStorageState: Parameters<typeof deployDonation>['1']) =>
    [donationContractInstance, donationContractStorage] = await deployDonation(donationContract, initialStorageState);

  beforeEach('Deploy new instance', async () => {
    await deployDonationAndAssign({ administrator: currentAccountAddress });
  });

  describe('Confirm_administrator', () => {
    it('should change a contract administrator if a caller is a pending administrator', async () => {
      await deployDonationAndAssign({ administrator: admins[0].pkh, pending_administrator: currentAccountAddress });

      const result = await donationContractInstance.confirm_administrator();
      const storageAfterAction = await donationContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...donationContractStorage, administrator: currentAccountAddress, pending_administrator: null });
    });

    it('should prevent calls from non-pending-administrators', async () => {
      await deployDonationAndAssign({ administrator: admins[0].pkh, pending_administrator: simpleAccounts[1].pkh });

      await expect(donationContractInstance.confirm_administrator())
        .to.be.rejectedWith(commonErrors.notPendingAdministrator);

      const storageAfterActions = await donationContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(donationContractStorage);
    });

    it('should prevent calls if pending-administrators is not set', async () => {
      await deployDonationAndAssign({ administrator: admins[0].pkh, pending_administrator: null });

      await expect(donationContractInstance.confirm_administrator())
        .to.be.rejectedWith(commonErrors.notPendingAdministrator);

      const storageAfterActions = await donationContractInstance.storage();
      expect(storageAfterActions).to.deep.equal(donationContractStorage);
    });
  });
});
