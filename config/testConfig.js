
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {    

    let owner = accounts[0];
    let firstAirline = accounts[1];

    let airlineNames = [
        "American Airlines",
        "Iberia",
        "Condor",
        "Ryanair",
        "Air Canada",
        "Emirates",
        "Air China"
    ];

    let flightSuretyData = await FlightSuretyData.new();
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address, firstAirline);
    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: accounts,
        airlineNames: airlineNames,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};