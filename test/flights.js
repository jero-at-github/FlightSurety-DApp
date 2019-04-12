
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Flights Tests', async (accounts) => {   

    /****************************************************************************************/
    /* Airline registrations                                                                */
    /****************************************************************************************/
    describe('Flights registrations  ', function () {       

        var config;
        const INSURANCE_PRICE = web3.utils.toWei("1", "ether");

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
/*
                let key = getKey(...)
                let flight = await config.flightSuretyApp.getFlight(key);
                console.log(flights);
*/                
            }                                        
        });       
        
    })

});