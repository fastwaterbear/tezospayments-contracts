import { Flextesa, accounts, bakers } from './sandbox';

((async () => {
  const sandbox = new Flextesa({
    accounts,
    bakerAccountNames: bakers.map(backer => backer.name)
  });

  await sandbox.start();
})())
  .catch(err => console.error(err));
