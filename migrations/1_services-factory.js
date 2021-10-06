/* global artifacts */

const https = require('https');
const { URL } = require('url');

const { MichelsonMap } = require('@taquito/michelson-encoder');

const { useLastTezosToolkit } = require('../tests/helpers');

const [servicesFactoryContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('services-factory'));

module.exports = async (deployer, network, accounts) => {
  if (network === 'development')
    return;

  // We should request a public key hash to proceed
  await tezosToolkit.wallet.pkh();
  const previousServicesFactoryContractAddress = process.env.PREVIOUS_SERVICES_FACTORY_CONTRACT_ADDRESS;
  let services = new MichelsonMap();

  if (previousServicesFactoryContractAddress) {
    console.log('The address of the previous factory contract is defined', previousServicesFactoryContractAddress);
    console.log('Fetching existing services from this factory');

    services = await loadServices(network, previousServicesFactoryContractAddress);
  }

  await deployer.deploy(servicesFactoryContract, {
    services,
    administrator: accounts[0],
    paused: false,
    factory_implementation: 'tz1burnburnburnburnburnburnburjAYjjX',
    factory_implementation_version: 0
  });
};

/** 
 * @param {string} network
 * @param {string} servicesFactoryContractAddress
 * @returns {Promise<MichelsonMap>}
 */
async function loadServices(network, servicesFactoryContractAddress) {
  const timeout = 100;
  const limit = 100;
  let offset = 0;

  const servicesBigMapInfo = await fetchServicesBigMapInfo(network, servicesFactoryContractAddress);
  if (!servicesBigMapInfo)
    throw new Error('The services big map not found');

  console.log('The services big map found, id is', servicesBigMapInfo.ptr);
  /**
   * @type {Array<{ owner: string, services: string[] }>}
   */
  let serviceInfos = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const servicesChunk = await fetchServices(network, servicesBigMapInfo.ptr, limit, offset);
    if (!servicesChunk.length)
      break;

    serviceInfos = serviceInfos.concat(servicesChunk);
    offset += limit;

    await wait(timeout);
  }

  const result = new MichelsonMap();
  serviceInfos.forEach(serviceInfo => result.set(serviceInfo.owner, serviceInfo.services));

  return result;
}

/**
 * @param {string} network
 * @param {string} servicesFactoryContractAddress
 * @returns {Promise<{ ptr: number; path: string } | undefined>}
 */
async function fetchServicesBigMapInfo(network, servicesFactoryContractAddress) {
  const url = new URL('/v1/bigmaps', getBaseUrl(network));
  url.searchParams.append('contract', servicesFactoryContractAddress);

  /**
   * @type {Array<{ prt: number; path: string }>}
   */
  const responseData = await fetchJSON(url);
  return responseData.find(bigMapInfo => bigMapInfo.path === 'services');
}

/**
 * @param {string} network
 * @param {number} bigMapId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Array<{ owner: string, services: string[] }>>}
 */
async function fetchServices(network, bigMapId, limit, offset) {
  const url = new URL(`/v1/bigmaps/${bigMapId}/keys`, getBaseUrl(network));
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());

  /**
   * @type {any[]}
   */
  const responseData = await fetchJSON(url);
  return responseData.map(item => ({
    owner: item.key,
    services: item.value
  }));
}

/**
 * @type {https.RequestOptions}
 */
const requestJSONOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

/**
 * @param {URL} url 
 * @param {https.RequestOptions} requestOptions 
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, requestJSONOptions, response => {
      if (response.statusCode !== 200)
        reject(new Error(`Status code is ${response.statusCode}`));

      response.setEncoding('utf8');

      let rawResponseData = '';
      response.on('data', data => rawResponseData += data);
      response.on('end', () => {
        try {
          console.log(`Data of the "${url.href}" request received`);
          const responseData = JSON.parse(rawResponseData);
          resolve(responseData);
        }
        catch (error) {
          reject(new Error(`Response data has wrong format: ${error.message}`));
        }
      });
    });

    request.on('error', error => reject(error));
    request.end();
  });
}

function getBaseUrl(network) {
  return `https://api.${network}.tzkt.io`;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
