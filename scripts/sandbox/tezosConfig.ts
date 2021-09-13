export const tezToMutez = 1_000_000;

export const protocols = {
  edo: {
    id: '008-PtEdoTez',
    kind: 'Edo',
    hash: 'PtEdo2ZkT9oKpimTah6x2embF25oss54njMuPzkJTEi5RqfdZFA',
  },
  granada: {
    id: '010-PtGRANAD',
    kind: 'Granada',
    hash: 'PtGRANADsDU8R9daYKAgWnQYAJ64omN1o3KMGVCykShA97vQbvV',
  }
} as const;
export type TezosProtocol = typeof protocols[keyof typeof protocols];

export const nodeParameterNames = ['baker', 'endorser', 'accuser'] as const;
