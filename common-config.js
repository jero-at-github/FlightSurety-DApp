
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
                "airline": null 
            },
            {
                "description": "New York-Miami",
                "flightCode": "AA783",
                "airline": null
            },
            {
                "description": "New York-Sao Paulo",
                "flightCode": "AA933",
                "airline": null
            },
            {
                "description": "Madrid-Malaga",
                "flightCode": "MA839",
                "airline": null
            },
            {
                "description": "Valencia-Buenos Aires",
                "flightCode": "DU930",
                "airline": null
            },        
            {
                "description": "Dublin-London",
                "flightCode": "CA115",
                "airline": null
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
    result.flights[0].airline = accounts[1]; // Lufthansa
    result.flights[1].airline = accounts[2]; // American Airlines
    result.flights[2].airline = accounts[2]; // American Airlines
    result.flights[3].airline = accounts[3]; // Iberia
    result.flights[4].airline = accounts[3]; // Iberia
    result.flights[5].airline = accounts[4]; // Ryanair

    // Set passengers addresses
    for (let counter = 8; counter <=12; counter ++) {
        result.passengers.push(accounts[counter]);        
    }    

    return result;
}

module.exports = load;
