import { v4 as uuidv4 } from 'uuid';
import { Dog } from "./dog";

export interface Choice {
  id: string;
  payout: string;
  dog: Dog;
  outpoint: {
    txid: string;
    vout: number;
  };
  createdAt: string;
}

export function createChoice(payout:string, dog:Dog, outpoint:{txid:string, vout:number}): Choice {
  return {
    id: uuidv4(),
    payout,
    dog,
    outpoint,
    createdAt: new Date().toUTCString(),
  }
}