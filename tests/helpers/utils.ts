import { accounts } from '../testData/accounts';

export const capitalize = (value: string): string => value && (value[0]?.toLocaleUpperCase() + value.slice(1));
export const decapitalize = (value: string): string => value && (value[0]?.toLocaleLowerCase() + value.slice(1));

export const getAccountPublicKey = (accountAddress: string) => accounts.find(account => account.pkh === accountAddress)?.pk;
