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
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'SENDER' }, { prim: 'DUP', args: [{ int: '3' }] },
  { prim: 'CDR' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'DIG', args: [{ int: '3' }] }, { prim: 'CAR' },
  { prim: 'PAIR' }, { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'AMOUNT' },
  { prim: 'NONE', args: [{ prim: 'key_hash' }] },
  {
    prim: 'CREATE_CONTRACT',
    args:
      [[{ prim: 'parameter', args: [{ prim: 'unit' }] },
      {
        prim: 'storage',
        args:
          [{
            prim: 'pair',
            args:
              [{
                prim: 'pair',
                args:
                  [{
                    prim: 'pair',
                    args:
                      [{
                        prim: 'pair',
                        args:
                          [{
                            prim: 'set',
                            args: [{ prim: 'address' }],
                            annots: ['%assets']
                          },
                          {
                            prim: 'bool',
                            annots: ['%tez']
                          }],
                        annots: ['%allowed_tokens']
                      },
                      {
                        prim: 'bool',
                        annots: ['%deleted']
                      }]
                  },
                  {
                    prim: 'pair',
                    args:
                      [{
                        prim: 'bytes',
                        annots: ['%metadata']
                      },
                      {
                        prim: 'address',
                        annots: ['%owner']
                      }]
                  }]
              },
              { prim: 'bool', annots: ['%paused'] }]
          }]
      },
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
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'SENDER' }, { prim: 'DUP', args: [{ int: '3' }] },
  { prim: 'CDR' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'DIG', args: [{ int: '3' }] }, { prim: 'CAR' },
  { prim: 'PAIR' }, { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'AMOUNT' },
  { prim: 'NONE', args: [{ prim: 'key_hash' }] },
  {
    prim: 'CREATE_CONTRACT',
    args:
      [[{ prim: 'parameter', args: [{ prim: 'unit' }] },
      {
        prim: 'storage',
        args:
          [{
            prim: 'pair',
            args:
              [{
                prim: 'pair',
                args:
                  [{
                    prim: 'pair',
                    args:
                      [{
                        prim: 'pair',
                        args:
                          [{
                            prim: 'set',
                            args: [{ prim: 'address' }],
                            annots: ['%assets']
                          },
                          {
                            prim: 'bool',
                            annots: ['%tez']
                          }],
                        annots: ['%allowed_tokens']
                      },
                      {
                        prim: 'bool',
                        annots: ['%deleted']
                      }]
                  },
                  {
                    prim: 'pair',
                    args:
                      [{
                        prim: 'bytes',
                        annots: ['%metadata']
                      },
                      {
                        prim: 'address',
                        annots: ['%owner']
                      }]
                  }]
              },
              { prim: 'bool', annots: ['%paused'] }]
          }]
      },
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
  { prim: 'PAIR' },
  { prim: 'PAIR' }
] as const;
