import type { BigNumber } from 'bignumber.js';
import { expect } from 'chai';

import { contractErrors, useLastTezosToolkit, deployService, tezToMutez, stringToBytes } from '../helpers';
import { admins } from '../testData';

const [serviceContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Actions', accounts => {
  const currentAccountAddress = accounts[0]!;
  const ownerAccountAddress = admins[0].pkh;

  let serviceContractInstance: TezosPayments.ServiceContract.Instance;
  let serviceContractStorage: TezosPayments.ServiceContract.Storage;
  let currentAccountBalanceBeforeAction: BigNumber;
  let ownerAccountBalanceBeforeAction: BigNumber;
  let publicOperationPayloadBytes: string;
  let privateOperationPayloadBytes: string;

  const deployServiceAndAssign = async (initialStorageState: Parameters<typeof deployService>['1']) =>
    [serviceContractInstance, serviceContractStorage] = await deployService(serviceContract, initialStorageState);

  const beforeEachBody = async (initialStorageState?: Partial<Truffle.InitialStorageState<TezosPayments.ServiceContract.Storage>>) => {
    await deployServiceAndAssign({ owner: ownerAccountAddress, ...initialStorageState });

    publicOperationPayloadBytes = stringToBytes('public data');
    privateOperationPayloadBytes = stringToBytes('private data');
    [currentAccountBalanceBeforeAction, ownerAccountBalanceBeforeAction] = await Promise.all([
      tezosToolkit.tz.getBalance(currentAccountAddress),
      tezosToolkit.tz.getBalance(ownerAccountAddress),
    ]);
  };

  beforeEach('Deploy new instance', () => beforeEachBody());

  describe('Transfer_payment', () => {
    it('should allow to transfer tez tokens to a service owner', async () => {
      const tezAmount = 10;

      const result = await serviceContractInstance.send_payment(
        undefined,
        'public', publicOperationPayloadBytes,
        undefined,
        { amount: tezAmount }
      );

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(ownerAccountAddress),
      ]);

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction)
        .to.deep.equal(currentAccountBalanceBeforeAction.minus(tezToMutez(tezAmount) + result.receipt.fee));
      expect(ownerAccountBalanceAfterAction)
        .to.deep.equal(ownerAccountBalanceBeforeAction.plus(tezToMutez(tezAmount)));
    });

    it('should fail if a user tries to transfer 0 tez tokens', async () => {
      await expect(serviceContractInstance.send_payment(
        undefined,
        'public', publicOperationPayloadBytes,
        undefined,
        { amount: 0 }
      )).to.be.rejectedWith(contractErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(ownerAccountAddress),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer assets and tez tokens at the same time', async () => {
      await expect(serviceContractInstance.send_payment(
        'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        463,
        'public', publicOperationPayloadBytes,
        { amount: 11 }
      )).to.be.rejectedWith(contractErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(ownerAccountAddress),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer non-native tokens (tez tokens)', async () => {
      await expect(serviceContractInstance.send_payment(
        'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        463,
        'public', publicOperationPayloadBytes
      )).to.be.rejectedWith(contractErrors.notImplemented);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(ownerAccountAddress),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if the service is paused', async () => {
      await beforeEachBody({ paused: true });

      await expect(serviceContractInstance.send_payment(
        undefined,
        'public', publicOperationPayloadBytes,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(contractErrors.serviceIsPaused);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(ownerAccountAddress),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if the service is deleted', async () => {
      await beforeEachBody({ deleted: true });

      await expect(serviceContractInstance.send_payment(
        undefined,
        'public', publicOperationPayloadBytes,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(contractErrors.serviceIsDeleted);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(ownerAccountAddress),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if an operation has a private payload', async () => {
      await expect(serviceContractInstance.send_payment(
        undefined,
        'private', privateOperationPayloadBytes,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(contractErrors.privatePayloadNotSupported);
      await expect(serviceContractInstance.send_payment(
        undefined,
        'public_and_private', publicOperationPayloadBytes, privateOperationPayloadBytes,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(contractErrors.privatePayloadNotSupported);

      await expect(serviceContractInstance.send_payment(
        'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        2323,
        'private', privateOperationPayloadBytes,
      )).to.be.rejectedWith(contractErrors.privatePayloadNotSupported);
      await expect(serviceContractInstance.send_payment(
        'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        2323,
        'public_and_private', publicOperationPayloadBytes, privateOperationPayloadBytes,
      )).to.be.rejectedWith(contractErrors.privatePayloadNotSupported);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(ownerAccountAddress),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });
  });
});
