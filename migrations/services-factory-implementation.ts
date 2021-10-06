import { readFile } from 'fs/promises';

import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { config } from 'dotenv';

config({ path: 'migrations/env/services-factory-implementation.env' });

const secretKey = process.env.SERVICES_FACTORY_ADMINISTRATOR_SECRET_KEY;
const network = process.env.NETWORK_NAME || 'granadanet';
const rpcUrl = process.env.RPC_URL || `https://${network}.smartpy.io`;
const servicesFactoryContractAddress = process.env.SERVICES_FACTORY_CONTRACT_ADDRESS;
const serviceFactoryImplementationContractCodeJsonFilePath = 'build/json/services-factory-implementation.json';

if (!secretKey)
  throw new Error('Secret key not specified');
if (!servicesFactoryContractAddress)
  throw new Error('Services factory contract address not specified');

(async () => {
  const tezosToolkit = new TezosToolkit(rpcUrl);
  tezosToolkit.setSignerProvider(new InMemorySigner(secretKey));

  const serviceFactoryImplementationContractCode = JSON.parse(await readFile(serviceFactoryImplementationContractCodeJsonFilePath, 'utf-8'));

  const originationOperation = await tezosToolkit.contract.originate({
    code: serviceFactoryImplementationContractCode,
    storage: {
      factory: servicesFactoryContractAddress,
      version: 0,
      disabled: true
    }
  });
  await originationOperation.confirmation();

  console.log('Services factory implementation is deployed, operation info is', originationOperation);

  const servicesFactoryContract = await tezosToolkit.contract.at(servicesFactoryContractAddress);
  const updatedOperation = await servicesFactoryContract.methods.set_factory_implementation?.(originationOperation.contractAddress).send();
  if (!updatedOperation)
    throw new Error('The services factory contract is invalid');

  await updatedOperation.confirmation();

  console.log(`Services factory implementation is updated in the factory ${servicesFactoryContractAddress}`, updatedOperation);
})().catch(error => console.error(error));
