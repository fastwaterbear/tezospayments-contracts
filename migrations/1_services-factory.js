/* global artifacts */

const { MichelsonMap } = require('@taquito/michelson-encoder');

const { useLastTezosToolkit } = require('../tests/helpers');
const { admins, notImplementedLambda } = require('../tests/testData');

const [servicesFactoryContract, tezosToolkit] = useLastTezosToolkit(artifacts.require('services-factory'));

module.exports = async (deployer, network, _accounts) => {
  // We should request a public key hash to proceed
  await tezosToolkit.wallet.pkh();

  const deploymentResult = await deployer.deploy(servicesFactoryContract, {
    services: new MichelsonMap(),
    administrator: admins[0].pkh,
    paused: false,
    service_factory_function: notImplementedLambda,
  });

  console.log(`TransactionHash = ${deploymentResult.transactionHash} ; `
    + `ContractAddress = ${deploymentResult.address} ; `
    + `Network = ${network}`);
};
