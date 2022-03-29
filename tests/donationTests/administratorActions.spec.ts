import { expect } from 'chai';

import { useLastTezosToolkit, deployDonation, commonErrors } from '../helpers';
import { admins } from '../testData';

const [donationContract] = useLastTezosToolkit(artifacts.require('donation'));

contract('Donation | Administrator Actions', accounts => {
  const currentAccountAddress = accounts[0]!;

  let donationContractInstance: TezosPayments.DonationContract.Instance;
  let donationContractStorage: TezosPayments.DonationContract.Storage;

  const deployDonationAndAssign = async (initialStorageState: Parameters<typeof deployDonation>['1']) =>
    [donationContractInstance, donationContractStorage] = await deployDonation(donationContract, initialStorageState);

  beforeEach('Deploy new instance', async () => {
    await deployDonationAndAssign({ administrator: currentAccountAddress });
  });

  it('should prevent calls from non-administrators', async () => {
    await deployDonationAndAssign({ administrator: admins[0].pkh });

    await expect(donationContractInstance.set_administrator(currentAccountAddress))
      .to.be.rejectedWith(commonErrors.notAdministrator);
    await expect(donationContractInstance.administrator_action('set_administrator', currentAccountAddress))
      .to.be.rejectedWith(commonErrors.notAdministrator);

    await expect(donationContractInstance.set_disabled(true))
      .to.be.rejectedWith(commonErrors.notAdministrator);
    await expect(donationContractInstance.administrator_action('set_disabled', true))
      .to.be.rejectedWith(commonErrors.notAdministrator);

    const storageAfterActions = await donationContractInstance.storage();
    expect(storageAfterActions).to.deep.equal(donationContractStorage);
  });

  describe('Set_administrator', () => {
    it('should set a pending administrator if a caller is a current administrator', async () => {
      let result = await donationContractInstance.set_administrator(admins[0].pkh);
      let storageAfterAction = await donationContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...donationContractStorage, pending_administrator: admins[0].pkh });

      result = await donationContractInstance.set_administrator();
      storageAfterAction = await donationContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...donationContractStorage, pending_administrator: null });
    });
  });

  describe('Set_disabled', () => {
    it('should change a contract state if a caller is a current administrator', async () => {
      let result = await donationContractInstance.set_disabled(true);
      let storageAfterAction = await donationContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...donationContractStorage, disabled: true });

      result = await donationContractInstance.set_disabled(false);
      storageAfterAction = await donationContractInstance.storage();

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal({ ...donationContractStorage, disabled: false });
    });
  });
});
