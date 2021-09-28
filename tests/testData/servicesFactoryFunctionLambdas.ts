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
  {
    prim: 'EMPTY_MAP',
    args:
      [{ prim: 'key' },
      {
        prim: 'pair',
        args:
          [{ prim: 'key' },
          { prim: 'option', args: [{ prim: 'string' }] }]
      }]
  },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'True' }] },
  { prim: 'PAIR' }, { prim: 'SENDER' },
  { prim: 'PUSH', args: [{ prim: 'bytes' }, { bytes: '00' }] },
  { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'EMPTY_SET', args: [{ prim: 'address' }] },
  { prim: 'SWAP' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '0' }] },
  { prim: 'PAIR' }, { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'PAIR' }, { prim: 'AMOUNT' },
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
                        prim: 'or',
                        args:
                          [{
                            prim: 'pair',
                            args:
                              [{
                                prim: 'bytes',
                                annots: ['%metadata']
                              },
                              {
                                prim: 'pair',
                                args:
                                  [{
                                    prim: 'pair',
                                    args:
                                      [{
                                        prim: 'bool',
                                        annots:
                                          ['%tez']
                                      },
                                      {
                                        prim: 'set',
                                        args:
                                          [{
                                            prim:
                                              'address'
                                          }],
                                        annots:
                                          ['%assets']
                                      }],
                                    annots:
                                      ['%allowed_tokens']
                                  },
                                  {
                                    prim: 'pair',
                                    args:
                                      [{
                                        prim: 'nat',
                                        annots:
                                          ['%allowed_operation_type']
                                      },
                                      {
                                        prim: 'map',
                                        args:
                                          [{
                                            prim:
                                              'key'
                                          },
                                          {
                                            prim:
                                              'pair',
                                            args:
                                              [{
                                                prim:
                                                  'key',
                                                annots:
                                                  ['%public_key']
                                              },
                                              {
                                                prim:
                                                  'option',
                                                args:
                                                  [{
                                                    prim:
                                                      'string'
                                                  }],
                                                annots:
                                                  ['%name']
                                              }]
                                          }],
                                        annots:
                                          ['%signing_keys']
                                      }]
                                  }]
                              }],
                            annots: ['%initialize']
                          },
                          {
                            prim: 'bool',
                            annots: ['%set_deleted']
                          }]
                      },
                      {
                        prim: 'or',
                        args:
                          [{
                            prim: 'address',
                            annots: ['%set_owner']
                          },
                          {
                            prim: 'bool',
                            annots: ['%set_pause']
                          }]
                      }]
                  },
                  {
                    prim: 'or',
                    args:
                      [{
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
                      },
                      {
                        prim: 'map',
                        args:
                          [{ prim: 'key' },
                          {
                            prim: 'option',
                            args:
                              [{
                                prim: 'pair',
                                args:
                                  [{
                                    prim: 'key',
                                    annots:
                                      ['%public_key']
                                  },
                                  {
                                    prim: 'option',
                                    args:
                                      [{ prim: 'string' }],
                                    annots: ['%name']
                                  }]
                              }]
                          }],
                        annots: ['%update_signing_keys']
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
                        prim: 'pair',
                        args:
                          [{
                            prim: 'nat',
                            annots:
                              ['%allowed_operation_type']
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
                                args:
                                  [{ prim: 'address' }],
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
                            prim: 'bool',
                            annots: ['%initialized']
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
                            prim: 'bytes',
                            annots: ['%metadata']
                          },
                          {
                            prim: 'address',
                            annots: ['%owner']
                          }]
                      },
                      {
                        prim: 'pair',
                        args:
                          [{
                            prim: 'bool',
                            annots: ['%paused']
                          },
                          {
                            prim: 'map',
                            args:
                              [{ prim: 'key' },
                              {
                                prim: 'pair',
                                args:
                                  [{
                                    prim: 'key',
                                    annots:
                                      ['%public_key']
                                  },
                                  {
                                    prim: 'option',
                                    args:
                                      [{ prim: 'string' }],
                                    annots: ['%name']
                                  }]
                              }],
                            annots: ['%signing_keys']
                          }]
                      }]
                  }]
              },
              { prim: 'nat', annots: ['%version'] }]
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
  {
    prim: 'EMPTY_MAP',
    args:
      [{ prim: 'key' },
      {
        prim: 'pair',
        args:
          [{ prim: 'key' },
          { prim: 'option', args: [{ prim: 'string' }] }]
      }]
  },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'True' }] },
  { prim: 'PAIR' }, { prim: 'SENDER' },
  { prim: 'PUSH', args: [{ prim: 'bytes' }, { bytes: '00' }] },
  { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'bool' }, { prim: 'False' }] },
  { prim: 'EMPTY_SET', args: [{ prim: 'address' }] },
  { prim: 'SWAP' }, { prim: 'PAIR' },
  { prim: 'PUSH', args: [{ prim: 'nat' }, { int: '0' }] },
  { prim: 'PAIR' }, { prim: 'PAIR' }, { prim: 'PAIR' },
  { prim: 'PAIR' }, { prim: 'AMOUNT' },
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
                        prim: 'or',
                        args:
                          [{
                            prim: 'pair',
                            args:
                              [{
                                prim: 'bytes',
                                annots: ['%metadata']
                              },
                              {
                                prim: 'pair',
                                args:
                                  [{
                                    prim: 'pair',
                                    args:
                                      [{
                                        prim: 'bool',
                                        annots:
                                          ['%tez']
                                      },
                                      {
                                        prim: 'set',
                                        args:
                                          [{
                                            prim:
                                              'address'
                                          }],
                                        annots:
                                          ['%assets']
                                      }],
                                    annots:
                                      ['%allowed_tokens']
                                  },
                                  {
                                    prim: 'pair',
                                    args:
                                      [{
                                        prim: 'nat',
                                        annots:
                                          ['%allowed_operation_type']
                                      },
                                      {
                                        prim: 'map',
                                        args:
                                          [{
                                            prim:
                                              'key'
                                          },
                                          {
                                            prim:
                                              'pair',
                                            args:
                                              [{
                                                prim:
                                                  'key',
                                                annots:
                                                  ['%public_key']
                                              },
                                              {
                                                prim:
                                                  'option',
                                                args:
                                                  [{
                                                    prim:
                                                      'string'
                                                  }],
                                                annots:
                                                  ['%name']
                                              }]
                                          }],
                                        annots:
                                          ['%signing_keys']
                                      }]
                                  }]
                              }],
                            annots: ['%initialize']
                          },
                          {
                            prim: 'bool',
                            annots: ['%set_deleted']
                          }]
                      },
                      {
                        prim: 'or',
                        args:
                          [{
                            prim: 'address',
                            annots: ['%set_owner']
                          },
                          {
                            prim: 'bool',
                            annots: ['%set_pause']
                          }]
                      }]
                  },
                  {
                    prim: 'or',
                    args:
                      [{
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
                      },
                      {
                        prim: 'map',
                        args:
                          [{ prim: 'key' },
                          {
                            prim: 'option',
                            args:
                              [{
                                prim: 'pair',
                                args:
                                  [{
                                    prim: 'key',
                                    annots:
                                      ['%public_key']
                                  },
                                  {
                                    prim: 'option',
                                    args:
                                      [{ prim: 'string' }],
                                    annots: ['%name']
                                  }]
                              }]
                          }],
                        annots: ['%update_signing_keys']
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
                        prim: 'pair',
                        args:
                          [{
                            prim: 'nat',
                            annots:
                              ['%allowed_operation_type']
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
                                args:
                                  [{ prim: 'address' }],
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
                            prim: 'bool',
                            annots: ['%initialized']
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
                            prim: 'bytes',
                            annots: ['%metadata']
                          },
                          {
                            prim: 'address',
                            annots: ['%owner']
                          }]
                      },
                      {
                        prim: 'pair',
                        args:
                          [{
                            prim: 'bool',
                            annots: ['%paused']
                          },
                          {
                            prim: 'map',
                            args:
                              [{ prim: 'key' },
                              {
                                prim: 'pair',
                                args:
                                  [{
                                    prim: 'key',
                                    annots:
                                      ['%public_key']
                                  },
                                  {
                                    prim: 'option',
                                    args:
                                      [{ prim: 'string' }],
                                    annots: ['%name']
                                  }]
                              }],
                            annots: ['%signing_keys']
                          }]
                      }]
                  }]
              },
              { prim: 'nat', annots: ['%version'] }]
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

