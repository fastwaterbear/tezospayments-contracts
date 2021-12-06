import { readFile } from 'fs/promises';
import https from 'https';
import { URL } from 'url';

import { MichelsonMap } from '@taquito/michelson-encoder';
import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { config } from 'dotenv';

config({ path: 'migrations/env/services-factory.env' });

const secretKey = process.env.SERVICES_FACTORY_ADMINISTRATOR_SECRET_KEY;
const network = process.env.NETWORK_NAME || 'hangzhounet';
const rpcUrl = process.env.RPC_URL || `https://${network}.smartpy.io`;
const indexerUrl = process.env.INDEXER_URL || `https://api.${network}.tzkt.io`;
const previousServicesFactoryContractAddress = process.env.PREVIOUS_SERVICES_FACTORY_CONTRACT_ADDRESS;
const serviceFactoryContractCodeJsonFilePath = 'build/json/services-factory.json';

if (!secretKey)
  throw new Error('Secret key not specified');

(async () => {
  const tezosToolkit = new TezosToolkit(rpcUrl);
  tezosToolkit.setSignerProvider(new InMemorySigner(secretKey));

  const administrator = await tezosToolkit.wallet.pkh();
  const serviceFactoryContractCode = JSON.parse(await readFile(serviceFactoryContractCodeJsonFilePath, 'utf-8'));
  let services = new MichelsonMap();

  if (previousServicesFactoryContractAddress) {
    console.log('The address of the previous factory contract is defined', previousServicesFactoryContractAddress);
    console.log('Fetching existing services from this factory');

    services = await loadServices(previousServicesFactoryContractAddress);
  }

  const operation = await tezosToolkit.contract.originate({
    code: serviceFactoryContractCode,
    storage: {
      services,
      administrator,
      paused: false,
      factory_implementation: 'tz1burnburnburnburnburnburnburjAYjjX',
      factory_implementation_version: 0
    }
  });
  await operation.confirmation();

  console.log('Services factory is deployed, operation info is', operation);
})().catch(error => console.error(error));

async function loadServices(servicesFactoryContractAddress: string): Promise<MichelsonMap<string, string[]>> {
  const timeout = 100;
  const limit = 100;
  let offset = 0;

  const servicesBigMapInfo = await fetchServicesBigMapInfo(servicesFactoryContractAddress);
  if (!servicesBigMapInfo)
    throw new Error('The services big map not found');

  console.log('The services big map found, id is', servicesBigMapInfo.ptr);

  let serviceInfos: Array<{ owner: string; services: string[]; }> = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const serviceInfosChunk = await fetchServiceInfos(servicesBigMapInfo.ptr, limit, offset);
    if (!serviceInfosChunk.length)
      break;

    serviceInfos = serviceInfos.concat(serviceInfosChunk);
    offset += limit;

    await wait(timeout);
  }

  const result = new MichelsonMap<string, string[]>();
  serviceInfos.forEach(serviceInfo => result.set(serviceInfo.owner, serviceInfo.services));

  return result;
}

async function fetchServicesBigMapInfo(servicesFactoryContractAddress: string): Promise<BigMapInfo | undefined> {
  const url = new URL('/v1/bigmaps', indexerUrl);
  url.searchParams.append('contract', servicesFactoryContractAddress);

  const responseData = await fetchJSON<BigMapInfo[]>(url);
  return responseData.find(bigMapInfo => bigMapInfo.path === 'services');
}

async function fetchServiceInfos(bigMapId: number, limit: number, offset: number): Promise<ServiceInfo[]> {
  const url = new URL(`/v1/bigmaps/${bigMapId}/keys`, indexerUrl);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());

  const responseData = await fetchJSON<any[]>(url);
  return responseData.map(item => ({
    owner: item.key,
    services: item.value
  }));
}

const requestJSONOptions: https.RequestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

function fetchJSON<TData>(url: URL) {
  return new Promise<TData>((resolve, reject) => {
    const request = https.request(url, requestJSONOptions, response => {
      if (response.statusCode !== 200)
        reject(new Error(`Status code is ${response.statusCode}`));

      response.setEncoding('utf8');

      let rawResponseData = '';
      response.on('data', data => rawResponseData += data);
      response.on('end', () => {
        try {
          console.log(`Data of the "${url.href}" request received`);
          const responseData: TData = JSON.parse(rawResponseData);
          resolve(responseData);
        }
        catch (error) {
          reject(new Error(`Response data has wrong format: ${error instanceof Error ? error.message : error}`));
        }
      });
    });

    request.on('error', error => reject(error));
    request.end();
  });
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface ServiceInfo {
  owner: string;
  services: string[];
}

interface BigMapInfo {
  ptr: number;
  path: string;
}
