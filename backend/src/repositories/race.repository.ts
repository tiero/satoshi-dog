
import { Race, createRace} from '../models/race';
import { Dog } from '../models/dog';
import { RaceStore } from '../storage/race.store';
import { Choice, createChoice } from '../models/choice';
import { TxOutput } from 'ldk';

export interface IChoicePayload {
  payout: string;
  dog: Dog;
  outpoint: {
    txid: string;
    vout: number;
  };
  parity: number;
}

export const newRace = async (store: RaceStore):Promise<Race> => {
  const race = createRace([
    { name: 'Mario', number: 1 },
    { name: 'Luigi', number: 2 },
    { name: 'Alice', number: 3 },
    { name: 'Bob', number: 4 },
  ])
  await store.addRace({
    ...race,
  });
  return race;
}

export const pickChoice = async (store: RaceStore, id: string, payload: IChoicePayload): Promise<Race> => {
  const race = await store.getRace(id);
  const availableDogIndex = race.available.findIndex((d: Dog) => d.name === payload.dog.name);
  const chosenDogIndex = race.chosen.findIndex((c: Choice) => c.dog.name === payload.dog.name);

  if (availableDogIndex === -1 || chosenDogIndex !== -1) throw new Error('dog already chosen');

  
  await store.updateRace(id, (r: Race) => {
    r.available.splice(availableDogIndex, 1);
    const choice = createChoice(payload.payout, payload.dog, payload.outpoint, payload.parity);
    r.chosen.push({...choice});
    return r;
  })

  return await store.getRace(id);
}

export const getRace = async (store: RaceStore, id: string) :Promise<Race> => {
  return await store.getRace(id);
}

export const deleteRace = async (store: RaceStore, id: string) :Promise<boolean> => {
  return await store.deleteRace(id);
}

export const getRaceIDs = async (store: RaceStore) : Promise<string[]> => {
  return await store.getRaceIDs();
}