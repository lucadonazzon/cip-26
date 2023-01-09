import nacl from 'tweetnacl';
nacl.util = require('tweetnacl-util');

const generateKeyPair = () => {
    const mykey = nacl.sign.keyPair()
    return { publicKey: nacl.util.encodeBase64(mykey.publicKey), secretKey: nacl.util.encodeBase64(mykey.secretKey) }
}

console.log("keyPair:", generateKeyPair())