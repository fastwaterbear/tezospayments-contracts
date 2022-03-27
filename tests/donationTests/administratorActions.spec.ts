import { expect } from 'chai';

import { useLastTezosToolkit, servicesFactoryErrors, deployDonation } from '../helpers';
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
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);
    await expect(donationContractInstance.administrator_action('set_administrator', currentAccountAddress))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);

    await expect(donationContractInstance.set_disabled(true))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);
    await expect(donationContractInstance.administrator_action('set_disabled', true))
      .to.be.rejectedWith(servicesFactoryErrors.notAdministrator);

    const storageAfterActions = await donationContractInstance.storage();
    expect(storageAfterActions).to.deep.equal(donationContractStorage);
  });
});
