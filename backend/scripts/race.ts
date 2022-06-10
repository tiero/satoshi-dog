import { Artifact, Contract } from '@ionio-lang/ionio';
import { networks } from 'liquidjs-lib';
import * as ecc from 'tiny-secp256k1';
import commitment from './commitment.json';


// define the network we going to work
const network = networks.testnet;

  // 📚 Let's compile the script 
  const contract = new Contract(
    // our JSON artifact file
    commitment as Artifact,  
    // our constructor to replace template strings
    [1, payoutProgram, controlAsset], 
    // network for address encoding
    network, 
    // injectable secp256k1 library 
    ecc 
  );

  const contractAddress = contract.address;
  console.log(contractAddress);