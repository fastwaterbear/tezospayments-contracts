/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as accountsJson from './rawAccounts.json';

export interface TezosAccount {
  name: string;
  pk: string;
  pkh: string;
  sk: string;
  balance: number;
  formattedSk: string;
}

export const accounts = accountsJson.map<TezosAccount>(account => ({
  ...account,
  formattedSk: account.sk.replace('unencrypted:', '')
}));
export const bakers = [accounts[0]] as readonly [TezosAccount];
export const simpleAccounts = accounts.slice(1, 4) as unknown as readonly [TezosAccount, TezosAccount, TezosAccount, TezosAccount];
export const admins = [simpleAccounts[1]] as const;
