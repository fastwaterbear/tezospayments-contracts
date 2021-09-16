import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';

import { contractErrors, useLastTezosToolkit, deployService, tezToMutez, stringToBytes, createSigningKeyMichelsonMap } from '../helpers';
import { admins, invalidOperationTypes } from '../testData';

const [serviceContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Actions', accounts => {
  const currentAccountAddress = accounts[0]!;
  const ownerAccountAddress = admins[0].pkh;
  const ownerAccountPublicKey = admins[0].pk;

  let serviceContractInstance: TezosPayments.ServiceContract.Instance;
  let serviceContractStorage: TezosPayments.ServiceContract.Storage;
  let currentAccountBalanceBeforeAction: BigNumber;
  let ownerAccountBalanceBeforeAction: BigNumber;
  let publicOperationPayloadBytes: string;
  let privateOperationPayloadBytes: string;

  const deployServiceAndAssign = async (initialStorageState: Parameters<typeof deployService>['1']) =>
    [serviceContractInstance, serviceContractStorage] = await deployService(serviceContract, initialStorageState);

  const beforeEachBody = async (initialStorageState?: Partial<Truffle.InitialStorageState<TezosPayments.ServiceContract.Storage>>) => {
    await deployServiceAndAssign({
      owner: ownerAccountAddress,
      signing_keys: createSigningKeyMichelsonMap([{ public_key: ownerAccountPublicKey, name: null }]),
      allowed_operation_type: new BigNumber(TezosPayments.OperationType.All),
      ...initialStorageState
    });

    publicOperationPayloadBytes = stringToBytes('public data');
    privateOperationPayloadBytes = stringToBytes('private data');
    [currentAccountBalanceBeforeAction, ownerAccountBalanceBeforeAction] = await Promise.all([
      tezosToolkit.tz.getBalance(currentAccountAddress),
      tezosToolkit.tz.getBalance(ownerAccountAddress),
    ]);
  };

  beforeEach('Deploy new instance', () => beforeEachBody());

  describe('Send_payment', () => {
    [
      [TezosPayments.OperationType.Payment, 'as a payment'] as const,
      [TezosPayments.OperationType.Donation, 'as a donation'] as const
    ].forEach(([paymentType, extraMessage]) =>
      it(`should allow to transfer tez tokens to a service owner (${extraMessage})`, async () => {
        const tezAmount = 10;

        const result = await serviceContractInstance.send_payment(
          undefined,
          paymentType,
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
      })
    );

    it('should fail if a user tries to transfer 0 tez tokens', async () => {
      await expect(serviceContractInstance.send_payment(
        undefined,
        TezosPayments.OperationType.Payment,
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
        TezosPayments.OperationType.Payment,
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
        TezosPayments.OperationType.Payment,
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

    describe('should fail if an operation type is invalid', async () => {
      invalidOperationTypes.forEach(([invalidOperationType, errorMessage]) => {
        it(`the invalid operation type == ${invalidOperationType}`, async () => {
          await expect(serviceContractInstance.send_payment(
            undefined,
            invalidOperationType,
            'public', publicOperationPayloadBytes,
            undefined,
            { amount: 10 }
          )).to.be.rejectedWith(errorMessage!);

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

    describe('should fail if an operation type has multiple flags', async () => {
      [TezosPayments.OperationType.All].forEach(invalidOperationType => {
        it(`the invalid operation type == ${invalidOperationType}`, async () => {
          await expect(serviceContractInstance.send_payment(
            undefined,
            invalidOperationType,
            'public', publicOperationPayloadBytes,
            undefined,
            { amount: 10 }
          )).to.be.rejectedWith(contractErrors.invalidOperationType);

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

    describe('should fail if an operation type isn\'t allowed', async () => {
      ([
        [TezosPayments.OperationType.Payment, TezosPayments.OperationType.Donation],
        [TezosPayments.OperationType.Donation, TezosPayments.OperationType.Payment],
      ] as const).forEach(([currentOperationType, allowedOperationType]) => {
        it(`the current operation type == ${currentOperationType}; the allowed operation type == ${allowedOperationType}`, async () => {
          await beforeEachBody({ allowed_operation_type: new BigNumber(allowedOperationType) });

          await expect(serviceContractInstance.send_payment(
            undefined,
            currentOperationType,
            'public', publicOperationPayloadBytes,
            undefined,
            { amount: 10 }
          )).to.be.rejectedWith(contractErrors.invalidOperationType);

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

    it('should fail if the service is paused', async () => {
      await beforeEachBody({ paused: true });

      await expect(serviceContractInstance.send_payment(
        undefined,
        TezosPayments.OperationType.Payment,
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
        TezosPayments.OperationType.Payment,
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
        TezosPayments.OperationType.Payment,
        'private', privateOperationPayloadBytes,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(contractErrors.privatePayloadNotSupported);
      await expect(serviceContractInstance.send_payment(
        undefined,
        TezosPayments.OperationType.Payment,
        'public_and_private', publicOperationPayloadBytes, privateOperationPayloadBytes,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(contractErrors.privatePayloadNotSupported);

      await expect(serviceContractInstance.send_payment(
        'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        2323,
        TezosPayments.OperationType.Payment,
        'private', privateOperationPayloadBytes,
      )).to.be.rejectedWith(contractErrors.privatePayloadNotSupported);
      await expect(serviceContractInstance.send_payment(
        'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        2323,
        TezosPayments.OperationType.Payment,
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
