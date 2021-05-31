export const notImplementedLambda = [
  { prim: 'DROP' },
  {
    prim: 'PUSH',
    args:
      [{ prim: 'string' }, { string: 'Not implemented' }]
  },
  { prim: 'FAILWITH' }
] as const;

export const createEmptyContractLambda = [
  { prim: 'AMOUNT' },
  { prim: 'NONE', args: [{ prim: 'key_hash' }] },
  {
    prim: 'CREATE_CONTRACT',
    args:
      [[{ prim: 'parameter', args: [{ prim: 'unit' }] },
      { prim: 'storage', args: [{ prim: 'bytes' }] },
      {
        prim: 'code',
        args:
          [[{ prim: 'CDR' },
          {
            prim: 'NIL',
            args: [{ prim: 'operation' }]
          },
          { prim: 'PAIR' }]]
      }]]
  },
  { prim: 'PAIR' }
] as const;

export const invalidSignatureLambda = [
  { prim: 'AMOUNT' },
  { prim: 'NONE', args: [{ prim: 'key_hash' }] },
  {
    prim: 'CREATE_CONTRACT',
    args:
      [[{ prim: 'parameter', args: [{ prim: 'unit' }] },
      { prim: 'storage', args: [{ prim: 'bytes' }] },
      {
        prim: 'code',
        args:
          [[{ prim: 'CDR' },
          {
            prim: 'NIL',
            args: [{ prim: 'operation' }]
          },
          { prim: 'PAIR' }]]
      }]]
  },
  {
    prim: 'PUSH',
    args: [{ prim: 'nat' }, { int: '100' }]
  },
  { prim: 'DUG', args: [{ int: '2' }] },
  { prim: 'PAIR' }, { prim: 'PAIR' }
] as const;
