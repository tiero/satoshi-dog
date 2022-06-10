import { Artifact, Contract } from "@ionio-lang/ionio";
import { address, networks } from "liquidjs-lib";
import config from "../config/app";
import { Post, Path,Tags, Body, Route } from "tsoa";
import commitment from '../../scripts/commitment.json';
import * as ecc from 'tiny-secp256k1';



interface ContractRequest {
  payout: string;
  choice: number;
}

interface ContractResponse {
  address: string;
  parity: number;
}

@Route("contract")
@Tags("Contract")
export default class ContractController {
  @Post("/")
  public async getContract(@Body() body: ContractRequest): Promise<any> {
    try {
      const network = networks.testnet;
      const payoutProgram = address.toOutputScript(body.payout).slice(2);
      // 📚 Let's compile the script 
      const contract = new Contract(
        // our JSON artifact file
        commitment as Artifact,  
        // our constructor to replace template strings
        [body.choice, payoutProgram, config.flagAsset], 
        // network for address encoding
        network, 
        // injectable secp256k1 library 
        ecc 
      );
      return {
        address: contract.address,
        parity: contract.parity,
      };
    } catch(e) {
      console.error(e)
    }

  }
}
