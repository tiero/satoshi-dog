import StoreManager from "../storage";
import { Get, Route, Tags, Delete as PostMethod, Body, Path, Delete } from "tsoa";
import { Race } from '../models/race';
import { newRace, pickChoice, getRace, deleteRace, getRaceIDs, IChoicePayload } from "../repositories/race.repository";
import { getPrevout } from "../repositories/prevout.repository";

import { fetchTxHex, Transaction, confidential, AssetHash, TxOutput } from "ldk";
import config from "../config/app";

import { buildTx } from "../utils/buildTx";


@Route("races")
@Tags("Race")
export default class RaceController {

  constructor(private store: StoreManager) { }

  @PostMethod("/")
  public async newRace(): Promise<Race> {
    return await newRace(this.store.race);
  }

  @Get("/")
  public async getRaceIDs(): Promise<string[]> {
    return getRaceIDs(this.store.race);
  }

  @Delete("/:id")
  public async deleteRace(@Path() id: string): Promise<boolean> {
    return deleteRace(this.store.race, id);
  }

  @PostMethod("/:id")
  public async updateRace(@Path() id: string, @Body() body: IChoicePayload): Promise<Race> {

    try {
      // check outpoint exists
      const { outpoint } = body;
      const txHex = await fetchTxHex(outpoint.txid, config.apiUrl);
      const tx = Transaction.fromHex(txHex);
      const prevout: TxOutput = tx.outs[outpoint.vout];

      await this.store.prevout.addPrevout(`${outpoint.txid}:${outpoint.vout}`, prevout);

      if (confidential.confidentialValueToSatoshi(prevout.value) !== config.sats) {
        throw new Error('bet amount must be' + config.sats);
      }

      if (AssetHash.fromBytes(prevout.asset).hex !== config.asset) {
        throw new Error('bet asset must be' + config.asset);
      }

      return pickChoice(this.store.race, id, body);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  @PostMethod("/:id/run")
  public async runRace(@Path() id: string): Promise<boolean> {
   
    const race = await getRace(this.store.race, id);
    const prevoutMap: Map<string, TxOutput> = new Map();
    for (const choice of race.chosen) {
      const {txid, vout} = choice.outpoint;
      const idOutpoint = `${txid}:${vout}`
      const prevout = await getPrevout(this.store.prevout, idOutpoint);
      prevoutMap.set(idOutpoint, prevout);
    }

    let txsMap: Map<number, string> = new Map();
    for (const choice of race.chosen) {
      const tx = await buildTx(race, prevoutMap, choice.payout, config.apiUrl, config.prize, config.asset);
      txsMap.set(choice.dog.number, tx);
    }

    const txs = Array.from(txsMap.values());
    console.log(txs);

    return true;
  }

  @Get("/:id")
  public async getRace(@Path() id: string): Promise<Race> {
    return getRace(this.store.race, id);
  }
}

