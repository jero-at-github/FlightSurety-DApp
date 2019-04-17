let FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
let Config = require('./config.json');
let Web3 = require('web3');
let express = require('express');


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let defaultGas = 300000
let commonConfig = Config.commonConfig;;
const ORACLE_FEE = web3.utils.toWei("1", "ether");

const TEST_ORACLES_COUNT = 20;

// register 20 oracles
for (let i = 0; i < 20; i++) {

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

    if (error) {
        console.log("Error - OracleRequest");
        console.log(error);
    }
    else {
        console.log("OracleRequest");
        //console.log(event);
        submitResponses(event);
    }
});


flightSuretyApp.events.OracleReport({
    fromBlock: 0
}, function (error, event) {
    if (error) {
        console.log("Error - OracleReport");
        console.log(error)
    } 
    else {
        console.log("OracleReport");
        console.log(event);
    }        
});


function submitResponses(event) {

    let airline = event.returnValues[1];
    let flightCode = event.returnValues[2];
    let description = event.returnValues[3];

    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {

        // get oracle
        let oracle = commonConfig.oracles[a];

        // generate random status code        
        let statusCode = Math.floor(Math.random() * (5 - 0 + 1)) * 10;
        
        // Get oracle information
        let oracleIndexes = null;
        flightSuretyApp.methods.getMyIndexes().call({ from: oracle }, (error, response) => {
            
            oracleIndexes = response;

            // loop through indexes
            for (let idx = 0; idx < 3; idx++) {
               
                try {                
                    flightSuretyApp.methods
                        .submitOracleResponse(oracleIndexes[idx], airline, flightCode, description, statusCode)
                        .send({ from: oracle, gas: defaultGas }, (error, response) => {

                            if (!error) {
                                console.log("Oracle response #" + a + " submited");
                            }
                            else {
                                console.log(error);
                            }
                        });                    
                }
                catch (e) {                    
                    console.log('\nError', idx, oracleIndexes[idx], flightCode, description);                    
                }                
            }
        });        
    }
}

const app = express();
app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!'
    })
})

module.exports = app;


