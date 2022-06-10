import os from 'os';
import fs from 'fs';
import path from 'path';
import Keyv from 'keyv';
import KeyvFile from 'keyv-file';
import { TxOutput } from 'ldk';

export class PrevoutStore implements PrevoutStore {
  state: Keyv<unknown, { store: KeyvFile<any> }>;
  path: string;

  constructor() {
    const datadirName = '.satoshi-dog';
    const dbName = 'prevouts.json';

    const homedir = os.homedir();
    const datadir = path.join(homedir, datadirName);
    // `homedir()` returns absolute path so we use `join` here
    if (!fs.existsSync(datadir)) {
      fs.mkdirSync(path.join(datadir, 'db'), { recursive: true });
    }
    this.path = path.join(homedir, datadirName, 'db', dbName);
    this.state = new Keyv({
      store: new KeyvFile({
        filename: this.path,
      }),
    });
  }


  async getPrevout(id: string): Promise<TxOutput> {
    return this.state.get(id) as unknown as TxOutput;
  }


  async deletePrevout(id: string): Promise<boolean> {
    return this.state.delete(id);
  }

  async addPrevout(id: string, prevout: TxOutput): Promise<true> {
    return this.state.set(id, prevout);
  }
}
