/// kye-generator    //////////////////////
/// techinfo@lora-wan.net

const openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp

 openpgp.config.compression = openpgp.enums.compression.zlib

var options = {
  userIds: [{ name: 'prototermserver', email: 'admin@abas.service' }],
  numBits: 2048,
  passphrase: 'who are you'
};

var publicKey;
var privateKey;

openpgp.generateKey(options).then(key => {
  privateKey = key.privateKeyArmored;
  publicKey = key.publicKeyArmored;
  console.log('Key generated');
  console.log(privateKey);
  console.log(publicKey);
const fs = require('fs');
fs.appendFileSync("./public.key", publicKey.toString());
fs.appendFileSync("./privat.key", privateKey.toString());

});

