import { MichelsonType, packDataBytes } from '@taquito/michel-codec';
import { InMemorySigner } from '@taquito/signer';
import { MichelsonMap } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

import { tezToMutez, tokensAmountToNat } from './converters';

export const createSigningKeyMichelsonMap = (signingKeys: readonly TezosPayments.SigningKey[]): TezosPayments.SigningKeys => {
  const result = new MichelsonMap<TezosPayments.SigningKey['public_key'], TezosPayments.SigningKey>({
    prim: 'map',
    args: [
      { prim: 'key' },
      {
        prim: 'pair',
        args: [
          { prim: 'key', annots: ['%public_key'] },
          { prim: 'option', args: [{ prim: 'string' }], annots: ['%name'] }
        ]
      }
    ]
  });
  signingKeys.forEach(signingKey => result.set(signingKey.public_key, signingKey));

  return result;
};

export const createSigningKeyUpdatesMichelsonMap = (actions: {
  readonly addOrUpdate?: readonly TezosPayments.SigningKey[],
  readonly delete?: ReadonlyArray<TezosPayments.SigningKey['public_key']>
}): TezosPayments.SigningKeyUpdates => {
  const result = new MichelsonMap<TezosPayments.SigningKey['public_key'], TezosPayments.SigningKey | null>({
    prim: 'map',
    args: [
      { prim: 'key' },
      {
        prim: 'option',
        args: [{
          prim: 'pair',
          args: [
            { prim: 'key', annots: ['%public_key'] },
            { prim: 'option', args: [{ prim: 'string' }], annots: ['%name'] }
          ]
        }]
      }]
  });
  actions.addOrUpdate && actions.addOrUpdate.forEach(signingKey => result.set(signingKey.public_key, signingKey));
  actions.delete && actions.delete.forEach(signingKeyPublicKey => result.set(signingKeyPublicKey, null));

  return result;
};

export interface SignPaymentData {
  readonly id: string;
  readonly targetAddress: string;
  readonly amount: BigNumber;
  readonly asset?: {
    address: string;
    decimals: number;
    tokenId?: number;
  };
}

const paymentSigners = new Map<string, InMemorySigner>();
const getPaymentSigner = (secretKey: string): InMemorySigner => {
  let signer = paymentSigners.get(secretKey);
  if (!signer) {
    signer = new InMemorySigner(secretKey);
    paymentSigners.set(secretKey, signer);
  }

  return signer;
};

const getPaymentSignPayload = (payment: SignPaymentData): string => {
  const signPayload = payment.asset
    ? packDataBytes(
      {
        prim: 'Pair',
        args: [
          {
            prim: 'Pair',
            args: [
              { string: payment.id },
              { string: payment.targetAddress }
            ]
          },
          {
            prim: 'Pair',
            args: [
              { int: tokensAmountToNat(payment.amount, payment.asset.decimals).toString(10) },
              { string: payment.asset.address }
            ]
          }
        ]
      },
      paymentInAssetSignPayloadMichelsonType
    )
    : packDataBytes(
      {
        prim: 'Pair',
        args: [
          {
            prim: 'Pair',
            args: [
              { string: payment.id },
              { string: payment.targetAddress }
            ]
          },
          { int: tezToMutez(payment.amount).toString(10) }
        ]
      },
      paymentInTezSignPayloadMichelsonType
    );

  return '0x' + signPayload.bytes;
};

export const createPaymentSignature = async (payment: SignPaymentData, secretKey: string): Promise<string> => {
  const signer = getPaymentSigner(secretKey);
  const payload = getPaymentSignPayload(payment);

  return (await signer.sign(payload)).prefixSig;
};

export const paymentInTezSignPayloadMichelsonType: MichelsonType = {
  prim: 'pair',
  args: [
    {
      prim: 'pair',
      args: [
        { prim: 'string' },
        { prim: 'address' }
      ]
    },
    { prim: 'mutez' }
  ]
};

export const paymentInAssetSignPayloadMichelsonType: MichelsonType = {
  prim: 'pair',
  args: [
    {
      prim: 'pair',
      args: [
        { prim: 'string' },
        { prim: 'address' }
      ]
    },
    {
      prim: 'pair',
      args: [
        { prim: 'nat' },
        { prim: 'address' }
      ]
    }
  ]
};
