var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  networks: {
    development: {
      /*   This provider doesn't work, it throws a "the tx doesn't have the correct nonce" in tests
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
      },
      */      
      host: "127.0.0.1",
      port: 7545,      
      network_id: '*',
      gas: 6721975
    }
  },
  compilers: {
    solc: {
        version: "^0.4.25"
      }
  }
};