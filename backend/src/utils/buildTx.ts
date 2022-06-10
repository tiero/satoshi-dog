import { H_POINT } from "@ionio-lang/ionio";
import { fetchTxHex, TxOutput } from "ldk";
import { address, AssetHash, confidential, networks, Psbt, Transaction, witnessStackToScriptWitness } from "liquidjs-lib";
import { Choice } from "../models/choice";
import { Race } from "../models/race";

const hash = "5718b4b29e05485aaf5bc4148b769cc0bce365105e3949969972cb554b4c659d";
const index = 0;
// main convenant stuff
const leafVersion = 0xc4;
const controlBlockHex = "c41dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624"
const scriptHex = "2014469b753cf36a97ff30cc823174ae9cfaf89ccfc2429cfc3ccac1ecd6f24aac76d2040200000088d304000000008800cb04020000008800c8698800ce6988d45588d553881458d179ca6112752d00dc9b89ea4f55a585195e266b51cb04010000008851c86920499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c148851c969084c04000000000000887600c70100887551c70100887552c70100887553c70100887554c7010088757e7e7e7ea85154c0876351796b6801509301147e7c7e056d00c8692000c8697e01877e7e105461704c6561662f656c656d656e7473a8767e7c02c43c7c7e7ea811546170547765616b2f656c656d656e7473a8767e7c201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f6247c7e7ea8201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f62451ca69537a7c7e527a527ae452cb04010000008852c86920499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c148852c969084c04000000000000887600c70100887551c70100887552c70100887553c70100887554c7010088757e7e7e7ea85154c0876351796b6801509301147e7c7e056d00c8692000c8697e01877e7e105461704c6561662f656c656d656e7473a8767e7c02c43c7c7e7ea811546170547765616b2f656c656d656e7473a8767e7c201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f6247c7e7ea8201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f62452ca69537a7c7e527a527ae453cb04010000008853c86920499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c148853c969084c04000000000000887600c70100887551c70100887552c70100887553c70100887554c7010088757e7e7e7ea85154c0876351796b6801509301147e7c7e056d00c8692000c8697e01877e7e105461704c6561662f656c656d656e7473a8767e7c02c43c7c7e7ea811546170547765616b2f656c656d656e7473a8767e7c201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f6247c7e7ea8201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f62453ca69537a7c7e527a527ae454cb04010000008854c86920499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c148854c969084c04000000000000887600c70100887551c70100887552c70100887553c70100887554c7010088757e7e7e7ea85154c0876351796b6801509301147e7c7e056d00c8692000c8697e01877e7e105461704c6561662f656c656d656e7473a8767e7c02c43c7c7e7ea811546170547765616b2f656c656d656e7473a8767e7c201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f6247c7e7ea8201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f62454ca69537a7c7e527a527ae46c51d100888851cf6908a00f0000000000008851ce6920499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c148852cf690890010000000000008852ce6920499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c148800ca6900d16987";
const flagAsset = "ac4af2d6ecc1ca3cfc9c42c2cf9cf8fa9cae743182cc30ff976af33c759b4614";
const scriptPubKey = "5120722b4fb807fb7738deea3a42bbf1c8f3e08544012eb690217b1be13b33ee7cd0";


export async function buildTx(
  race: Race, 
  prevoutMap: Map<string, TxOutput>, 
  payoutAddress: string, 
  apiUrl: string, 
  prize: number, 
  payoutAsset: string
) {

  let witnessStack: Buffer[] = [];

  const txHex = await fetchTxHex(hash, apiUrl);
  const prevoutTx = Transaction.fromHex(txHex);
  const prevout: TxOutput = prevoutTx.outs[index];

  const tx = new Psbt({ network: networks.testnet });
  tx.addInput({
    hash,
    index,
    witnessUtxo: prevout,
    tapLeafScript: [
      {
        leafVersion: 0xc4,
        script: Buffer.from(scriptHex, 'hex'),
        controlBlock: Buffer.from(controlBlockHex, 'hex'),
      }
    ]
  });

  // main covenant recursive
  tx.addOutput({
    script: Buffer.from(scriptPubKey, 'hex'),
    value: confidential.satoshiToConfidentialValue(1),
    asset: AssetHash.fromHex(flagAsset, false).bytes,
    nonce: Buffer.alloc(0),
  });

  // go check all the outpoint

  race.chosen.forEach(async (c: Choice) => {
    const { txid, vout } = c.outpoint;
    const idOutpoint = `${txid}:${vout}`;
    const prevout = prevoutMap.get(idOutpoint);
    // prepare the transaction to redeem
    const dogNumber = Buffer.from((c.dog.number + 50).toString(), 'hex');
    const lenghtPrefix = Buffer.from('14', 'hex');
    const program = address.toOutputScript(c.payout).slice(2);
    const flagAssetScript = Buffer.from("6d00c8692014469b753cf36a97ff30cc823174ae9cfaf89ccfc2429cfc3ccac1ecd6f24aac87", "hex");
    const scriptHexLeaf = Buffer.from([...dogNumber, ...lenghtPrefix, ...program, ...flagAssetScript]);
    const parityBit = Buffer.of(leafVersion + c.parity);
    //console.log(c.parity, parityBit);
    const controlBlock = Buffer.concat([
      parityBit,
      H_POINT.slice(1)
    ]);
    tx.addInput({
      hash: c.outpoint.txid,
      index: c.outpoint.vout,
      witnessUtxo: prevout,
      tapLeafScript: [
        {
          leafVersion,
          script: scriptHexLeaf,
          controlBlock,
        }
      ]
    });
    witnessStack.push(
      Buffer.from([
        ...parityBit,
        ...program,
        ...dogNumber
      ])
    );
  });

  // payout
  tx.addOutput({
    script: address.toOutputScript(payoutAddress),
    value: confidential.satoshiToConfidentialValue(prize),
    asset: AssetHash.fromHex(payoutAsset, false).bytes,
    nonce: Buffer.alloc(0),
  });

  tx.addOutput({
    script: Buffer.alloc(0),
    value: confidential.satoshiToConfidentialValue(400),
    asset: AssetHash.fromHex(payoutAsset, false).bytes,
    nonce: Buffer.alloc(0),
  });

  tx.data.inputs.forEach((input, i) => {
    if (i === 0) {
      tx.finalizeInput(0, (_, input) => {
        return {
          finalScriptSig: undefined,
          finalScriptWitness: witnessStackToScriptWitness([
            ...witnessStack,
            input.tapLeafScript![0].script,
            input.tapLeafScript![0].controlBlock,
          ]),
        };
      });
      return;
    }

    tx.finalizeInput(i, (_, input) => {
      return {
        finalScriptSig: undefined,
        finalScriptWitness: witnessStackToScriptWitness([
          input.tapLeafScript![0].script,
          input.tapLeafScript![0].controlBlock,
        ]),
      };
    });
  })

  return tx.extractTransaction().toHex();
}