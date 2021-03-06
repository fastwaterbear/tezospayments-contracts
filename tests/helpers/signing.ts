import { MichelsonType, packDataBytes } from '@taquito/michel-codec';
import { InMemorySigner } from '@taquito/signer';
import BigNumber from 'bignumber.js';

import { tezToMutez } from './converters';

export interface SignPaymentData {
  readonly id: string;
  readonly targetAddress: string;
  readonly amount: BigNumber;
  readonly asset?: {
    address: string;
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
                  { int: payment.amount.toString(10) },
                  { string: payment.asset.address }
                ]
              }
            ]
          },
          payment.asset.tokenId !== undefined && payment.asset.tokenId !== null
            ? { prim: 'Some', args: [{ int: payment.asset.tokenId.toString(10) }] }
            : { prim: 'None' }
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
    },
    {
      prim: 'option',
      args: [{ prim: 'nat' }]
    }
  ]
};
