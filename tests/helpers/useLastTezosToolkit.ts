import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';

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
