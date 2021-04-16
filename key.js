/// kye-generator    //////////////////////
/// techinfo@lora-wan.net

const openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp

 openpgp.config.compression = openpgp.enums.compression.zlib

var options = {
 userIds: [{ name: 'test', email: 'test@example.com' }],
  numBits: 2048,
  passphrase: 'secretut'
};

var publicKey;
var privateKey;

openpgp.generateKey(options).then(key => {
  privateKey = key.privateKeyArmored;
  publicKey = key.publicKeyArmored;
  console.log('Key generated');
  console.log(privateKey);
  console.log(publicKey);
});

