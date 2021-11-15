import { ContractAbstraction, ContractProvider, MichelsonMap } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import { expect } from 'chai';

import {
  commonErrors, serviceErrors, useLastTezosToolkit, deployService,
  tezToMutez, createSigningKeyMichelsonMap, deployFa12, deployLambda, deployFa20, createPaymentSignature, getBalanceUpdate, decapitalize
} from '../helpers';
import { admins } from '../testData';
import { signingPayloadsTestCases } from '../testData/signingPayloads';

const [serviceContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('service'));

contract('Service | Actions', accounts => {
  const currentAccountAddress = accounts[0]!;
  const owner = { address: admins[0].pkh, publicKey: admins[0].pk, secretKey: admins[0].formattedSk };

  let serviceContractInstance: TezosPayments.ServiceContract.Instance;
  let serviceContractStorage: TezosPayments.ServiceContract.Storage;
  let currentAccountBalanceBeforeAction: BigNumber;
  let ownerAccountBalanceBeforeAction: BigNumber;
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
      owner: owner.address,
      signing_keys: createSigningKeyMichelsonMap([{ public_key: owner.publicKey, name: null }]),
      allowed_operation_type: new BigNumber(TezosPayments.OperationType.All),
      allowed_tokens: {
        tez: true,
        assets: tokensInfo ? [fa12Contract.address, fa20Contract.address] : []
      },
      ...initialStorageState
    });

    lambdaContract = lambdaContract || await deployLambda(tezosToolkit);

    [currentAccountBalanceBeforeAction, ownerAccountBalanceBeforeAction] = await Promise.all([
      tezosToolkit.tz.getBalance(currentAccountAddress),
      tezosToolkit.tz.getBalance(owner.address),
    ]);
  };

  describe('Send_payment', () => {
    it('should allow to transfer tez tokens to a service owner', async () => {
      await beforeEachBody();

      const tezAmount = new BigNumber(10);
      const paymentId = 'test-payment-3743';
      const paymentSignature = await createPaymentSignature(
        { id: paymentId, targetAddress: serviceContractInstance.address, amount: tezAmount },
        owner.secretKey
      );

      const result = await serviceContractInstance.send_payment(
        paymentId,
        undefined,
        paymentSignature,
        { amount: tezAmount }
      );

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
      ]);

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction)
        .to.deep.equal(currentAccountBalanceBeforeAction.plus(getBalanceUpdate(result.receipt, currentAccountAddress)));
      expect(ownerAccountBalanceAfterAction)
        .to.deep.equal(ownerAccountBalanceBeforeAction.plus(tezToMutez(tezAmount)));
    });

    it('should allow to transfer FA 1.2 tokens to a service owner', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const transferTokenAmount = new BigNumber(10);

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId: 0 });

      const approveOp = await fa12Contract.methods.approve!(serviceContractInstance.address, transferTokenAmount).send();
      await approveOp.confirmation();

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(owner.address).read(lambdaContract.address),
      ]);

      const paymentId = 'test-payment-4837';
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: transferTokenAmount,
          asset: {
            address: fa12Contract.address,
          }
        },
        owner.secretKey
      );

      const result = await serviceContractInstance.send_payment(
        paymentId,
        fa12Contract.address,
        null,
        transferTokenAmount,
        paymentSignature
      );

      const storageAfterAction = await serviceContractInstance.storage();
      const [
        currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction,
        currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction
      ] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(owner.address).read(lambdaContract.address),
      ]);
      const currentAccountBalanceUpdate = getBalanceUpdate(approveOp, currentAccountAddress)
        .plus(getBalanceUpdate(result.receipt, currentAccountAddress));

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction)
        .to.deep.equal(currentAccountTokenBalanceBeforeAction.minus(transferTokenAmount));
      expect(ownerAccountTokenBalanceAfterAction)
        .to.deep.equal(ownerAccountTokenBalanceBeforeAction.plus(transferTokenAmount));
      expect(currentAccountBalanceAfterAction)
        .to.deep.equal(currentAccountBalanceBeforeAction.plus(currentAccountBalanceUpdate));
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should allow to transfer FA 2.0 tokens to a service owner', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
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
        fa20Contract.views.balance_of!([{ owner: owner.address, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      const paymentId = 'test-payment-9232';
      const transferTokenAmount = new BigNumber(10);
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: transferTokenAmount,
          asset: {
            address: fa20Contract.address,
            tokenId
          }
        },
        owner.secretKey
      );

      const result = await serviceContractInstance.send_payment(
        paymentId,
        fa20Contract.address,
        tokenId,
        transferTokenAmount,
        paymentSignature
      );

      const storageAfterAction = await serviceContractInstance.storage();
      const [
        currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction,
        currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction
      ] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: owner.address, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);
      const currentAccountBalanceUpdate = getBalanceUpdate(updateOp, currentAccountAddress)
        .plus(getBalanceUpdate(result.receipt, currentAccountAddress));

      expect(result).to.exist;
      expect(result.tx).to.exist;
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction)
        .to.deep.equal(currentAccountTokenBalanceBeforeAction.minus(transferTokenAmount));
      expect(ownerAccountTokenBalanceAfterAction)
        .to.deep.equal(ownerAccountTokenBalanceBeforeAction.plus(transferTokenAmount));
      expect(currentAccountBalanceAfterAction)
        .to.deep.equal(currentAccountBalanceBeforeAction.plus(currentAccountBalanceUpdate));
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to send FA 1.2 token with passed token id', async () => {
      const currentAccountTokenAmount = new BigNumber(100);

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId: 0 });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(owner.address).read(lambdaContract.address),
      ]);

      const paymentId = 'test-payment-7384';
      const transferTokenAmount = new BigNumber(10);
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: transferTokenAmount,
          asset: {
            address: fa12Contract.address,
            tokenId: 0
          }
        },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        fa12Contract.address,
        0,
        transferTokenAmount,
        paymentSignature
      )).to.be.rejectedWith(serviceErrors.notFa20Contract);

      const storageAfterAction = await serviceContractInstance.storage();
      const [
        currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction,
        currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction
      ] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(owner.address).read(lambdaContract.address),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to send FA 2.0 token without token id', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const tokenId = 3;

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: owner.address, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      const paymentId = 'test-payment-3431';
      const transferTokenAmount = new BigNumber(10);
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: transferTokenAmount,
          asset: {
            address: fa20Contract.address,
          }
        },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        fa20Contract.address,
        null,
        transferTokenAmount,
        paymentSignature
      )).to.be.rejectedWith(serviceErrors.notFa12Contract);

      const storageAfterAction = await serviceContractInstance.storage();
      const [
        currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction,
        currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction
      ] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: owner.address, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to send token but allowed assets list is empty', async () => {
      const currentAccountTokenAmount = new BigNumber(100);

      await beforeEachBody({
        allowed_tokens: {
          tez: true,
          assets: []
        }
      }, { amount: currentAccountTokenAmount, tokenId: 0 });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(owner.address).read(lambdaContract.address),
      ]);

      const paymentId = 'test-payment-2324';
      const transferTokenAmount = new BigNumber(10);
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: transferTokenAmount,
          asset: {
            address: fa12Contract.address,
          }
        },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        fa12Contract.address,
        null,
        transferTokenAmount,
        paymentSignature
      )).to.be.rejectedWith(serviceErrors.notAllowedToken);

      const storageAfterAction = await serviceContractInstance.storage();
      const [
        currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction,
        currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction
      ] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(owner.address).read(lambdaContract.address),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to send token but allowed assets list does not contain it', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const tokenId = 3;

      await beforeEachBody({
        allowed_tokens: {
          tez: true,
          assets: ['KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV']
        }
      }, { amount: currentAccountTokenAmount, tokenId });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: owner.address, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      const paymentId = 'test-payment-1438';
      const transferTokenAmount = new BigNumber(10);
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: transferTokenAmount,
          asset: {
            address: fa20Contract.address,
            tokenId
          }
        },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        fa20Contract.address,
        tokenId,
        transferTokenAmount,
        paymentSignature
      )).to.be.rejectedWith(serviceErrors.notAllowedToken);

      const storageAfterAction = await serviceContractInstance.storage();
      const [
        currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction,
        currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction
      ] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: owner.address, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer 0 tez tokens', async () => {
      await beforeEachBody();

      const paymentId = 'test-payment-0433';
      const paymentSignature = await createPaymentSignature(
        { id: paymentId, targetAddress: serviceContractInstance.address, amount: new BigNumber(0) },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        undefined,
        paymentSignature,
        { amount: 0 }
      )).to.be.rejectedWith(commonErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer 0 FA 1.2 tokens', async () => {
      const currentAccountTokenAmount = new BigNumber(100);

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId: 0 });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(owner.address).read(lambdaContract.address),
      ]);

      const paymentId = 'test-payment-8341';
      const transferTokenAmount = new BigNumber(0);
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: transferTokenAmount,
          asset: {
            address: fa12Contract.address,
          }
        },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        fa12Contract.address,
        null,
        transferTokenAmount,
        paymentSignature
      )).to.be.rejectedWith(commonErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [
        currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction,
        currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction
      ] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
        fa12Contract.views.getBalance!(currentAccountAddress).read(lambdaContract.address),
        fa12Contract.views.getBalance!(owner.address).read(lambdaContract.address),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer 0 FA 2.0 tokens', async () => {
      const currentAccountTokenAmount = new BigNumber(100);
      const tokenId = 3;

      await beforeEachBody(undefined, { amount: currentAccountTokenAmount, tokenId });

      const [currentAccountTokenBalanceBeforeAction, ownerAccountTokenBalanceBeforeAction] = await Promise.all([
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: owner.address, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      const paymentId = 'test-payment-7231';
      const transferTokenAmount = new BigNumber(0);
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: transferTokenAmount,
          asset: {
            address: fa20Contract.address,
            tokenId
          }
        },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        fa20Contract.address,
        tokenId,
        transferTokenAmount,
        paymentSignature
      )).to.be.rejectedWith(commonErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [
        currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction,
        currentAccountTokenBalanceAfterAction, ownerAccountTokenBalanceAfterAction
      ] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
        fa20Contract.views.balance_of!([{ owner: currentAccountAddress, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
        fa20Contract.views.balance_of!([{ owner: owner.address, token_id: tokenId }]).read(lambdaContract.address).then(r => r[0].balance),
      ]);

      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountTokenBalanceAfterAction).to.deep.equal(currentAccountTokenBalanceBeforeAction);
      expect(ownerAccountTokenBalanceAfterAction).to.deep.equal(ownerAccountTokenBalanceBeforeAction);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if a user tries to transfer tez tokens but tez tokens are not allowed', async () => {
      await beforeEachBody({
        allowed_tokens: {
          tez: false,
          assets: []
        }
      });

      const tezAmount = new BigNumber(10);
      const paymentId = 'test-payment-9043';
      const paymentSignature = await createPaymentSignature(
        { id: paymentId, targetAddress: serviceContractInstance.address, amount: tezAmount },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        undefined,
        paymentSignature,
        { amount: tezAmount }
      )).to.be.rejectedWith(serviceErrors.notAllowedToken);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
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

      const tokenAmount = new BigNumber(463);
      const paymentId = 'test-payment-3421';
      const paymentSignature = await createPaymentSignature(
        {
          id: paymentId,
          targetAddress: serviceContractInstance.address,
          amount: tokenAmount,
          asset: {
            address: contractAddress,
          }
        },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        contractAddress,
        null,
        tokenAmount,
        paymentSignature,
        { amount: 11 }
      )).to.be.rejectedWith(commonErrors.invalidAmount);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if the service is paused', async () => {
      await beforeEachBody({ paused: true });

      const tezAmount = new BigNumber(10);
      const paymentId = 'test-payment-3712';
      const paymentSignature = await createPaymentSignature(
        { id: paymentId, targetAddress: serviceContractInstance.address, amount: tezAmount },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        undefined,
        paymentSignature,
        { amount: tezAmount }
      )).to.be.rejectedWith(serviceErrors.serviceIsPaused);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if the service is deleted', async () => {
      await beforeEachBody({ deleted: true });

      const tezAmount = new BigNumber(10);
      const paymentId = 'test-payment-9301';
      const paymentSignature = await createPaymentSignature(
        { id: paymentId, targetAddress: serviceContractInstance.address, amount: tezAmount },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        undefined,
        paymentSignature,
        { amount: tezAmount }
      )).to.be.rejectedWith(serviceErrors.serviceIsDeleted);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    it('should fail if the service already processed same payment id', async () => {
      const paymentId = 'test-payment-9301';

      await beforeEachBody({
        completed_payments: MichelsonMap.fromLiteral({
          [paymentId]: null
        })
      });

      const tezAmount = new BigNumber(10);
      const paymentSignature = await createPaymentSignature(
        { id: paymentId, targetAddress: serviceContractInstance.address, amount: tezAmount },
        owner.secretKey
      );

      await expect(serviceContractInstance.send_payment(
        paymentId,
        undefined,
        paymentSignature,
        { amount: tezAmount }
      )).to.be.rejectedWith(serviceErrors.paymentIsAlreadyCompleted);

      const storageAfterAction = await serviceContractInstance.storage();
      const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
        tezosToolkit.tz.getBalance(currentAccountAddress),
        tezosToolkit.tz.getBalance(owner.address),
      ]);
      expect(storageAfterAction).to.deep.equal(serviceContractStorage);
      expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
      expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
    });

    signingPayloadsTestCases.forEach(([caseName, getTestData, expectedError]) => {
      it(`should fail if ${decapitalize(caseName)} in payment signature`, async () => {
        await beforeEachBody();

        const testData = await getTestData(serviceContractInstance.address, owner.secretKey);

        const { id: paymentId, amount, asset } = testData[0];
        const paymentSignature = testData[1];

        if (asset) {
          await expect(serviceContractInstance.send_payment(
            paymentId,
            asset.address,
            asset.tokenId !== undefined ? asset.tokenId : null,
            amount,
            paymentSignature
          )).to.be.rejectedWith(expectedError!);
        } else {
          await expect(serviceContractInstance.send_payment(
            paymentId,
            undefined,
            paymentSignature,
            { amount }
          )).to.be.rejectedWith(expectedError!);
        }

        const storageAfterAction = await serviceContractInstance.storage();
        const [currentAccountBalanceAfterAction, ownerAccountBalanceAfterAction] = await Promise.all([
          tezosToolkit.tz.getBalance(currentAccountAddress),
          tezosToolkit.tz.getBalance(owner.address),
        ]);
        expect(storageAfterAction).to.deep.equal(serviceContractStorage);
        expect(currentAccountBalanceAfterAction).to.deep.equal(currentAccountBalanceBeforeAction);
        expect(ownerAccountBalanceAfterAction).to.deep.equal(ownerAccountBalanceBeforeAction);
      });
    });
  });
});
