import { TxOutput } from "ldk";
import { PrevoutStore } from "../storage/prevout.store";

export const addPrevout  = async (store: PrevoutStore, id: string, prevout: TxOutput):Promise<true> => {
  return await store.addPrevout(id, prevout);
}

export const getPrevout = async (store: PrevoutStore, id: string) :Promise<TxOutput> => {
  return await store.getPrevout(id);
}

export const deletePrevout = async (store: PrevoutStore, id: string):Promise<boolean> => {
  return await store.deletePrevout(id);
}