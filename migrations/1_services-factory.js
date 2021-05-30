/* global artifacts */

const { MichelsonMap } = require('@taquito/michelson-encoder');

const { useLastTezosToolkit } = require('../tests/helpers/useLastTezosToolkit');
const { notImplementedLambda } = require('../tests/testData/serviceFactoryFunctionLambdas');

const [servicesFactoryContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('services-factory'));

module.exports = async (deployer, network, _accounts) => {
  const deploymentResult = await deployer.deploy(servicesFactoryContract, {
    services: new MichelsonMap(),
    administrator: await tezosToolkit.wallet.pkh(),
    paused: false,
    service_factory_function: notImplementedLambda,
  });

  console.log(`TransactionHash = ${deploymentResult.transactionHash} ; `
    + `ContractAddress = ${deploymentResult.address} ; `
    + `Network = ${network}`);
};
