import { calculateRootHash } from "../bin/jsonGenerator.js"
import dotenv from 'dotenv';
dotenv.config();

const cipFilePath = process.env.CIP_FILE_PATH;

const run = async () => {
    const rootHash = await calculateRootHash(cipFilePath)
    // console.log(">rootHash:", rootHash)
}

run()