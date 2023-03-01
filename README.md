# How to register dApp to Cardano + submit metadata to CIP-26 server

## Set up cardano-cli
[https://github.com/piotr-iohk/cardano-up](url)


## Set up wallet

1. Create Payment Keys\
`$ cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey`
2. To generate a stake key pair\
`$ cardano-cli stake-address key-gen --verification-key-file stake.vkey --signing-key-file stake.skey`
3. Create Wallet Address\
`$ cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr (--mainnet | --testnet-magic NATURAL)`
4. Request Test ADA at [https://docs.cardano.org/cardano-testnet/tools/faucet](url)\
NB transaction fee it's a variable amount, something around 190.000 lovelace
5. Retrieves the node’s current pool parameters\
`$ cardano-cli query protocol-parameters --out-file protocol.json (--mainnet | --testnet-magic NATURAL)`
6. Query tip\
`$ cardano-cli query tip (--mainnet | --testnet-magic NATURAL)`
7. Install packages\
`$ yarn install`
8. Generate key pair\
`$ yarn generate-key-pair`\
Copy `publicKey` and `secretKey` to `.env` file (see step 9)
9. Copy .env_example to .end and edit it accordingly\
`$ cp .env_example .env`
10. Copy `cip26_example.yml` to `cip26.yml` and edit it accordingly
11. Launch **cip26-cli** and follow the instructions\
`$ yarn start`

### Testnet-magic numbers
- 9: Devnet. 	`--testnet-magic=9`
- 2: Preview. 	`--testnet-magic=2`
- 1: Preprod. 	`--testnet-magic=1`


### Useful commands

Ref.: [https://docs.cardano.org/development-guidelines/use-cli](url)

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



