import { exec } from "child_process"

// let walletAddress = ''
// let metadataFilePath = ''
// const walletAddress = process.env.WALLET_ADDRESS;
// const publicKey = process.env.PUBLIC_KEY;
// const secretKey = process.env.SECRET_KEY;

// const cipFilePath = process.env.CIP_FILE_PATH;
// const metadataFilePath = process.env.METADATA_FILE_PATH;
// const protocolFilePath = process.env.PROTOCOL_FILE_PATH


const queryUTXO = (walletAddress) => {
    return new Promise((resolve, reject) => {

        exec(`cardano-cli query utxo \
        --address ${walletAddress} \
        --testnet-magic=2`, (error, stdout, stderr) => {
            if (error) {
                reject(error.message)
                return;
            }
            if (stderr) {
                reject(stderr)
                return;
            }
            // console.log(`stdout: \n${stdout}`);
            const _match = stdout.match(/([a-z0-9]{64}) *(\d) *(\d+)/)
            const TxHash = _match[1];
            const TxIx = parseInt(_match[2]);
            const Amount = parseInt(_match[3]);
            // console.log('>>> TxHash:', TxHash)
            // console.log('>>> TxIx:', TxIx)
            // console.log('>>> Amount:', Amount)

            resolve({ TxHash, TxIx, Amount })
            // createDraftTransaction(TxHash, TxIx, Amount)
        });
    });
}
// **********************************************************************************************************
const createDraftTransaction = (walletAddress, metadataFilePath, TxHash, TxIx) => {
    return new Promise((resolve, reject) => {
        const cmd = `cardano-cli transaction build-raw \
                    --tx-in ${TxHash}#${TxIx} \
                    --tx-out ${walletAddress}+0 \
                    --metadata-json-file ${metadataFilePath} \
                    --fee 0 \
                    --out-file tx.draft`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error.message)
                return;
            }
            if (stderr) {
                reject(stderr)
                return;
            }
            // console.log('CMD:', cmd)
            // console.log('>>> createDraftTransaction ok!');
            resolve(true)
            // calculateTransactionFee(TxHash, TxIx, Amount)
        });
    })
}

// **********************************************************************************************************
const calculateTransactionFee = (protocolFilePath, Amount) => {
    return new Promise((resolve, reject) => {
        const cmd = `cardano-cli transaction calculate-min-fee \
                    --tx-body-file tx.draft \
                    --tx-in-count 1 \
                    --tx-out-count 1 \
                    --witness-count 1 \
                    --byron-witness-count 0 \
                    --testnet-magic 2 \
                    --protocol-params-file ${protocolFilePath}`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error.message)
                return;
            }
            if (stderr) {
                reject(stderr)
                return;
            }
            // console.log(`stdout: \n${stdout}`);
            const _match = stdout.match(/(\d+) Lovelace/)
            const fee = parseInt(_match[1]);
            const finalAmount = Amount - fee;
            // console.log('CMD:', cmd);
            // console.log(`>>> fee: `, fee);
            // console.log(`>>> finalAmount: `, finalAmount);
            resolve({ fee, finalAmount });
            // buildRealTransaction(TxHash, TxIx, Amount, fee, finalAmount)
        });
    });
}

// **********************************************************************************************************
const buildRealTransaction = (walletAddress, metadataFilePath, TxHash, TxIx, fee, finalAmount) => {
    return new Promise((resolve, reject) => {
        const cmd = `cardano-cli transaction build-raw \
                    --tx-in ${TxHash}#${TxIx} \
                    --tx-out ${walletAddress}+${finalAmount} \
                    --metadata-json-file ${metadataFilePath} \
                    --fee ${fee} \
                    --out-file tx.draft`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error.message)
                return;
            }
            if (stderr) {
                reject(stderr)
                return;
            }
            // console.log('CMD:', cmd);
            // console.log('>>> buildRealTransaction ok!');
            // signdRealTransaction()
            resolve(true)
        });
    });
}

// **********************************************************************************************************
const signdRealTransaction = (paymentSkeyFilePath) => {
    return new Promise((resolve, reject) => {

        // const paymentSkeyFilePath = process.env.PAYMENT_SKEY_FILE_PATH;
        exec(`cardano-cli transaction sign \
        --tx-body-file tx.draft \
        --signing-key-file ${paymentSkeyFilePath} \
        --testnet-magic 2 \
        --out-file tx.signed`, (error, stdout, stderr) => {
            if (error) {
                reject(error.message)
                return;
            }
            if (stderr) {
                reject(stderr)
                return;
            }
            // console.log('>>> signdRealTransaction ok!');
            // submitTransaction()
            resolve(true)
        });
    });
}

const submitTransaction = () => {
    return new Promise((resolve, reject) => {
        exec(`cardano-cli transaction submit --tx-file tx.signed --testnet-magic 2`, (error, stdout, stderr) => {
            if (error) {
                reject(error.message)
                return;
            }
            if (stderr) {
                reject(stderr)
                return;
            }
            // console.log('>>> submitTransaction ok!');
            resolve(true)
        });
    });
}

// const submitTX = (_walletAddress, _metadataFilePath) => {
//     walletAddress = _walletAddress
//     metadataFilePath = _metadataFilePath
//     queryUTXO()
// }

export { queryUTXO, createDraftTransaction, calculateTransactionFee, buildRealTransaction, signdRealTransaction, submitTransaction }