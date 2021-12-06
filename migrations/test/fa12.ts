import { readFile } from 'fs/promises';

import { InMemorySigner } from '@taquito/signer';
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { config } from 'dotenv';

config({ path: 'migrations/env/test-tokens.env' });

const secretKey = process.env.TOKENS_OWNER_SECRET_KEY;
const network = process.env.NETWORK_NAME || 'hangzhounet';
const rpcUrl = process.env.RPC_URL || `https://${network}.smartpy.io`;
const totalSupply = 1000000000000;

const contractCodeJsonFilePath = 'tests/testContracts/build/json/fa12.json';

if (!secretKey)
  throw new Error('Secret key not specified');

(async () => {
  const tezosToolkit = new TezosToolkit(rpcUrl);
  tezosToolkit.setSignerProvider(new InMemorySigner(secretKey));

  const ownerAddress = await tezosToolkit.wallet.pkh();
  const contractCode = JSON.parse(await readFile(contractCodeJsonFilePath, 'utf-8'));

  const originationOperation = await tezosToolkit.contract.originate({
    code: contractCode,
    storage: {
      totalSupply,
      ledger: MichelsonMap.fromLiteral({
        [ownerAddress]: {
          balance: totalSupply,
          allowances: new MichelsonMap()
        }
      })
    }
  });
  await originationOperation.confirmation();

  console.log('FA1.2 token is deployed, operation info is', originationOperation);
})().catch(error => console.error(error));
