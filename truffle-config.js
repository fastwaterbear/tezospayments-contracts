/* eslint-disable @typescript-eslint/no-var-requires */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

require('ts-node').register({
  files: true,
});

const { simpleAccounts } = require('./tests/testData/accounts');

// https://www.trufflesuite.com/docs/truffle/reference/configuration
module.exports = {
  contracts_directory: './src/main',
  test_directory: './tests',
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8732,
      network_id: '*',
      secretKey: simpleAccounts[0].formattedSk,
      type: 'tezos',
    },
    edo2net: {
      host: 'https://edonet.smartpy.io',
      port: 443,
      network_id: '*',
      secretKey: process.env.CONTRACT_OWNER_SECRET_KEY,
      type: 'tezos',
    }
  }
};
