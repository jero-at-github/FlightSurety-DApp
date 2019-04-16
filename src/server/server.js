let FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
let Config = require('./config.json');
let Web3 = require('web3');
let express = require('express');


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let defaultGas = 300000
let commonConfig = Config.commonConfig;        ;
const ORACLE_FEE = web3.utils.toWei("1", "ether");

// register 20 oracles
for (let i = 0; i < 20; i ++) {

    let oracle = commonConfig.oracles[i];

    flightSuretyApp.methods
        .registerOracle()
            .send({ from: oracle, value: ORACLE_FEE, gas: defaultGas }, (error, response) => {                                                                     
                
                if (!error) {
                    console.log("Oracle #" + i + " created");
                } 
                else {
                    console.log(error);
                }               
        });  
}

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event);
});

flightSuretyApp.events.OracleReport({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event);
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

module.exports = app;


