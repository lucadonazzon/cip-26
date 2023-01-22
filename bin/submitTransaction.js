import { exec } from "child_process"


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

            const _match = stdout.match(/([a-z0-9]{64}) *(\d) *(\d+)/)
            const TxHash = _match[1];
            const TxIx = parseInt(_match[2]);
            const Amount = parseInt(_match[3]);

            resolve({ TxHash, TxIx, Amount })
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

            resolve(true)
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
            
            const _match = stdout.match(/(\d+) Lovelace/)
            const fee = parseInt(_match[1]);
            const finalAmount = Amount - fee;
            
            resolve({ fee, finalAmount });
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
            
            resolve(true)
        });
    });
}

// **********************************************************************************************************
const signdRealTransaction = (paymentSkeyFilePath) => {
    return new Promise((resolve, reject) => {
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
            resolve(true)
        });
    });
}

export { queryUTXO, createDraftTransaction, calculateTransactionFee, buildRealTransaction, signdRealTransaction, submitTransaction }