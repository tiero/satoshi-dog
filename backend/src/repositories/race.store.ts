import os from 'os';
import fs from 'fs';
import path from 'path';
import Keyv from 'keyv';
import KeyvFile from 'keyv-file';
import { Race, RaceRepository } from '../models/race';

export class RaceStore implements RaceRepository {
  state: Keyv<unknown, { store: KeyvFile<any> }>;
  path: string;

  constructor() {
    const datadirName = '.satoshi-dog';
    const dbName = 'races.json';
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

  async updateRace(
    id: string,
    updateFn: (race: Race) => Race
  ): Promise<true> {
    const ctr = await this.getRace(id);
    const update = await updateFn(ctr);
    return this.state.set(id, update);
  }

  async getRace(id: string): Promise<Race> {
    return this.state.get(id) as unknown as Race;
  }
  async addRace(race: Race): Promise<true> {
    return this.state.set(race.id, race);
  }
}
