import { readFile } from 'fs/promises';

import { InMemorySigner } from '@taquito/signer';
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { config } from 'dotenv';

config({ path: 'migrations/env/test-tokens.env' });

const secretKey = process.env.TOKENS_OWNER_SECRET_KEY;
const network = process.env.NETWORK_NAME || 'hangzhounet';
const rpcUrl = process.env.RPC_URL || `https://${network}.smartpy.io`;
const totalSupply = 1000000000000;

const contractCodeJsonFilePath = 'tests/testContracts/build/json/fa20.json';

if (!secretKey)
  throw new Error('Secret key not specified');

(async () => {
  const tezosToolkit = new TezosToolkit(rpcUrl);
  tezosToolkit.setSignerProvider(new InMemorySigner(secretKey));

  const ownerAddress = await tezosToolkit.wallet.pkh();
  const contractCode = JSON.parse(await readFile(contractCodeJsonFilePath, 'utf-8'));

  const tokenId = 0;
  const ledger = new MichelsonMap();
  ledger.set([ownerAddress, tokenId], totalSupply);
  const originationOperation = await tezosToolkit.contract.originate({
    code: contractCode,
    storage: {
      admin: {
        admin: ownerAddress,
        pending_admin: null,
        paused: false,
      },
      assets: {
        token_total_supply: MichelsonMap.fromLiteral({
          [tokenId]: totalSupply
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
    }
  });
  await originationOperation.confirmation();

  console.log('FA2.0 token is deployed, operation info is', originationOperation);
})().catch(error => console.error(error));
