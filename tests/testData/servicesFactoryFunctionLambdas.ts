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
  { prim: 'DROP' }, { prim: 'UNIT' }, { prim: 'AMOUNT' },
  { prim: 'NONE', args: [{ prim: 'key_hash' }] },
  {
    prim: 'CREATE_CONTRACT',
    args:
      [[{ prim: 'parameter', args: [{ prim: 'unit' }] },
      { prim: 'storage', args: [{ prim: 'unit' }] },
      {
        prim: 'code',
        args:
          [[{ prim: 'DROP' }, { prim: 'UNIT' },
          { prim: 'NIL', args: [{ prim: 'operation' }] },
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
      [[{
        prim: 'parameter',
        args:
          [{
            prim: 'or',
            args:
              [{
                prim: 'or',
                args:
                  [{
                    prim: 'or',
                    args:
                      [{
                        prim: 'bool',
                        annots: ['%set_deleted']
                      },
                      {
                        prim: 'address',
                        annots: ['%set_owner']
                      }]
                  },
                  {
                    prim: 'or',
                    args:
                      [{
                        prim: 'bool',
                        annots: ['%set_pause']
                      },
                      {
                        prim: 'pair',
                        args:
                          [{
                            prim: 'option',
                            args: [{ prim: 'bytes' }],
                            annots: ['%metadata']
                          },
                          {
                            prim: 'pair',
                            args:
                              [{
                                prim: 'option',
                                args:
                                  [{ prim: 'bool' }],
                                annots: ['%tez']
                              },
                              {
                                prim: 'option',
                                args:
                                  [{
                                    prim: 'set',
                                    args:
                                      [{ prim: 'address' }]
                                  }],
                                annots: ['%assets']
                              }],
                            annots: ['%allowed_tokens']
                          }],
                        annots:
                          ['%update_service_parameters']
                      }]
                  }],
                annots: ['%owner_action']
              },
              {
                prim: 'pair',
                args:
                  [{
                    prim: 'option',
                    args:
                      [{
                        prim: 'pair',
                        args:
                          [{
                            prim: 'address',
                            annots: ['%token_address']
                          },
                          {
                            prim: 'nat',
                            annots: ['%value']
                          }]
                      }],
                    annots: ['%asset_value']
                  },
                  {
                    prim: 'or',
                    args:
                      [{
                        prim: 'bytes',
                        annots: ['%public']
                      },
                      {
                        prim: 'or',
                        args:
                          [{
                            prim: 'bytes',
                            annots: ['%private']
                          },
                          {
                            prim: 'pair',
                            args:
                              [{ prim: 'bytes' },
                              { prim: 'bytes' }],
                            annots: ['%public_and_private']
                          }]
                      }],
                    annots: ['%payload']
                  }],
                annots: ['%send_payment']
              }]
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
              {
                prim: 'pair',
                args:
                  [{ prim: 'bool', annots: ['%paused'] },
                  { prim: 'nat', annots: ['%version'] }]
              }]
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

export const actualServicesFactoryFunctionLambda = [
  { prim: 'UNPAIR' },
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
        args:
          [{ prim: 'string' }, { string: 'No allowed tokens' }]
      },
      { prim: 'FAILWITH' }], []]
  }, { prim: 'SWAP' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'PAIR' }, { prim: 'SENDER' },
  { prim: 'DUP', args: [{ int: '3' }] }, { prim: 'CAR' },
  { prim: 'PAIR' },
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
                  [{
                    prim: 'or',
                    args:
                      [{
                        prim: 'bool',
                        annots: ['%set_deleted']
                      },
                      {
                        prim: 'address',
                        annots: ['%set_owner']
                      }]
                  },
                  {
                    prim: 'or',
                    args:
                      [{
                        prim: 'bool',
                        annots: ['%set_pause']
                      },
                      {
                        prim: 'pair',
                        args:
                          [{
                            prim: 'option',
                            args: [{ prim: 'bytes' }],
                            annots: ['%metadata']
                          },
                          {
                            prim: 'pair',
                            args:
                              [{
                                prim: 'option',
                                args:
                                  [{ prim: 'bool' }],
                                annots: ['%tez']
                              },
                              {
                                prim: 'option',
                                args:
                                  [{
                                    prim: 'set',
                                    args:
                                      [{ prim: 'address' }]
                                  }],
                                annots: ['%assets']
                              }],
                            annots: ['%allowed_tokens']
                          }],
                        annots:
                          ['%update_service_parameters']
                      }]
                  }],
                annots: ['%owner_action']
              },
              {
                prim: 'pair',
                args:
                  [{
                    prim: 'option',
                    args:
                      [{
                        prim: 'pair',
                        args:
                          [{
                            prim: 'address',
                            annots: ['%token_address']
                          },
                          {
                            prim: 'nat',
                            annots: ['%value']
                          }]
                      }],
                    annots: ['%asset_value']
                  },
                  {
                    prim: 'or',
                    args:
                      [{
                        prim: 'bytes',
                        annots: ['%public']
                      },
                      {
                        prim: 'or',
                        args:
                          [{
                            prim: 'bytes',
                            annots: ['%private']
                          },
                          {
                            prim: 'pair',
                            args:
                              [{ prim: 'bytes' },
                              { prim: 'bytes' }],
                            annots: ['%public_and_private']
                          }]
                      }],
                    annots: ['%payload']
                  }],
                annots: ['%send_payment']
              }]
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
              {
                prim: 'pair',
                args:
                  [{ prim: 'bool', annots: ['%paused'] },
                  { prim: 'nat', annots: ['%version'] }]
              }]
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
              { string: 'Should not be called' }]
          },
          { prim: 'FAILWITH' }]]
      }]]
  }, { prim: 'PAIR' }
] as const;

