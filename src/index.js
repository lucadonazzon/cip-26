import dotenv from 'dotenv';
import cbor from 'cbor';
import blake2 from 'blake2';
import nacl from 'tweetnacl';
import fs from "fs"
import jsonKeysSort from 'json-keys-sort';
import YAML from 'yaml';
import * as util from 'tweetnacl-util';
nacl.util = util;


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
  const file = fs.readFileSync(cipYmlFilePath, 'utf8')
  const yml = YAML.parse(file);

  const myCipJsonFile = {}
  subject = yml.subject;

  for (const prop in yml) {
    if (prop === 'entries') {
      for (const item of yml[prop]) {
        const { entryName, entry } = item;
        const signature = {
          signature: encodeAndSign(subject, entry, entryName, secretKey),
          publicKey: publicKey
        }
        myCipJsonFile[entryName] = {
          ...entry, signatures: [signature]
        }
      }
    } else {
      myCipJsonFile[prop] = yml[prop]
    }
  }

  try {
    fs.writeFileSync(cipFilePath, JSON.stringify(myCipJsonFile))
    console.log(`'JSON ${cipFilePath} saved.'`)
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

const generateMetadataJsonFile = (cipRootHash) => {
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
const cipYmlFilePath = process.env.CIP_YML_FILE_PATH;
const metadataFilePath = process.env.METADATA_FILE_PATH;
const protocolFilePath = process.env.PROTOCOL_FILE_PATH
let subject = ''

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
generateJson();
generateMetadataJsonFile(calculateRootHash());

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

