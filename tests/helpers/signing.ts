import { MichelsonMap } from '@taquito/taquito';

export const createSigningKeyMichelsonMap = (signingKeys: readonly TezosPayments.SigningKey[]): TezosPayments.SigningKeys => {
  const result = new MichelsonMap<TezosPayments.SigningKey[0], TezosPayments.SigningKey['1']>({
    prim: 'map',
    args: [
      { prim: 'key' },
      { prim: 'option', args: [{ prim: 'string' }] }
    ]
  });
  signingKeys.forEach(signingKey => result.set(signingKey[0], signingKey[1]));

  return result;
};
