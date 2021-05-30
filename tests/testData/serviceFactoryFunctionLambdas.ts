export const notImplementedLambda = [
  { prim: 'DROP' },
  {
    prim: 'PUSH',
    args:
      [{ prim: 'string' }, { string: 'Not implemented' }]
  },
  { prim: 'FAILWITH' }
] as const;
