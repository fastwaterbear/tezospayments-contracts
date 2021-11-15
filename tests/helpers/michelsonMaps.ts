import { Schema } from '@taquito/michelson-encoder';
import { BigMapAbstraction, MichelsonMap, TezosToolkit } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

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

export const completedPaymentsBigMapSchema = new Schema({
  prim: 'big_map',
  args: [
    { prim: 'string' },
    { prim: 'unit' }
  ],
  annots: ['%completed_payments']
});

export const createCompletedPaymentsBigMap = (
  id: BigNumber | number | string,
  tezosToolkit: TezosToolkit
) => new BigMapAbstraction(new BigNumber(id), completedPaymentsBigMapSchema, tezosToolkit.contract);
