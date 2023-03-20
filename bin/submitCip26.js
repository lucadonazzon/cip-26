import fs from "fs"
import axios from "axios";
import { calculateRootHash, cleanJsonCip, generateJson } from "./jsonGenerator.js"
import { exit } from "process";

const submitCip = (cipServerUrl, cipFilePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.readFileSync(cipFilePath, 'utf8')
    axios.post(`${cipServerUrl}/metadata`, JSON.parse(file))
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(`CIP submission failed with error: ${error.response?.data?.message || error.message}`)
      });
  })
}

/**
 1. PUT update @cip26 server
 2. GET json back
 3. calculate rootHash
 3. subnmit transaction
 */

const updateCip = (cipServerUrl, cipFilePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.readFileSync(cipFilePath, 'utf8');
    const cip = JSON.parse(file);

    const subject = cip.subject;
    delete cip.subject;

    
    axios.put(`${cipServerUrl}/metadata/${subject}`, cip)
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(`CIP update failed with error: ${error.response?.data?.message || error.message}`)
      });
  })
}

const getCipFromServer = async (cipServerUrl, cipFilePath) => {
  try {
    const file = fs.readFileSync(cipFilePath, 'utf8');
    const cipOld = JSON.parse(file);
    const subject = cipOld.subject;
    const cip = await axios.get(`${cipServerUrl}/metadata/${subject}`)
    
    fs.writeFileSync(cipFilePath, JSON.stringify(cip.data))
  } catch (error) {
    return error;
  }

}

const _updateCip = (cipServerUrl, cipFilePath, secretKey, publicKey) => {
  return new Promise((resolve, reject) => {
    const file = fs.readFileSync(cipFilePath, 'utf8')
    const cip = JSON.parse(file);

    const subject = cip.subject;
    delete cip.subject;
    // console.log("cip:", cip);

    axios.get(`${cipServerUrl}/metadata/${subject}`)
      .then(function (response) {
        // resolve(response.data)
        let updatedCip = { ...response.data, ...cip }
        console.log(">>>>>>updatedCip #1:", updatedCip);
        updatedCip = generateJson(cipYmlFilePath, secretKey, publicKey, cipFilePath, 'return')
        console.log(">>>>>>updatedCip #2:", updatedCip);
        // axios.put(`${cipServerUrl}/metadata/${subject}`, updatedCip)
        //   .then(function (response) {
        //     resolve(response.data)
        //   })
        //   .catch(function (error) {
        //     reject(`CIP update failed with error: ${error.response?.data?.message || error.message}`)
        //   });

      })
      .catch(function (error) {
        reject(`CIP get failed with error: ${error.response?.data?.message || error.message}`)
      });


  })
}

export { submitCip, updateCip, getCipFromServer };