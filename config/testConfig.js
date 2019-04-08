
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {    

    let owner = accounts[0];
    let firstAirline = accounts[1];

    let airlineNames = [
        "Lufthansa",
        "American Airlines",
        "Iberia",
        "Ryanair",
        "Air Canada",
        "Condor",               
        "Emirates",
        "Air China"
    ];

    let flights = [
        {
            "description": "Frankfurt - Bangkok",
            "flightCode": "FRA123",
            "airline": accounts[1]
        },
        {
            "description": "New York - Miami",
            "flightCode": "AA783",
            "airline": accounts[2]
        },
        {
            "description": "New York - Sao Paulo",
            "flightCode": "AA933",
            "airline": accounts[2]
        },
        {
            "description": "Madrid - Malaga",
            "flightCode": "MA839",
            "airline": accounts[3]
        },
        {
            "description": "Dublin - London",
            "flightCode": "DU930",
            "airline": accounts[4]
        },        
        {
            "description": "Montreal - Seattle",
            "flightCode": "CA115",
            "airline": accounts[5]
        }
    ];

    let flightSuretyData = await FlightSuretyData.new();
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address, firstAirline);
    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: accounts,
        airlineNames: airlineNames,
        flights: flights,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};