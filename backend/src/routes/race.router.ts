import express from "express";
import RaceController from '../controllers/race.controller';
import StoreManager from "../storage";

const router = express.Router();
const store = new StoreManager();

router.post("/", async (_, res) => {
  const controller = new RaceController(store);
  const response = await controller.newRace();
  return res.send(response);
});

router.get("/", async (_, res) => {
  const controller = new RaceController(store);
  const response = await controller.getRaceIDs();
  if (!response) res.status(404).send({ message: "No races found" })
  return res.send(response);
});

router.get("/:id", async (req, res) => {
  const controller = new RaceController(store);
  const response = await controller.getRace(req.params.id);
  if (!response) res.status(404).send({ message: "No race found" })
  return res.send(response);
});

router.post("/:id", async (req, res) => {
  const controller = new RaceController(store);
  try {
    const response = await controller.updateRace(req.params.id, req.body);
    return res.send(response);
  } catch(e: any) {
    console.error(e)
    return res.status(400).send({ message: e.message });
  }

});

router.post("/:id/run", async (req, res) => {
  const controller = new RaceController(store);
  try {
    const response = await controller.runRace(req.params.id);
    return res.send(response);
  } catch(e: any) {
    console.error(e)
    return res.status(400).send({ message: e.message });
  }
 
});

router.delete("/:id", async (req, res) => {
  const controller = new RaceController(store);
  const response = await controller.deleteRace(req.params.id);
  if (!response) res.status(404).send({ message: "No race found" });
  return res.send();
});



export default router;