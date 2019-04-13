let FlightSuretyApp = require("../../build/contracts/FlightSuretyApp.json");
let Config = require("./config.json");
let Web3 = require("web3"); 

module.exports = class Contract {

    constructor(network, callback) {

        this.defaultGas = 300000;
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

    getBalance(address, callback) {   
        let self = this;     
        self.web3.eth.getBalance(address).then( (response) => {

            // convert from wei to ether
            let balance = self.web3.utils.fromWei(response, "ether");
            callback(balance);
        });
    }   

    isSuretyAlreadyBought(flightIndex, address, callback) {        
         
        let self = this;    
        let flight = self.commonConfig.flights[flightIndex];      

        return self.flightSuretyApp.methods
            .isSuretyAlreadyBought(flight.description, flight.flightCode, flight.airline)
            .call({ from: address}, callback);       
    }

    buySurety(flightIndex, address, value, callback) {
        
        let self = this;    
        let flight = self.commonConfig.flights[flightIndex];                   

        value = self.web3.utils.toWei(value, "ether");       
                       
        return self.flightSuretyApp.methods
            .buySurety(flight.description, flight.flightCode, flight.airline)
            .send({ 
                from: address, 
                value: value,
                gas: this.defaultGas}, 
                (error, response) => {
                    if (error) alert(error);
                    console.log(response);

                    callback();
            });                   
    }

}
