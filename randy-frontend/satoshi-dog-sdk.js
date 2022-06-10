function _randomString(length, chars) {
  //https://stackoverflow.com/a/10727155/7407434
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function getKeyPair() {
  let privateKeyHex = localStorage.getItem("privateKeyHex");

  if (privateKeyHex) {
    return liquid0.ECPair.fromPrivateKey(
      Buffer.Buffer.from(privateKeyHex, "hex")
    );
  }

  let keyPair = liquid0.ECPair.makeRandom({
    network: liquid0.networks.testnet,
  });

  localStorage.setItem("privateKeyHex", keyPair.privateKey.toString("hex"));
  return keyPair;
}

function getPreImage() {
  let existingPreImage = localStorage.getItem("preimage");

  if (existingPreImage) {
    console.info("Existing preimage loaded.");
    return existingPreImage;
  }

  let preImage = _randomString(32, ["a", "b", "c"]);
  localStorage.setItem("preimage", preImage);

  return preImage;
}

let hexPublicKey = getKeyPair().publicKey.toString("hex");
console.log("Loaded public key", hexPublicKey);

let preImage = getPreImage();

let payload = {
  type: "reversesubmarine",
  pairId: "L-BTC/BTC",
  orderSide: "buy",
  preimageHash: liquid0.crypto.sha256(preImage).toString("hex"),
  onchainAmount: 50000,
  claimPublicKey: hexPublicKey,
};

let BOLTZ_ERR = {
  INVOICE_EXISTS: "invoice with payment hash already exists",
};

async function createReverseSubmarineSwap() {
  const url = "https://testnet.boltz.exchange/api/createswap";

  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  debugger;

  let reverseSubmarineSwapResponse;
  try {
    reverseSubmarineSwapResponse = await response.json();
  } catch (e) {
    reverseSubmarineSwapResponse = await response.text();
    console.log(reverseSubmarineSwapResponse);
    return;
  }

  if (!reverseSubmarineSwapResponse) {
    throw new Error(
      `No response found for call to ${url} with payload ${JSON.stringify(
        payload
      )}`
    );
  }

  debugger;

  if (reverseSubmarineSwapResponse.error) {
    let { error } = reverseSubmarineSwapResponse;
    console.log(error);

    if (error == BOLTZ_ERR.INVOICE_EXISTS) {
      return JSON.parse(localStorage.getItem("reverseSubmarineSwapResponse"));
    }
    return;
  }

  localStorage.setItem(
    "reverseSubmarineSwapResponse",
    JSON.stringify(reverseSubmarineSwapResponse)
  );
  return reverseSubmarineSwapResponse;
}
