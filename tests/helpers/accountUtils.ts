import { accounts, } from '../testData';

export const getAccountPublicKey = (accountAddress: string) => accounts
  .find(account => account.pkh === accountAddress)?.pk;
