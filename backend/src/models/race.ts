import { v4 as uuidv4 } from 'uuid';
import { Choice } from './choice';
import { Dog } from "./dog";

export enum RaceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export interface Race {
  id: string;
  status: RaceStatus;
  available: Dog[];
  chosen: Choice[];
  createdAt: string;
}

export interface RaceRepository {
  addRace(race: Race): Promise<true>;
  getRace(id: string): Promise<Race>;
  getRaceIDs(id: string): Promise<string[]>;
  deleteRace(id: string): Promise<boolean>;
  updateRace(id: string, updateFn: (race: Race) => Race): Promise<true>
}

export function createRace(available: Dog[]): Race {
  return {
    id: uuidv4(),
    status: RaceStatus.PENDING,
    available,
    chosen: [],
    createdAt: new Date().toUTCString(),
  }
}