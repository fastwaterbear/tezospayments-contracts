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
  { prim: 'UNPAIR' },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '0' }] },
  { prim: 'SWAP' }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] },
  { prim: 'GET', args: [{ int: '3' }] }, { prim: 'CDR' },
  { prim: 'SIZE' }, { prim: 'COMPARE' }, { prim: 'EQ' },
  { prim: 'SWAP' }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] },
  { prim: 'GET', args: [{ int: '3' }] }, { prim: 'CAR' },
  { prim: 'NOT' }, { prim: 'AND' },
  {
    prim: 'IF',
    args:
      [[{
        prim: 'PUSH',
        args:
          [{ prim: 'string' }, { string: 'No allowed tokens' }]
      },
      { prim: 'FAILWITH' }], []]
  }, { prim: 'DUP' },
  { prim: 'GET', args: [{ int: '5' }] },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '3' }] },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '3' }] },
  { prim: 'DUP', args: [{ int: '3' }] }, { prim: 'OR' },
  { prim: 'COMPARE' }, { prim: 'NEQ' },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '0' }] },
  { prim: 'DIG', args: [{ int: '2' }] }, { prim: 'COMPARE' },
  { prim: 'EQ' }, { prim: 'OR' },
  {
    prim: 'IF',
    args:
      [[{
        prim: 'PUSH',
        args:
          [{ prim: 'string' },
          { string: 'Invalid operation type' }]
      },
      { prim: 'FAILWITH' }], []]
  }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] },
  { prim: 'GET', args: [{ int: '6' }] }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'SENDER' }, { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'SWAP' }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] }, { prim: 'CAR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'PAIR' }, { prim: 'DUP', args: [{ int: '3' }] },
  { prim: 'GET', args: [{ int: '3' }] },
  { prim: 'DIG', args: [{ int: '3' }] },
  { prim: 'GET', args: [{ int: '5' }] }, { prim: 'PAIR' },
  { prim: 'PAIR' }, { prim: 'PAIR' }, { prim: 'AMOUNT' },
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
                                          [{
                                            prim:
                                              'address'
                                          }]
                                      }],
                                    annots: ['%assets']
                                  }],
                                annots:
                                  ['%allowed_tokens']
                              },
                              {
                                prim: 'option',
                                args: [{ prim: 'nat' }],
                                annots:
                                  ['%allowed_operation_type']
                              }]
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
                    prim: 'pair',
                    args:
                      [{
                        prim: 'nat',
                        annots: ['%operation_type']
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
                                annots:
                                  ['%public_and_private']
                              }]
                          }],
                        annots: ['%payload']
                      }]
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
                        prim: 'nat',
                        annots: ['%allowed_operation_type']
                      },
                      {
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
                      }]
                  },
                  {
                    prim: 'pair',
                    args:
                      [{
                        prim: 'bool',
                        annots: ['%deleted']
                      },
                      {
                        prim: 'bytes',
                        annots: ['%metadata']
                      }]
                  }]
              },
              {
                prim: 'pair',
                args:
                  [{
                    prim: 'pair',
                    args:
                      [{
                        prim: 'address',
                        annots: ['%owner']
                      },
                      { prim: 'bool', annots: ['%paused'] }]
                  },
                  {
                    prim: 'pair',
                    args:
                      [{
                        prim: 'set',
                        args:
                          [{
                            prim: 'pair',
                            args:
                              [{
                                prim: 'option',
                                args:
                                  [{ prim: 'string' }]
                              },
                              { prim: 'key' }]
                          }],
                        annots: ['%signing_keys']
                      },
                      { prim: 'nat', annots: ['%version'] }]
                  }]
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
  { prim: 'DUG', args: [{ int: '2' }] },
  { prim: 'GET', args: [{ int: '3' }] }, { prim: 'CDR' },
  { prim: 'SIZE' }, { prim: 'COMPARE' }, { prim: 'EQ' },
  { prim: 'SWAP' }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] },
  { prim: 'GET', args: [{ int: '3' }] }, { prim: 'CAR' },
  { prim: 'NOT' }, { prim: 'AND' },
  {
    prim: 'IF',
    args:
      [[{
        prim: 'PUSH',
        args:
          [{ prim: 'string' }, { string: 'No allowed tokens' }]
      },
      { prim: 'FAILWITH' }], []]
  }, { prim: 'DUP' },
  { prim: 'GET', args: [{ int: '5' }] },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '3' }] },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '3' }] },
  { prim: 'DUP', args: [{ int: '3' }] }, { prim: 'OR' },
  { prim: 'COMPARE' }, { prim: 'NEQ' },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '0' }] },
  { prim: 'DIG', args: [{ int: '2' }] }, { prim: 'COMPARE' },
  { prim: 'EQ' }, { prim: 'OR' },
  {
    prim: 'IF',
    args:
      [[{
        prim: 'PUSH',
        args:
          [{ prim: 'string' },
          { string: 'Invalid operation type' }]
      },
      { prim: 'FAILWITH' }], []]
  }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] },
  { prim: 'GET', args: [{ int: '6' }] }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'SENDER' }, { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'SWAP' }, { prim: 'DUP' },
  { prim: 'DUG', args: [{ int: '2' }] }, { prim: 'CAR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'PAIR' }, { prim: 'DUP', args: [{ int: '3' }] },
  { prim: 'GET', args: [{ int: '3' }] },
  { prim: 'DIG', args: [{ int: '3' }] },
  { prim: 'GET', args: [{ int: '5' }] }, { prim: 'PAIR' },
  { prim: 'PAIR' }, { prim: 'PAIR' }, { prim: 'AMOUNT' },
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
                                          [{
                                            prim:
                                              'address'
                                          }]
                                      }],
                                    annots: ['%assets']
                                  }],
                                annots:
                                  ['%allowed_tokens']
                              },
                              {
                                prim: 'option',
                                args: [{ prim: 'nat' }],
                                annots:
                                  ['%allowed_operation_type']
                              }]
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
                    prim: 'pair',
                    args:
                      [{
                        prim: 'nat',
                        annots: ['%operation_type']
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
                                annots:
                                  ['%public_and_private']
                              }]
                          }],
                        annots: ['%payload']
                      }]
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
                        prim: 'nat',
                        annots: ['%allowed_operation_type']
                      },
                      {
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
                      }]
                  },
                  {
                    prim: 'pair',
                    args:
                      [{
                        prim: 'bool',
                        annots: ['%deleted']
                      },
                      {
                        prim: 'bytes',
                        annots: ['%metadata']
                      }]
                  }]
              },
              {
                prim: 'pair',
                args:
                  [{
                    prim: 'pair',
                    args:
                      [{
                        prim: 'address',
                        annots: ['%owner']
                      },
                      { prim: 'bool', annots: ['%paused'] }]
                  },
                  {
                    prim: 'pair',
                    args:
                      [{
                        prim: 'set',
                        args:
                          [{
                            prim: 'pair',
                            args:
                              [{
                                prim: 'option',
                                args:
                                  [{ prim: 'string' }]
                              },
                              { prim: 'key' }]
                          }],
                        annots: ['%signing_keys']
                      },
                      { prim: 'nat', annots: ['%version'] }]
                  }]
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
  },
  { prim: 'PAIR' }
] as const;

