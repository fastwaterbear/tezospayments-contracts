import { ParameterSchema } from '@taquito/michelson-encoder';
import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { Prefix, prefix, b58cdecode } from '@taquito/utils';

interface TruffleContractInternal {
  interfaceAdapter: {
    tezos: {
      _rpcClient: {
        url: string;
      },
      signer: {
        _key: {
          key: string
        }
      }
    }
  }
}

export const useLastTezosToolkit = <TInstance extends Truffle.ContractInstance<unknown>>(
  truffleContract: Truffle.Contract<TInstance>
) => {
  const oldTezosToolkit = (truffleContract as unknown as TruffleContractInternal).interfaceAdapter.tezos;
  const rpcUrl = oldTezosToolkit._rpcClient.url;
  const secretKey = oldTezosToolkit.signer._key.key;

  const tezosToolkit = new TezosToolkit(rpcUrl);
  const signer = new InMemorySigner(secretKey);

  tezosToolkit.setProvider({ config: { confirmationPollingIntervalSecond: 1 } });
  tezosToolkit.setSignerProvider(signer);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (truffleContract as unknown as TruffleContractInternal).interfaceAdapter.tezos = tezosToolkit as any;

  return [truffleContract, tezosToolkit] as const;
};

// TODO: Remove this workaround after this PR: https://github.com/ecadlabs/taquito/pull/1044
const keyTokenPrototype = Object.getPrototypeOf((new ParameterSchema({ prim: 'key', args: [], annots: [] }) as any).root);
const keyTokenOriginalCompare = keyTokenPrototype.compare;

const publicKeyPrefixLength = 4;
const keyTokenGetPrefix = (val: string) => val.substring(0, publicKeyPrefixLength);
const keyTokenGetP256PublicKeyComparableBytes = (p2pk: string) => b58cdecode(p2pk, prefix[Prefix.P2PK]).slice(1);

const keyTokenCompare = (key1: string, key2: string): number => {
  const keyPrefix1 = keyTokenGetPrefix(key1);
  const keyPrefix2 = keyTokenGetPrefix(key2);

  if (keyPrefix1 === Prefix.EDPK && keyPrefix2 !== Prefix.EDPK) {
    return -1;
  }
  else if (keyPrefix1 === Prefix.SPPK && keyPrefix2 !== Prefix.SPPK) {
    return keyPrefix2 === Prefix.EDPK ? 1 : -1;
  }
  else if (keyPrefix1 === Prefix.P2PK) {
    if (keyPrefix2 !== Prefix.P2PK) {
      return 1;
    }

    const keyBytes1 = keyTokenGetP256PublicKeyComparableBytes(key1);
    const keyBytes2 = keyTokenGetP256PublicKeyComparableBytes(key2);
    return Buffer.compare(keyBytes1, keyBytes2);
  }

  return keyTokenOriginalCompare.call(this, key1, key2);
};

keyTokenPrototype.compare = keyTokenCompare;
keyTokenPrototype.getPrefix = keyTokenGetPrefix;
keyTokenPrototype.getP256PublicKeyComparableBytes = keyTokenGetP256PublicKeyComparableBytes;
