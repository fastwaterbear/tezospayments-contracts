import { ChildProcessWithoutNullStreams, spawn, exec as standardExec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(standardExec);

import type { TezosAccount } from './accounts';
import { protocols, TezosProtocol } from './tezosConfig';

export interface FlextesaOptions {
  readonly host: string;
  readonly port: number;
  readonly protocol: TezosProtocol;
  readonly genesisBlockHash: string;
  readonly accounts: readonly TezosAccount[];
  readonly bakerAccountNames: readonly string[];
  readonly dockerImage: string;
  readonly dockerContainerEntrypoint: string;
  readonly dockerContainerEntrypointCommand: string;
  readonly dockerContainerName: string;
}

type OptionalFlextesaOptions = Partial<Pick<FlextesaOptions,
  | 'host'
  | 'port'
  | 'protocol'
  | 'genesisBlockHash'
  | 'dockerImage'
  | 'dockerContainerEntrypoint'
  | 'dockerContainerEntrypointCommand'
  | 'dockerContainerName'
>>;
type DefaultFlextesaOptions = Pick<FlextesaOptions, keyof OptionalFlextesaOptions>;

export class Flextesa {
  static readonly flextesaStartedIndicator = 'Flextesa: Please enter command:';
  static readonly defaultOptions: DefaultFlextesaOptions = {
    host: '0.0.0.0',
    port: 8732,
    protocol: protocols.edo,
    genesisBlockHash: 'random',
    dockerImage: 'tqtezos/flextesa:20210514',
    dockerContainerEntrypoint: 'flextesa',
    dockerContainerEntrypointCommand: 'mini-net',
    dockerContainerName: 'tezospayments-flextesa'
  };

  readonly options: FlextesaOptions;

  private process: ChildProcessWithoutNullStreams | undefined;

  constructor(options: Omit<FlextesaOptions, keyof OptionalFlextesaOptions> & OptionalFlextesaOptions) {
    this.options = { ...Flextesa.defaultOptions, ...this.prepareOptions(options) };
  }

  start() {
    return new Promise<void>((resolve, reject) => {
      try {
        const onProcessError: (err: unknown) => void = err => reject(err);
        const onProcessClosed: (code: number | null, signal: NodeJS.Signals | null) => void = code => {
          if (code !== 0)
            reject('Internal error');
          else
            resolve();
        };
        const args = this.getDockerArgs();

        this.process = spawn('docker', args);
        this.process.on('error', onProcessError);
        this.process.on('close', onProcessClosed);

        this.process.stderr.on('data', data => {
          const dataStr: string = data.toString();
          console.log(dataStr);
        });
      }
      catch (err) {
        reject(err);
      }
    });
  }

  exit() {
    return exec(`docker rm -f ${this.options.dockerContainerName}`);
  }

  private prepareOptions(options: Omit<FlextesaOptions, keyof OptionalFlextesaOptions> & OptionalFlextesaOptions) {
    const preparedOptions = { ...options };

    (Object.getOwnPropertyNames(preparedOptions) as Array<keyof typeof preparedOptions>).forEach(propertyName => {
      if (!preparedOptions[propertyName])
        delete preparedOptions[propertyName];
    });

    return preparedOptions;
  }

  private getDockerArgs() {
    const { bakerAccountsArgs, implicitAccountsArgs } = this.getAccountArgs();

    return [
      'run',
      '-i',
      '--rm',
      '--name',
      this.options.dockerContainerName,
      '-p',
      `${this.options.host}:${this.options.port}:20000`,
      this.options.dockerImage,
      this.options.dockerContainerEntrypoint,
      this.options.dockerContainerEntrypointCommand,
      '--genesis-block-hash',
      this.options.genesisBlockHash,
      '--time-between-blocks',
      '1',
      '--timestamp-delay',
      '0',
      '--remove-default-bootstrap-accounts',
      ...bakerAccountsArgs,
      ...implicitAccountsArgs,
      '--protocol-kind', `${this.options.protocol.kind}`
    ];
  }

  private getAccountArgs() {
    const bakerAccountsArgs: string[] = [];
    const implicitAccountsArgs: string[] = [];

    this.options.accounts.forEach(account => {
      const isBakerAccount = this.options.bakerAccountNames.includes(account.name);
      const accountsArgs = isBakerAccount ? bakerAccountsArgs : implicitAccountsArgs;

      accountsArgs.push('--add-bootstrap-account', this.formatAccountToCmdArg(account));
      if (!isBakerAccount)
        accountsArgs.push('--no-daemons-for', account.name);
    });

    return {
      bakerAccountsArgs,
      implicitAccountsArgs
    };
  }

  private formatAccountToCmdArg(account: TezosAccount) {
    return [account.name, account.pk, account.pkh, account.sk].join(',') + '@' + account.balance;
  }
}
