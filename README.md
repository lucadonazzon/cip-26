# How to register dApp to Cardano Preview testnet + metadata to CIP-26 server

## Set up cardano-cli
1. Install Daedalus wallet
2. add cardano-cli PWD to PATH \
`$ export CARDANO_NODE_SOCKET_PATH="<user root folder>/Library/Application Support/Daedalus Preview/cardano-node.socket"`

### Useful commands

To query tip\
`$ cardano-cli query tip --testnet-magic 2`

Create Payment Keys\
`$ cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey`

Create Wallet Address\
`$ cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr --testnet-magic=2`

Create protocol\
`$ cardano-cli query protocol-parameters --out-file protocol.json --testnet-magic=2`

Query UTXO
```
$ cardano-cli query utxo \
  --address $(< payment.addr) \
  --testnet-magic=2

Output:
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
99b8fcac018828b6f6b29eb55211ac5e69a8651736c4c3d6280ca4524fd41778     0        9998003445 lovelace + TxOutDatumNone

```

To create draft transaction:
```
$ cardano-cli transaction build-raw \
--tx-in 99b8fcac018828b6f6b29eb55211ac5e69a8651736c4c3d6280ca4524fd41778#0 \
--tx-out $(cat payment.addr)+0 \
--metadata-json-file metadata.json \
--fee 0 \
--out-file tx.draft
```

To calculate the transaction fee: 
```
$ cardano-cli transaction calculate-min-fee \
--tx-body-file tx.draft \
--tx-in-count 1 \
--tx-out-count 1 \
--witness-count 1 \
--byron-witness-count 0 \
--testnet-magic 2 \
--protocol-params-file protocol.json
```

Then we calculate the total amount of our wallet minus the calculated fee as the total output amount\
`$ expr 9998003445 - 180285 = 9997823160`

To build final transaction:
```
$ cardano-cli transaction build-raw \
--tx-in 99b8fcac018828b6f6b29eb55211ac5e69a8651736c4c3d6280ca4524fd41778#0 \
--tx-out $(cat payment.addr)+9997823160 \
--metadata-json-file metadata.json \
--fee 180285 \
--out-file tx.draft
```

To sign the transaction:
```
$ cardano-cli transaction sign \
--tx-body-file tx.draft \
--signing-key-file payment.skey \
--testnet-magic 2 \
--out-file tx.signed
```

To submit the transaction:\
`$ cardano-cli transaction submit --tx-file tx.signed --testnet-magic 2`

### Testnets faucet
[https://docs.cardano.org/cardano-testnet/tools/faucet](url)

## Scripts usage

Install packages\
`$ yarn install`

Generate key pair\
`$ yarn generate-key-pair`

Copy .env_example to .end and edit it accordingly\
`$ cp .env_example .end`

Edit `index.js` from line 144 to 220 accordingly\
Generate cip.json and metadata.json:\
`$ yarn generate-json-files`

Submit transaction to Preview testnet\
`$ yarn submit-tx`

