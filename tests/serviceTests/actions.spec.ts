import { ContractAbstraction, ContractProvider } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';

import {
  commonErrors, serviceErrors, useLastTezosToolkit, deployService,
  tezToMutez, stringToBytes, createSigningKeyMichelsonMap, deployFa12, deployLambda, deployFa20
} from '../helpers';
import { admins, invalidOperationTypeTestCases } from '../testData';

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
  let lambdaContract: ContractAbstraction<ContractProvider>;
  let fa12Contract: ContractAbstraction<ContractProvider>;
  let fa20Contract: ContractAbstraction<ContractProvider>;

  const deployServiceAndAssign = async (initialStorageState: Parameters<typeof deployService>['1']) =>
    [serviceContractInstance, serviceContractStorage] = await deployService(serviceContract, initialStorageState);

  const beforeEachBody = async (
    initialStorageState?: Partial<Truffle.InitialStorageState<TezosPayments.ServiceContract.Storage>>,
    tokensInfo?: { amount: BigNumber, tokenId: number }
  ) => {
    if (tokensInfo) {
      fa12Contract = await deployFa12(
        tezosToolkit,
        currentAccountAddress,
        tokensInfo.amount
      );

      fa20Contract = await deployFa20(
        tezosToolkit,
        currentAccountAddress,
        tokensInfo.tokenId,
        tokensInfo.amount
      );
    }

    await deployServiceAndAssign({
      owner: ownerAccountAddress,
      signing_keys: createSigningKeyMichelsonMap([{ public_key: ownerAccountPublicKey, name: null }]),
      allowed_operation_type: new BigNumber(TezosPayments.OperationType.All),
      allowed_tokens: {
        tez: true,
        assets: tokensInfo ? [fa12Contract.address, fa20Contract.address] : []
      },
      ...initialStorageState
    });

    publicOperationPayloadBytes = stringToBytes('public data');
    privateOperationPayloadBytes = stringToBytes('private data');

    lambdaContract = lambdaContract || await deployLambda(tezosToolkit);

    [currentAccountBalanceBeforeAction, ownerAccountBalanceBeforeAction] = await Promise.all([
      tezosToolkit.tz.getBalance(currentAccountAddress),
      tezosToolkit.tz.getBalance(ownerAccountAddress),
    ]);
  };

  describe('Send_payment', () => {
    [
      [TezosPayments.OperationType.Payment, 'as a payment'] as const,
      [TezosPayments.OperationType.Donation, 'as a donation'] as const
    ].forEach(([paymentType, extraMessage]) => {
      it(`should allow to transfer tez tokens to a service owner (${extraMessage})`, async () => {
        await beforeEachBody();
        const tezAmount = 10;

        const result = await serviceContractInstance.send_payment(
          undefined,
          paymentType,
          'public', publicOperationPayloadBytes,
          undefined,
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

      it(`should allow to transfer FA 1.2 tokens to a service owner (${extraMessage})`, async () => {
        const currentAccountTokenAmount = new BigNumber(100);
        const transferTokenAmount = 10;

        await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId: 0 });

        const approveOp = await fa12Contract.methods.approve!(serviceContractInstance.address, transferTokenAmount).send();
        await approveOp.confirmation();

        const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
          fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
          fa12Contract.views.getBalance!(ownerAccountAddress).read(lambdaContract.address),
        ]);

        const result = await serviceContractInstance.send_payment(
          fa12Contract.address,
          null,
          transferTokenAmount,
          paymentType,
          'public', publicOperationPayloadBytes,
        );

        const storageAfterAction = await serviceContractInstance.storage();
        const [currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction] = await Promise.all([
          fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
          fa12Contract.views.getBalance!(ownerAccountAddress).read(lambdaContract.address),
        ]);

        expect(result).to.exist;
        expect(result.tx).to.exist;
        expect(storageAfterAction).to.deep.equal(serviceContractStorage);
        expect(currentAccountTokenBalanceAfterAction)
          .to.deep.equal(currentAccountTokenBalanceBeforeAction.minus(transferTokenAmount));
        expect(ownerAccountTokenBalanceAfterAction)
          .to.deep.equal(ownerAccountTokenBalanceBeforeAction.plus(transferTokenAmount));
      });

      it(`should allow to transfer FA 2.0 tokens to a service owner (${extraMessage})`, async () => {
        const currentAccountTokenAmount = new BigNumber(100);
        const transferTokenAmount = 10;
        const tokenId = 3;

        await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId });

        const updateOp = await fa20Contract.methods.update_operators!([{
          add_operator: {
            owner: currentAccountAddress,
            operator: serviceContractInstance.address,
            token_id: tokenId
          }
        }]).send();
        await updateOp.confirmation();

        const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
          fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
          fa20Contract.views.balance_of!([{ owner: ownerAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        ]);

        const result = await serviceContractInstance.send_payment(
          fa20Contract.address,
          tokenId,
          transferTokenAmount,
          paymentType,
          'public', publicOperationPayloadBytes,
        );

        const storageAfterAction = await serviceContractInstance.storage();
        const [currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction] = await Promise.all([
          fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
          fa20Contract.views.balance_of!([{ owner: ownerAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        ]);

        expect(result).to.exist;
        expect(result.tx).to.exist;
        expect(storageAfterAction).to.deep.equal(serviceContractStorage);
        expect(currentAccountTokenBalanceAfterAction)
          .to.deep.equal(currentAccountTokenBalanceBeforeAction.minus(transferTokenAmount));
        expect(ownerAccountTokenBalanceAfterAction)
          .to.deep.equal(ownerAccountTokenBalanceBeforeAction.plus(transferTokenAmount));
      });
    });

    it('should fail if a user tries to send FA 1.2 token with passed token id', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const transferTokenAmount = 10;

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId: 0 });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(ownerAccountAddress).read(lambdaContract.address),
      ]);

      await expect(serviceContractInstance.send_payment(
        fa12Contract.address,
        0,
        transferTokenAmount,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
      )).to.be.rejectedWith(serviceErrors.notFa20Contract);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(ownerAccountAddress).read(lambdaContract.address),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
    });

    it('should fail if a user tries to send FA 2.0 token without token id', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const transferTokenAmount = 10;
      const tokenId = 3;

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: ownerAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      await expect(serviceContractInstance.send_payment(
        fa20Contract.address,
        null,
        transferTokenAmount,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
      )).to.be.rejectedWith(serviceErrors.notFa12Contract);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: ownerAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
    });

    it('should fail if a user tries to send token but allowed assets list is empty', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const transferTokenAmount = 10;

      await beforeEachBody({
        allowed_tokens: {
          tez: true,
          assets: []
        }
      }, { amount: currentAccountTokenAmount, tokenId: 0 });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(ownerAccountAddress).read(lambdaContract.address),
      ]);

      await expect(serviceContractInstance.send_payment(
        fa12Contract.address,
        null,
        transferTokenAmount,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
      )).to.be.rejectedWith(serviceErrors.notAllowedToken);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(ownerAccountAddress).read(lambdaContract.address),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
    });

    it('should fail if a user tries to send token but allowed assets list does not contain it', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const transferTokenAmount = 10;
      const tokenId = 3;

      await beforeEachBody({
        allowed_tokens: {
          tez: true,
          assets: ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV']
        }
      }, { amount: currentAccountTokenAmount, tokenId });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: ownerAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      await expect(serviceContractInstance.send_payment(
        fa20Contract.address,
        tokenId,
        transferTokenAmount,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
      )).to.be.rejectedWith(serviceErrors.notAllowedToken);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: ownerAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer 0 tez tokens', async () => {
      await beforeEachBody();
      await expect(serviceContractInstance.send_payment(
        undefined,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
        undefined,
        undefined,
        { amount: 0 }
      )).to.be.rejectedWith(commonErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(ownerAccountAddress),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer 0 FA 1.2 tokens', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const transferTokenAmount = 0;

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId: 0 });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(ownerAccountAddress).read(lambdaContract.address),
      ]);

      await expect(serviceContractInstance.send_payment(
        fa12Contract.address,
        null,
        transferTokenAmount,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
      )).to.be.rejectedWith(commonErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(ownerAccountAddress).read(lambdaContract.address),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer 0 FA 2.0 tokens', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const transferTokenAmount = 0;
      const tokenId = 3;

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: ownerAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      await expect(serviceContractInstance.send_payment(
        fa20Contract.address,
        tokenId,
        transferTokenAmount,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
      )).to.be.rejectedWith(commonErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: ownerAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer tez tokens but tez tokens are not allowed', async () => {
      await beforeEachBody({
        allowed_tokens: {
          tez: false,
          assets: []
        }
      });

      await expect(serviceContractInstance.send_payment(
        undefined,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
        undefined,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(serviceErrors.notAllowedToken);

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
      const contractAddress = 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV';
      await beforeEachBody({
        allowed_tokens: {
          tez: true,
          assets: [contractAddress]
        }
      });

      await expect(serviceContractInstance.send_payment(
        contractAddress,
        null,
        463,
        TezosPayments.OperationType.Payment,
        'public', publicOperationPayloadBytes,
        { amount: 11 }
      )).to.be.rejectedWith(commonErrors.invalidAmount);

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
      invalidOperationTypeTestCases.forEach(([caseName, invalidOperationType, errorMessage]) => {
        it(`the invalid operation type == ${invalidOperationType} (${caseName})`, async () => {
          await beforeEachBody();
          await expect(serviceContractInstance.send_payment(
            undefined,
            invalidOperationType,
            'public', publicOperationPayloadBytes,
            undefined,
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
          await beforeEachBody();
          await expect(serviceContractInstance.send_payment(
            undefined,
            invalidOperationType,
            'public', publicOperationPayloadBytes,
            undefined,
            undefined,
            { amount: 10 }
          )).to.be.rejectedWith(commonErrors.invalidOperationType);

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
            undefined,
            { amount: 10 }
          )).to.be.rejectedWith(commonErrors.invalidOperationType);

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
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(serviceErrors.serviceIsPaused);

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
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(serviceErrors.serviceIsDeleted);

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
      await beforeEachBody();
      await expect(serviceContractInstance.send_payment(
        undefined,
        TezosPayments.OperationType.Payment,
        'private', privateOperationPayloadBytes,
        undefined,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(serviceErrors.privatePayloadNotSupported);
      await expect(serviceContractInstance.send_payment(
        undefined,
        TezosPayments.OperationType.Payment,
        'public_and_private', publicOperationPayloadBytes, privateOperationPayloadBytes,
        undefined,
        undefined,
        { amount: 10 }
      )).to.be.rejectedWith(serviceErrors.privatePayloadNotSupported);

      await expect(serviceContractInstance.send_payment(
        'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        null,
        2323,
        TezosPayments.OperationType.Payment,
        'private', privateOperationPayloadBytes,
      )).to.be.rejectedWith(serviceErrors.privatePayloadNotSupported);
      await expect(serviceContractInstance.send_payment(
        'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        null,
        2323,
        TezosPayments.OperationType.Payment,
        'public_and_private', publicOperationPayloadBytes, privateOperationPayloadBytes,
      )).to.be.rejectedWith(serviceErrors.privatePayloadNotSupported);

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
