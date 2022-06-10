import { RaceStore } from "src/repositories/race.store";
import { Get, Route, Tags, Post as PostMethod, Body, Path } from "tsoa";
import { Race } from '../models/race';
import { newRace, pickChoice, getRace, IChoicePayload } from "../repositories/race.repository";

@Route("races")
@Tags("Post")
export default class RaceController {

  constructor(private store: RaceStore) {}

  @PostMethod("/:id")
  public async updateRace(@Path() id: string, @Body() body: IChoicePayload): Promise<Race> {
    return await pickChoice(this.store, id, body);
  }

  @Get("/:id")
  public async getRace(@Path() id: string): Promise<Race> {
    return getRace(this.store, id);
  }
}