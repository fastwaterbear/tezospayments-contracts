import { Flextesa, accounts, bakers } from './sandbox';

((async () => {
  const sandbox = new Flextesa({
    accounts,
    dockerImage: process.argv[2],
    bakerAccountNames: bakers.map(backer => backer.name)
  });

  await sandbox.start();
})())
  .catch(err => console.error(err));
