let FlightSuretyApp = require("../../build/contracts/FlightSuretyApp.json");
let Config = require("./config.json");
let Web3 = require("web3"); 

module.exports = class Contract {

    constructor(network, callback) {

        this.defaultGas = 300000;
        let configNetwork = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(configNetwork.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, configNetwork.appAddress);
        this.contractAddress = this.flightSuretyApp._address;
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

    fetchFlightStatus(flightIndex) {

        let self = this;
        let flight = self.commonConfig.flights[flightIndex];  
        let airline = self.commonConfig.airlines[flight.airlineIndex];     
        
        self.flightSuretyApp.methods
            .fetchFlightStatus(flight.description, flight.flightCode, airline.address)
            .send({ from: self.commonConfig.owner}, (error, result) => {                
                if (error) {
                    alert(error);
                }
            });
    }

    async registerAirline(index) {

        let self = this;   

        return new Promise(function(resolve, reject) {            

            let fundAirlineValue = self.web3.utils.toWei("10", "ether");
            let firstAirline = self.commonConfig.airlines[0];
            let airline = self.commonConfig.airlines[index];
    
            // register airline
            self.flightSuretyApp.methods
            .registerAirline(airline.address, airline.name)
                .send({ from: firstAirline.address, gas: this.defaultGas }, (error, response) => {                                                                     
                
                if (!error) {                                                 
    
                    // fund airline
                    self.flightSuretyApp.methods
                        .fundAirline()
                        .send({ from: airline.address, value: fundAirlineValue, gas: this.defaultGas }, (error, response) => {            
                            if (error) {
                                reject(error);
                            }   
                            else {
                                resolve();
                            }    
                        });  
                }
                else {
                    reject(error);
                }
            });  
        });        
    }

    async registerAirlines(callback) {

        let self = this;   

        // register 3 airlines (plus the default registered one)
        let iterator = [1,2,3];     
        for (index of iterator) {
            
            await self.registerAirline(index);
        }   
        
        callback();
    }

    getNumRegAirlines(callback) {
        let self = this;     

        self.flightSuretyApp.methods.getNumRegAirlines().call((error, response) => {            
            callback(response);
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

    getPassengerFunds(address, callback) { 

        let self = this;     
        self.flightSuretyApp.methods
            .getPassengerFunds()
            .call({ from: address}, (error, response) => {

            // convert from wei to ether
            let funds = self.web3.utils.fromWei(response, "ether");
            callback(funds);
        });
    }   

    isSuretyAlreadyBought(flightIndex, address, callback) {        
         
        let self = this;    
        let flight = self.commonConfig.flights[flightIndex];
        let airline = self.commonConfig.airlines[flight.airlineIndex];      

        return self.flightSuretyApp.methods
            .isSuretyAlreadyBought(flight.description, flight.flightCode, airline.address)
            .call({ from: address}, callback);       
    }

    buySurety(flightIndex, address, value, callback) {
        
        let self = this;    
        let flight = self.commonConfig.flights[flightIndex];      
        let airline = self.commonConfig.airlines[flight.airlineIndex];      
             

        value = self.web3.utils.toWei(value, "ether");       
                       
        return self.flightSuretyApp.methods
            .buySurety(flight.description, flight.flightCode, airline.address)
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
