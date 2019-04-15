
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
                       
            let flight = null;
          
            // Register flights            
            for (let i = 0; i < config.flights.length; i ++) {               

                await config.flightSuretyApp.registerFlight(
                    config.flights[i].description,
                    config.flights[i].flightCode,
                    Math.floor(Date.now() / 1000),
                    config.flights[i].airline
                );
            }                                        
        });       

        it('Passengers can buy a surety', async () => {                                  
          
            // a passenger can buy a surety
            await config.flightSuretyApp.buySurety(
                config.flights[0].description,
                config.flights[0].flightCode,                
                config.flights[0].airline, 
                { from: config.passengers[0], value: SURETY_PRICE }
            );
           
            // a passenger can't buy twice the same surety            
            await truffleAssert.reverts(
                config.flightSuretyApp.buySurety(
                    config.flights[0].description,
                    config.flights[0].flightCode,                
                    config.flights[0].airline, 
                    { from: config.passengers[0], value: SURETY_PRICE }
                ), "revert " + "This passenger bought already a surety for this flight!"
            );           
        });       
        
    })

});