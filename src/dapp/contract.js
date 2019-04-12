let FlightSuretyApp = require("../../build/contracts/FlightSuretyApp.json");
let Config = require("./config.json");
let Web3 = require("web3"); 

module.exports = class Contract {

    constructor(network, callback) {

        let configNetwork = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(configNetwork.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, configNetwork.appAddress);
        this.commonConfig = Config.commonConfig;
        this.initialize(callback);                
    }

    initialize(callback) {

        this.web3.eth.getAccounts((error, accts) => {                      
            callback();
        });
    }

    isOperational(callback) {        

       let self = this;
    
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.commonConfig.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {

        let self = this;
        let payload = {
            airline: self.commonConfig.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.commonConfig.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}
