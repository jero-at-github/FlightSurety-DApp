
// This function allows to expose the accounts associated to the correspdonding entities.
// It is used in the deploy script, the DApp UI and the tests.
function load(accounts) {

    let configuration = {

        "owner": null,    
        "airlines": [
            {
                "name": "Lufthansa",
                "address": null
            },
            {
                "name": "American Airlines",
                "address": null
            },
            {
                "name": "Iberia",
                "address": null
            },
            {
                "name": "Ryanair",
                "address": null
            },
            {
                "name": "Air Canada",
                "address": null
            },
            {
                "name": "Condor",
                "address": null
            },
            {
                "name": "Emirates",
                "address": null
            },
        ],    
        "flights": [
            {
                "description": "Frankfurt-Bangkok",
                "flightCode": "FRA123",
                "airlineIndex": null 
            },
            {
                "description": "New York-Miami",
                "flightCode": "AA783",
                "airlineIndex": null
            },
            {
                "description": "New York-Sao Paulo",
                "flightCode": "AA933",
                "airlineIndex": null
            },
            {
                "description": "Madrid-Malaga",
                "flightCode": "MA839",
                "airlineIndex": null
            },
            {
                "description": "Valencia-Buenos Aires",
                "flightCode": "DU930",
                "airlineIndex": null
            },        
            {
                "description": "Dublin-London",
                "flightCode": "CA115",
                "airlineIndex": null
            }
        ],
        "passengers": []
    }

    let result = configuration;

    // Set owner address
    result.owner = accounts[0];

    // Set airlines addresses
    for (let counter = 1; counter <=7; counter ++) {
        result.airlines[counter - 1].address = accounts[counter];        
    }

    // Associate flights with airlines
    result.flights[0].airlineIndex = 0; // Lufthansa
    result.flights[1].airlineIndex = 1; // American Airlines
    result.flights[2].airlineIndex = 1; // American Airlines
    result.flights[3].airlineIndex = 2; // Iberia
    result.flights[4].airlineIndex = 2; // Iberia
    result.flights[5].airlineIndex = 3; // Ryanair

    // Set passengers addresses
    for (let counter = 8; counter <=12; counter ++) {
        result.passengers.push(accounts[counter]);        
    }    

    return result;
}

module.exports = load;
