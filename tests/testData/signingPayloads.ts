import { BigNumber } from 'bignumber.js';

import { createPaymentSignature, NegativeTestCases, serviceErrors, SignPaymentData } from '../helpers';

const baseSignData: Omit<SignPaymentData, 'targetAddress'> = {
  id: 'paymentId',
  amount: new BigNumber(12),
  asset: {
    address: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
    tokenId: 0
  }
};

const getTestData = async (targetAddress: string, secretKey: string, overrideData: Partial<SignPaymentData>): Promise<[SignPaymentData, string]> => {
  const signData: SignPaymentData = { ...baseSignData, targetAddress };
  return [signData, await createPaymentSignature({ ...signData, ...overrideData } as SignPaymentData, secretKey)];
};

const getTestDataFunc = (overrideData: Partial<SignPaymentData>) => {
  return (targetAddress: string, secretKey: string) => getTestData(targetAddress, secretKey, overrideData);
};

export const signingPayloadsTestCases: NegativeTestCases<(serviceContractAddress: string, secretKey: string) => Promise<[SignPaymentData, string]>> = [
  [
    'Incorrect id (fa 2.0)',
    getTestDataFunc({ id: 'anotherId' }),
    serviceErrors.invalidPaymentSignature
  ],
  [
    'Incorrect id (native token)',
    getTestDataFunc({ id: 'anotherId', asset: undefined }),
    serviceErrors.invalidPaymentSignature
  ],
  [
    'Incorrect amount (fa 2.0)',
    getTestDataFunc({ amount: new BigNumber(13) }),
    serviceErrors.invalidPaymentSignature
  ],
  [
    'Incorrect amount (native token)',
    getTestDataFunc({ amount: new BigNumber(13), asset: undefined }),
    serviceErrors.invalidPaymentSignature
  ],
  [
    'Incorrect target address (fa 2.0)',
    getTestDataFunc({ targetAddress: 'tz1LU5DrXEj1JExcZMiJKiWVBBnP7U1bHZWo' }),
    serviceErrors.invalidPaymentSignature
  ],
  [
    'Incorrect target address (native token)',
    getTestDataFunc({ targetAddress: 'tz1LU5DrXEj1JExcZMiJKiWVBBnP7U1bHZWo', asset: undefined }),
    serviceErrors.invalidPaymentSignature
  ],
  [
    'Incorrect asset address',
    getTestDataFunc({ ...baseSignData, asset: { ...baseSignData.asset, address: 'KT1JaayVx6TbKxmRyMpT2vMUdM6QkBcpjCa6' } as SignPaymentData['asset'] }),
    serviceErrors.invalidPaymentSignature
  ],
  [
    'Incorrect asset token id',
    getTestDataFunc({ ...baseSignData, asset: { ...baseSignData.asset, tokenId: 1 } as SignPaymentData['asset'] }),
    serviceErrors.invalidPaymentSignature
  ],
];
