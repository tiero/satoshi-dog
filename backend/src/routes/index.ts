import express from "express";
import ContractController from "../controllers/contract.controller";
import PingController from "../controllers/ping.controller";
import RaceRouter from "./race.router";

const router = express.Router();

router.get("/ping", async (req, res) => {
  const controller = new PingController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.post("/contract", async (req, res) => {
  const controller = new ContractController();
  const response = await controller.getContract(req.body);
  return res.send(response);
});


router.use("/races", RaceRouter)

export default router;
