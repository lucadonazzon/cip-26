import dotenv from 'dotenv';
import cbor from 'cbor';
import blake2 from 'blake2';
import nacl from 'tweetnacl';
import fs from "fs"
import jsonKeysSort from 'json-keys-sort';
nacl.util = require('tweetnacl-util');

dotenv.config();

const encodeMessage = (subject, entry, entryName) => {
  const subjectHash = blake2.createHash('blake2b', { digestLength: 32 });
  const entryNameHash = blake2.createHash('blake2b', { digestLength: 32 });
  const valueHash = blake2.createHash('blake2b', { digestLength: 32 });
  const snHash = blake2.createHash('blake2b', { digestLength: 32 });
  const concatHash = blake2.createHash('blake2b', { digestLength: 32 });
  return concatHash
    .update(
      Buffer.from(
        `${subjectHash.update(cbor.encode(subject)).digest('hex')}${entryNameHash
          .update(cbor.encode(entryName))
          .digest('hex')}${valueHash.update(cbor.encode(entry.value)).digest('hex')}${snHash
            .update(cbor.encode(entry.sequenceNumber))
            .digest('hex')}`
      )
    )
    .digest('hex');
};

const signMsg = (message, secretKey) => {
  const _message = Buffer.from(message, 'hex')
  const _secretKey = Buffer.from(secretKey, 'hex')
  const _msg = nacl.sign.detached(_message, _secretKey)
  return Buffer.from(_msg).toString('hex')
}

const encodeAndSign = (subject, entry, entryName, secretKey = '') => {
  const encodedMsg = encodeMessage(subject, entry, entryName);
  return signMsg(encodedMsg, secretKey);
}

// **********************************************************************************************************
// **********************************************************************************************************
// **********************************************************************************************************

function generateJson() {

  const myCipJsonFile = {
    subject,
    name,
    description,
    preimage,
    url,
    logo
  }
  entries.forEach(item => {
    const { entryName, entry } = item;
    const signature = {
      signature: encodeAndSign(subject, entry, entryName, secretKey),
      publicKey: publicKey
    }
    myCipJsonFile[entryName] = {
      ...entry, signatures: [signature]
    }
  })

  try {
    fs.writeFileSync(cipFilePath, JSON.stringify(myCipJsonFile))
    console.log('JSON cip.json saved.')
  } catch (error) {
    console.error('JSON cip.json saving error:', error)
  }
}

// **********************************************************************************************************
// **********************************************************************************************************
// **********************************************************************************************************

const calculateRootHash = () => {
  const rawdata = fs.readFileSync(cipFilePath);
  const cip = JSON.parse(rawdata);
  const sortedCip = jsonKeysSort.sort(cip)
  const _hash = blake2.createHash('blake2b', { digestLength: 32 });
  return _hash.update(Buffer.from(JSON.stringify(sortedCip))).digest('hex')
}

// **********************************************************************************************************
// **********************************************************************************************************
// **********************************************************************************************************

const generateMetadataJsonFile = () => {
  try {
    const metadataJson = {
      "666": {
        subject,
        type: "REGISTER",
        rootHash: cipRootHash,
        cip26: ["https://cip26metadata.apps.atixlabs.xyz"],
      }
    }

    const _blake = blake2.createHash('blake2b', { digestLength: 32 });
    const _hash = _blake.update(Buffer.from(JSON.stringify(metadataJson['666']))).digest('hex')
    
    const _sign = nacl.sign.detached(Buffer.from(_hash, 'hex'), Buffer.from(secretKey, 'hex'))
    // console.log(">>>>verify signature:",nacl.sign.detached.verify(Buffer.from(_hash, 'hex'), _sign, Buffer.from(publicKey, 'hex')))

    const _sign2 = Buffer.from(_sign).toString('hex')
    // console.log("---_sign2:", _sign2)
    // console.log("--- R:", _sign2.substring(0, 64))
    // console.log("--- S:", _sign2.substring(64))

    metadataJson['666'].signature = {
      r: _sign2.substring(0, 64),
      s: _sign2.substring(64),
      algo: "Ed25519−EdDSA",
      pub: publicKey
    }
    
    fs.writeFileSync(metadataFilePath, JSON.stringify(metadataJson))
    console.log(`'JSON ${metadataFilePath} saved.'`)
  } catch (error) {
    console.error(`JSON ${metadataFilePath} saving error:`, error)
  }
}

// **********************************************************************************************************
// **********************************************************************************************************
// **********************************************************************************************************


// **********************************************************************************************************
// ** PROPERTIES & FIELDS ***********************************************************************************
// **********************************************************************************************************

const walletAddress = process.env.WALLET_ADDRESS;
const publicKey = process.env.PUBLIC_KEY;
const secretKey = process.env.SECRET_KEY;

const cipFilePath = process.env.CIP_FILE_PATH;
const metadataFilePath = process.env.METADATA_FILE_PATH;
const protocolFilePath = process.env.PROTOCOL_FILE_PATH

const subject = "GamesTestDApp-1";
const name = "Games TestDApp 1";
const description = "This is a dApp description..."
const logo = "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";
const preimage = {
  "alg": "sha1",
  "msg": "AADDBBCC"
}
const url = "https://games1.tespdapp.x/app";
const entries = [
  /** DAppDeployedScripts */
  {
    entryName: "DAppDeployedScripts",
    entry: {
      value: "", sequenceNumber: 0
    }
  },
  /** DAppCategory */
  {
    entryName: "DAppCategory",
    entry: {
      value: "Games",
      sequenceNumber: 0,
    }
  },
  /** DAppDeveloperName */
  {
    entryName: "DAppDeveloperName",
    entry: {
      value: "John Doe",
      sequenceNumber: 0,
    }
  },
  /* DAppDevelopersEmailAddress */
  {
    entryName: "DAppDevelopersEmailAddress",
    entry: {
      value: "jhon.doe@tespdapp.x",
      sequenceNumber: 0,
    }
  },
  // DAppCompanyURL
  {
    entryName: "DAppCompanyURL",
    entry: {
      value: "https://games1.tespdapp.x",
      sequenceNumber: 0,
    }
  },
  /* DAppSummary */
  {
    entryName: "DAppSummary",
    entry: {
      value: "short summary that will be shown also on classic view card boards",
      sequenceNumber: 0,
    }
  },
  /* DAppScreenshots */
  {
    entryName: "DAppScreenshots",
    entry: {
      value: [
        "https://ucarecdn.com/1fae46a1-945c-45fc-a074-a9df7f3cb0e1/-/resize/800/-/format/webp/-/quality/best/-/progressive/yes/",
        "https://cdn.realsport101.com/images/ncavvykf/gfinityesports/bff2f5cd868eb7e5b8c5ba0af08e1782d3156535-1200x675.png?w=686&h=386&auto=format",
        "https://miro.medium.com/max/720/1*5Vuc1HvPxG4HTogantP5ng.webp"
      ],
      sequenceNumber: 0,
    }
  },
  /* DAppPermissionToAggregate */
  // {
  //   entryName: "DAppPermissionToAggregate",
  //   entry: {
  //     value: "DApp Store is allowed to show the dApp information", sequenceNumber: 0
  //   }
  // }
]

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
generateJson();
const cipRootHash = calculateRootHash();
console.log("Calculated CIP JSON rootHash:", cipRootHash)
generateMetadataJsonFile();

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>






