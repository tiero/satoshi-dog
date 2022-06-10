import { PrevoutStore } from "./prevout.store";
import { RaceStore } from "./race.store";

export interface StoreManagerInterface {
  race: RaceStore;
}

export default class StoreManager implements StoreManagerInterface {
  public race: RaceStore;
  public prevout: PrevoutStore;
  constructor() {
    this.race = new RaceStore();
    this.prevout = new PrevoutStore();
  }
}