import dotenv from 'dotenv';
import fs from "fs"
import axios from "axios";

dotenv.config();

const cipServerUrl = process.env.CIP_SERVER_URL;
const cipFilePath = process.env.CIP_FILE_PATH;
console.log("cipServerUrl:", cipServerUrl)
console.log("cipFilePath:", cipFilePath)

const file = fs.readFileSync(cipFilePath, 'utf8')
// console.log("file:", file)
axios.post(cipServerUrl, JSON.parse(file))
    .then(function (response) {
        console.log("SUBMISSION OK:", response.data);
    })
    .catch(function (error) {
        console.log("SUBMISSION ERR:", error.message, error.response.data);
    });