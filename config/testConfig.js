
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {    
    
    var commonConfig = require("../common-config.js")(accounts);    

    // contractData
    let flightSuretyData = await FlightSuretyData.new();

    // contractApp
    let flightSuretyApp = await FlightSuretyApp.new(
        flightSuretyData.address, 
        commonConfig.airlines[0].address, 
        commonConfig.airlines[0].name); 

    return {
        owner: commonConfig.owner,        
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: accounts,
        airlines: commonConfig.airlines,
        flights: commonConfig.flights,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};