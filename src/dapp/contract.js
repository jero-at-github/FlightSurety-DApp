import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
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