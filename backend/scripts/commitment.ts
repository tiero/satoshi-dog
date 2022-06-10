import { Artifact, Contract } from '@ionio-lang/ionio';
import { address, networks } from 'liquidjs-lib';
import * as ecc from 'tiny-secp256k1';
import commitment from './commitment.json';


const payoutAddr = 'tex1qj5le7sewcp9jvfdzslz7usa0nexl6yjkcs4kaj';
const payoutProgram = address.toOutputScript(payoutAddr).slice(2);
const controlAsset = 'ac4af2d6ecc1ca3cfc9c42c2cf9cf8fa9cae743182cc30ff976af33c759b4614';

console.log(payoutProgram.toString('hex'))
// define the network we going to work
const network = networks.testnet;

  // 📚 Let's compile the script 
  const contractMario = new Contract(
    // our JSON artifact file
    commitment as Artifact,  
    // our constructor to replace template strings
    [1, payoutProgram, controlAsset], 
    // network for address encoding
    network, 
    // injectable secp256k1 library 
    ecc 
  );

  const contractLuigi = new Contract(
    // our JSON artifact file
    commitment as Artifact,  
    // our constructor to replace template strings
    [2, payoutProgram, controlAsset], 
    // network for address encoding
    network, 
    // injectable secp256k1 library 
    ecc 
  );

  const contractAlice = new Contract(
    // our JSON artifact file
    commitment as Artifact,  
    // our constructor to replace template strings
    [3, payoutProgram, controlAsset], 
    // network for address encoding
    network, 
    // injectable secp256k1 library 
    ecc 
  );

  const contractBob = new Contract(
    // our JSON artifact file
    commitment as Artifact,  
    // our constructor to replace template strings
    [4, payoutProgram, controlAsset], 
    // network for address encoding
    network, 
    // injectable secp256k1 library 
    ecc 
  );


  console.log(contractMario.address, contractMario.parity);
  console.log(contractLuigi.address, contractLuigi.parity);
  console.log(contractAlice.address, contractAlice.parity);
  console.log(contractBob.address, contractBob.parity);

  const dogNumber = Buffer.from((1 + 50).toString(), 'hex');
  const lenghtPrefix = Buffer.from('14', 'hex');
  const program = address.toOutputScript("tex1qj5le7sewcp9jvfdzslz7usa0nexl6yjkcs4kaj").slice(2);
  const flagAsset = Buffer.from("6d00c8692014469b753cf36a97ff30cc823174ae9cfaf89ccfc2429cfc3ccac1ecd6f24aac87", "hex");
  const scriptHex = Buffer.from([...dogNumber, ...lenghtPrefix, ...program, ...flagAsset]);
  console.log(scriptHex.toString('hex'));