import { InMemorySigner } from '@taquito/signer';
import { ContractAbstraction, ContractProvider, MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';

import * as fa12Implementation from '../testContracts/build/json/fa12.json';
import * as fa20Implementation from '../testContracts/build/json/fa20.json';
import { serviceMetadataToBytes } from './converters';
import { createSigningKeyMichelsonMap } from './signing';
import { burnAddress } from './utils';

export const deployServicesImplementationFactory = async (
  contract: Truffle.Contract<TezosPayments.ServicesFactoryImplementationContract.Instance>,
  initialStorageState: Pick<
    Truffle.InitialStorageState<TezosPayments.ServicesFactoryImplementationContract.Storage>, 'factory'>
    & Partial<Truffle.InitialStorageState<TezosPayments.ServicesFactoryImplementationContract.Storage>>
): Promise<readonly [TezosPayments.ServicesFactoryImplementationContract.Instance, TezosPayments.ServicesFactoryImplementationContract.Storage]> => {
  const instance = await contract.new({
    disabled: true,
    version: new BigNumber(0),
    ...initialStorageState
  });
  const storage = await instance.storage();

  return [instance, storage];
};

export const deployServicesFactory = async (
  contract: Truffle.Contract<TezosPayments.ServicesFactoryContract.Instance>,
  initialStorageState: Pick<
    Truffle.InitialStorageState<TezosPayments.ServicesFactoryContract.Storage>, 'administrator'>
    & Partial<Truffle.InitialStorageState<TezosPayments.ServicesFactoryContract.Storage>>
): Promise<readonly [TezosPayments.ServicesFactoryContract.Instance, TezosPayments.ServicesFactoryContract.Storage]> => {
  const instance = await contract.new({
    services: new MichelsonMap(),
    paused: false,
    factory_implementation: burnAddress,
    factory_implementation_version: new BigNumber(0),
    ...initialStorageState
  });
  const storage = await instance.storage();

  return [instance, storage];
};

export const deployService = async (
  contract: Truffle.Contract<TezosPayments.ServiceContract.Instance>,
  initialStorageState: Pick<
    Truffle.InitialStorageState<TezosPayments.ServiceContract.Storage>, 'owner'>
    & Partial<Truffle.InitialStorageState<TezosPayments.ServiceContract.Storage>>
): Promise<readonly [TezosPayments.ServiceContract.Instance, TezosPayments.ServiceContract.Storage]> => {
  const serviceMetadata: TezosPayments.ServiceMetadata = {
    name: 'Test Service',
    links: ['https://test.com']
  };

  const instance = await contract.new({
    version: new BigNumber(0),
    metadata: serviceMetadataToBytes(serviceMetadata),
    allowed_tokens: {
      tez: true,
      assets: []
    },
    allowed_operation_type: new BigNumber(TezosPayments.OperationType.Payment),
    signing_keys: createSigningKeyMichelsonMap([]),
    completed_payments: new MichelsonMap(),
    paused: false,
    deleted: false,
    ...initialStorageState
  });
  const storage = await instance.storage();

  return [instance, storage];
};

export const setServicesFactoryImplementation = async (
  factoryContractAddress: string,
  factoryImplementationContractAddress: string,
  tezosToolkit: TezosToolkit,
  factoryAdminSecretKey: string
): Promise<number> => {
  const factoryContractInstance = await tezosToolkit.contract.at(factoryContractAddress);
  if (!factoryContractInstance.methods.set_factory_implementation)
    throw new Error('Invalid factory contract');

  const currentSignerProvider = tezosToolkit.signer;
  tezosToolkit.setSignerProvider(new InMemorySigner(factoryAdminSecretKey));
  const operation = await factoryContractInstance.methods
    .set_factory_implementation(factoryImplementationContractAddress)
    .send();
  tezosToolkit.setSignerProvider(currentSignerProvider);

  return operation.confirmation();
};

export const deployLambda = async (
  tezosToolkit: TezosToolkit,
): Promise<ContractAbstraction<ContractProvider>> => {
  const originationOperation = await tezosToolkit.contract.originate({
    code: 'parameter (lambda unit (pair (list operation) unit)); storage unit; code { CAR ; UNIT ; EXEC }',
    storage: null
  });

  await originationOperation.confirmation();
  const contract = await originationOperation.contract();

  return contract;
};

export const deployFa12 = async (
  tezosToolkit: TezosToolkit,
  ownerAddress: string,
  tokenAmount: BigNumber,
): Promise<ContractAbstraction<ContractProvider>> => {
  const originationOperation = await tezosToolkit.contract.originate({
    code: fa12Implementation,
    storage: {
      totalSupply: tokenAmount,
      ledger: MichelsonMap.fromLiteral({
        [ownerAddress]: {
          balance: tokenAmount,
          allowances: new MichelsonMap()
        }
      }) as TezosPayments.Testing.Fa12Contract.Ledger
    }
  });

  await originationOperation.confirmation();
  const contract = await originationOperation.contract();

  return contract;
};

export const deployFa20 = async (
  tezosToolkit: TezosToolkit,
  ownerAddress: string,
  tokenId: number,
  tokenAmount: BigNumber,
): Promise<ContractAbstraction<ContractProvider>> => {
  const ledger = new MichelsonMap();
  ledger.set([ownerAddress, tokenId], tokenAmount);

  const originationOperation = await tezosToolkit.contract.originate({
    code: fa20Implementation,
    storage: {
      admin: {
        admin: ownerAddress,
        pending_admin: null,
        paused: false,
      },
      assets: {
        token_total_supply: MichelsonMap.fromLiteral({
          [tokenId]: tokenAmount
        }),
        ledger,
        operators: MichelsonMap.fromLiteral({}),
        token_metadata: MichelsonMap.fromLiteral({
          [tokenId]: {
            token_id: tokenId,
            token_info: MichelsonMap.fromLiteral({}),
          }
        }),
      },
      metadata: new MichelsonMap(),
    } as TezosPayments.Testing.Fa20Contract.Storage
  });

  await originationOperation.confirmation();
  const contract = await originationOperation.contract();

  return contract;
};
