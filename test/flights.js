
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Flights Tests', async (accounts) => {   

    /****************************************************************************************/
    /* Airline registrations                                                                */
    /****************************************************************************************/
    describe('Flights registrations  ', function () {       

        var config;
        const SURETY_PRICE = web3.utils.toWei("1", "ether");

        before('setup contract', async () => {
            config = await Test.Config(accounts);       

            // autorize contractApp to call functions of contractData
            await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address);
        });

        it('Flights registration', async () => {
                                            
            // Register flights            
            for (let i = 0; i < config.flights.length; i ++) {               

                let flight = config.flights[i];
                let airline = config.airlines[config.flights[i].airlineIndex];

                await config.flightSuretyApp.registerFlight(
                    flight.description,
                    flight.flightCode,
                    Math.floor(Date.now() / 1000),
                    airline.address                    
                );
            }                                        
        });       

        it('Passengers can buy a surety', async () => {                                  
          
            let flight = config.flights[0];
            let airline = config.airlines[config.flights[0].airlineIndex];

            // a passenger can buy a surety
            await config.flightSuretyApp.buySurety(
                flight.description,
                flight.flightCode,                
                airline.address,
                { from: config.passengers[0], value: SURETY_PRICE }
            );
           
            // a passenger can't buy twice the same surety            
            await truffleAssert.reverts(
                config.flightSuretyApp.buySurety(
                    flight.description,
                    flight.flightCode,                
                    airline.address,
                    { from: config.passengers[0], value: SURETY_PRICE }
                ), "revert " + "This passenger bought already a surety for this flight!"
            );           
        });       
        
    })

});