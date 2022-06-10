import StoreManager from "../storage";
import axios from "axios";
import { Get, Route, Tags, Post, Body, Path, Delete } from "tsoa";
import { Race, RaceStatus } from '../models/race';
import { newRace, pickChoice, declareWinner, getRace, deleteRace, getRaceIDs, IChoicePayload, changeRaceStatus } from "../repositories/race.repository";
import { getPrevout } from "../repositories/prevout.repository";

import { fetchTxHex, Transaction, confidential, AssetHash, TxOutput } from "ldk";
import config from "../config/app";

import { buildTx } from "../utils/buildTx";
import { Dog } from "../models/dog";
import { extractErrorMessage } from "../utils/error";


@Route("races")
@Tags("Race")
export default class RaceController {

  constructor(private store: StoreManager) { }

  @Post("/")
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

  @Post("/:id")
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

  @Post("/:id/run")
  public async runRace(@Path() id: string): Promise<{
    houseWon: boolean,
    winnerDog?: Dog,
    winnerTxID?: string,
  }> {
   
    await changeRaceStatus(this.store.race, id, RaceStatus.IN_PROGRESS);

    const race = await getRace(this.store.race, id);
    const prevoutMap: Map<string, TxOutput> = new Map();
    for (const choice of race.chosen) {
      const {txid, vout} = choice.outpoint;
      const idOutpoint = `${txid}:${vout}`
      const prevout = await getPrevout(this.store.prevout, idOutpoint);
      prevoutMap.set(idOutpoint, prevout);
    }

    let winnerTxID = undefined;
    let winnerDog = undefined;
    let houseWon = true;
    for (const choice of race.chosen) {
      const tx = await buildTx(race, prevoutMap, choice.payout, config.apiUrl, config.flagAsset, config.prize, config.asset);
      try {
        const response = await axios.post(`${config.apiUrl}/tx`, tx);
        if (response.status !== 200) throw new Error(response.data);
        winnerTxID = response.data;
        if (!winnerTxID) {
          houseWon = false,
          winnerDog = choice.dog;
        }
        break;
      } catch (err) {
        const message = extractErrorMessage(err);
        console.error(message);
        console.log(tx);
        continue;
      }
    }

    await declareWinner(this.store.race, id, houseWon, winnerDog);

    return {
      houseWon,
      winnerDog,
      winnerTxID,
    };
  }

  @Get("/:id")
  public async getRace(@Path() id: string): Promise<Race> {
    return getRace(this.store.race, id);
  }
}

