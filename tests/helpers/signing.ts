import { MichelsonMap } from '@taquito/taquito';

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
