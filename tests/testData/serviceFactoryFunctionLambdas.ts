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
  { prim: 'CAR' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'DIG', args: [{ int: '3' }] }, { prim: 'CDR' },
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
                            prim: 'bool',
                            annots: ['%tez']
                          },
                          {
                            prim: 'set',
                            args: [{ prim: 'address' }],
                            annots: ['%assets']
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
  { prim: 'CAR' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'DIG', args: [{ int: '3' }] }, { prim: 'CDR' },
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
                            prim: 'bool',
                            annots: ['%tez']
                          },
                          {
                            prim: 'set',
                            args: [{ prim: 'address' }],
                            annots: ['%assets']
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

export const actualServiceFactoryFunctionLambda = [
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '0' }] },
  { prim: 'SWAP' }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] }, { prim: 'CDR' },
  { prim: 'CDR' }, { prim: 'SIZE' }, { prim: 'COMPARE' },
  { prim: 'EQ' }, { prim: 'SWAP' }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] }, { prim: 'CDR' },
  { prim: 'CAR' }, { prim: 'NOT' }, { prim: 'AND' },
  {
    prim: 'IF',
    args:
      [[{
        prim: 'PUSH',
        args: [{ prim: 'string' }, { string: 'No allowed tokens' }]
      },
      { prim: 'FAILWITH' }], []]
  },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'SENDER' }, { prim: 'DUP', args: [{ int: '3' }] },
  { prim: 'CAR' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'DIG', args: [{ int: '3' }] }, { prim: 'CDR' },
  { prim: 'PAIR' }, { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'AMOUNT' },
  { prim: 'NONE', args: [{ prim: 'key_hash' }] },
  {
    prim: 'CREATE_CONTRACT',
    args:
      [[{
        prim: 'parameter',
        args:
          [{
            prim: 'or',
            args:
              [{
                prim: 'or',
                args:
                  [{ prim: 'bool', annots: ['%set_deleted'] },
                  { prim: 'address', annots: ['%set_owner'] }]
              },
              { prim: 'bool', annots: ['%set_pause'] }]
          }]
      },
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
                            prim: 'bool',
                            annots: ['%tez']
                          },
                          {
                            prim: 'set',
                            args: [{ prim: 'address' }],
                            annots: ['%assets']
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
          [[{ prim: 'DROP' },
          {
            prim: 'PUSH',
            args:
              [{ prim: 'string' },
              { string: 'Only owner can do this' }]
          },
          { prim: 'FAILWITH' }]]
      }]]
  },
  { prim: 'PAIR' }
] as const;

