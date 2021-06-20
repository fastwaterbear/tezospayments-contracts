/* global artifacts */

const { readFile } = require('fs').promises;
const path = require('path');

const { MichelsonMap } = require('@taquito/michelson-encoder');

const { useLastTezosToolkit } = require('../tests/helpers');

const [servicesFactoryContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('services-factory'));

module.exports = async (deployer, network, accounts) => {
  if (network === 'development')
    return;

  // We should request a public key hash to proceed
  await tezosToolkit.wallet.pkh();

  const serviceFactoryFunctionLambdaRaw = await readFile(
    path.join(__dirname, '../build/json/service-factory-function_lambda.json'),
    'utf-8'
  );
  const serviceFactoryFunctionLambda = JSON.parse(serviceFactoryFunctionLambdaRaw);

  await deployer.deploy(servicesFactoryContract, {
    services: new MichelsonMap(),
    administrator: accounts[0],
    paused: false,
    service_factory_function: serviceFactoryFunctionLambda,
    service_factory_function_version: 1
  });
};
