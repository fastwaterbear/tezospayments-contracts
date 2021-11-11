import { MichelsonMap } from '@taquito/michelson-encoder';
import { BigMapAbstraction } from '@taquito/taquito';

import { accounts } from '../testData/accounts';

export const burnAddress = 'tz1burnburnburnburnburnburnburjAYjjX';
export const emptySignature = 'edsigtaNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNoneNog2Ndso';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const emptyBigMap = new MichelsonMap() as any as BigMapAbstraction;

export const capitalize = (value: string): string => value && (value[0]?.toLocaleUpperCase() + value.slice(1));
export const decapitalize = (value: string): string => value && (value[0]?.toLocaleLowerCase() + value.slice(1));

export const getAccountPublicKey = (accountAddress: string) => accounts.find(account => account.pkh === accountAddress)?.pk;
