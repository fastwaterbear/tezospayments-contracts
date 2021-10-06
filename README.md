# Tezos Payments Contracts

[Homepage](https://tezospayments.com) &nbsp;&nbsp;•&nbsp;&nbsp;
[Applications Repository](https://github.com/fastwaterbear/tezospayments) &nbsp;&nbsp;•&nbsp;&nbsp;
[Demo Service Contract [Granadanet]](https://payment.tezospayments.com/KT1EHWVV2tU4ecZKKmPTVVr99G66i4gD516M/donation?network=granadanet) &nbsp;&nbsp;•&nbsp;&nbsp; 
[Service Factory Contract [Granadanet]](https://better-call.dev/granadanet/KT1Ja5k4rv85fiJPJ5jR1vpmCzoSzsyuW5kP)  

> ⚠️ Tezos Payments is in active development so any component (application, contract, package, API) is subject to change ⚠️  

Prod  
**Coming Soon**  

Dev  
[![tezospayments-contracts](https://github.com/fastwaterbear/tezospayments-contracts/actions/workflows/tezospayments-contracts.yml/badge.svg?branch=master)](https://github.com/fastwaterbear/tezospayments-contracts/actions/workflows/tezospayments-contracts.yml)

Smart contracts are the core of the Tezos payments. There are three types of contracts: 
1. **Service contract**. This contract represents information of a user's real service, and has methods to update this information, and also has a method of the ability to accept payments.  
[src/service/main.religo](https://github.com/fastwaterbear/tezospayments-contracts/blob/master/src/service/main.religo)

2. **Services factory contract**. This contract stores a collection of the created service contracts for each user, and a contract of the current implementation that helps to produce new service contracts.  
[src/services-factory/main.religo](https://github.com/fastwaterbear/tezospayments-contracts/blob/master/src/services-factory/main.religo)

3. **Services factory implementation contract**. Using this contract, users can create service contracts for themselves.   
[src/services-factory-implementation/main.religo](https://github.com/fastwaterbear/tezospayments-contracts/blob/master/src/services-factory-implementation/main.religo)

Smart contracts are written in [LIGO](https://ligolang.org/) using the ReasonLIGO syntax.

## Repository Structure
This repository contains all smart contracts and their tests
```
tezospayments-contracts/
├── migrations
├── scripts
├── src/
│   ├── common
│   ├── main
│   ├── service
│   ├── services-factory
│   └── services-factory-implementation
├── tests
└── typings
```

* `migrations`. Smart contract migrations;

* `scripts`. Any tool scripts for building, testing, or any other development help;

* `src`. Source code of smart contracts;

    * `common`. Common types shared in smart contracts;

    * `lambdas`. Code that will be compiled as a lambda;

    * `main`. Contracts that will be compiled;

    * `<contract-name>`. Contract implementations;

* `tests`. Contract tests. This directory contains not only tests but also test data;

* `typings`. TypeScript type definitions of smart contracts and the related data.

## Build smart contracts
### Prerequisites
* Bash
* [Docker](https://docs.docker.com/get-docker) version 20.10.7 or later

### Building
We build smart contracts using the [ligo docker image](https://hub.docker.com/r/ligolang/ligo) in [the bash script](https://github.com/fastwaterbear/tezospayments-contracts/blob/master/scripts/build.sh).  
To build all smart contracts you just need to call this script with the following command:
```bash
bash ./scripts/build.sh
```

## Run tests locally

### Prerequisites
* [Node.js](https://nodejs.org) version 16.7.0 or later  
* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) version 7.20.3 or later  
* [Docker](https://docs.docker.com/get-docker) version 20.10.7 or later

### Run local Sandbox node
The sandbox node is required for local deployments of smart contracts and for launching tests locally. We use the [flextesa](https://hub.docker.com/r/tqtezos/flextesa) image and the custom script written in TypeScript to launch the sandbox node.

1. Go to the root directory of the repository;
2. Install npm packages using the command
   ```bash
   npm i
   ```
3. Start the sandbox node using the command
   ```bash
   npm run start-sandbox
   ```
4. When the node is ready, you'll see
   ```
   Flextesa: Pause  Sandbox is READY \o/
   Flextesa: Please enter command:
   ```

### Run tests
When the sandbox node is launched, we can launch smart contract tests.
We use the truffle package (tezos version) with small patches for testing smart contracts. Tests are written in TypeScript;

1. Don't close the Sandbox terminal session. Open another terminal session;
2. Go to the root directory of the repository;
3. Run tests using the command
   ```
   npm tests
   ```
