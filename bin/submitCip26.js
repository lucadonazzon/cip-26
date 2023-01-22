import fs from "fs"
import axios from "axios";


// const cipServerUrl = process.env.CIP_SERVER_URL;
// const cipFilePath = process.env.CIP_FILE_PATH;
// console.log("cipServerUrl:", cipServerUrl)
// console.log("cipFilePath:", cipFilePath)


// const submitCip = async (cipServerUrl, cipFilePath) => {
//     try {
//         const file = fs.readFileSync(cipFilePath, 'utf8')
//         // console.log("file:", file)
//         const _subm = axios.post(cipServerUrl, JSON.parse(file))
//         return _subm
//         // console.log(">>>>", _subm)

//     } catch (error) {
//         console.log("CIP submission ERR:")
//         return error
//         // return false;
//     }
// }

const submitCip = (cipServerUrl, cipFilePath) => {
    return new Promise((resolve, reject) => {
        const file = fs.readFileSync(cipFilePath, 'utf8')
        // resolve("ok")
        // reject('merda')
        // reject(new Error("merda"))
        axios.post(`${cipServerUrl}/metadata`, JSON.parse(file))
            .then(function (response) {
                // console.log("SUBMISSION OK:", response.data);
                resolve(response.data)
            })
            .catch(function (error) {
                // console.log("SUBMISSION ERR:", error.message, error.response.data);
                // console.log("SUBMISSION ERR:", error.message);
                reject(`CIP submission failed with error: ${error.message}`)
            });
    })
}

export { submitCip };