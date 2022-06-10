import React, { useState, useEffect } from "react";
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';

function Race() {

  useEffect(() => {
    const ECPair = ECPairFactory(ecc);
    (async () => {
      const random = ECPair.makeRandom();
      console.log(random.privateKey?.toString('hex'));
   })();
  });

  return <h1>Dog Racing 🐶🐶</h1>;
}

export default Race;