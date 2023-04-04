import {
    queryUTXO,
    createDraftTransaction,
    calculateTransactionFee,
    buildRealTransaction,
    signdRealTransaction,
    submitTransaction
} from "../bin/submitTransaction.js";
import dotenv from 'dotenv';
// import { exec } from "child_process"
dotenv.config();

const walletAddress = process.env.WALLET_ADDRESS;
const metadataFilePath = process.env.METADATA_FILE_PATH;
const protocolFilePath = process.env.PROTOCOL_FILE_PATH;
const paymentSkeyFilePath = process.env.PAYMENT_SKEY_FILE_PATH;
const net = process.env.NET;



const run = async () => {
    try {
        console.log("- NET: ", net)
        console.log("- walletAddress: ", walletAddress)
        console.log("- metadataFilePath: ", metadataFilePath)
        console.log("- protocolFilePath: ", protocolFilePath)
        console.log("- paymentSkeyFilePath: ", paymentSkeyFilePath)
        console.log("--------------------------------------------------------------------------------")
        const { TxHash, TxIx, Amount } = await queryUTXO(walletAddress, net)
        console.log("- TxHash: ", TxHash)
        console.log("- TxIx: ", TxIx)
        console.log("- Amount: ", Amount)
        await createDraftTransaction(walletAddress, metadataFilePath, TxHash, TxIx)
        console.log("- Transaction draft created!")
        const { fee, finalAmount } = await calculateTransactionFee(protocolFilePath, Amount, net);
        console.log("- fee: ", fee)
        console.log("- finalAmount: ", finalAmount)
        await buildRealTransaction(walletAddress, metadataFilePath, TxHash, TxIx, fee, finalAmount);
        console.log("- Transaction built!")
        await signdRealTransaction(paymentSkeyFilePath, net)
        console.log("- Transaction signed!")
        await submitTransaction(net)
        console.log("- Transaction submitted!")
        const { TxHash: TxHash2 } = await queryUTXO(walletAddress, net)
        console.log("- TxHash: ", TxHash2)
    } catch (error) {
        console.error(error)
    }
}

run()