
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Airlines Tests', async (accounts) => {   

    /****************************************************************************************/
    /* Airline registrations                                                                */
    /****************************************************************************************/
    describe('Airline registrations  ', function () {       

        var config;
        const FUND_PRICE = web3.utils.toWei("10", "ether");

        before('setup contract', async () => {
            config = await Test.Config(accounts);       

            // autorize contractApp to call functions of contractData
            await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address);
            await config.flightSuretyApp.fundAirline({ from: config.airlines[0].address, value: FUND_PRICE });
        });
       
        it("Airlines can't be funded if they are not registered", async () => {
                                    
            await truffleAssert.reverts(
                config.flightSuretyApp.fundAirline({ from: config.airlines[1].address, value: FUND_PRICE }), 
                "revert " + "The airline was not registered!"
            );
        });

        it('Airlines registration (no multiparty)', async () => {
            
            let existAirline = null;
            let airline = null;

            // first airline was automatically registered when deploying the contract
            existAirline = await config.flightSuretyApp.isAirline.call(config.airlines[0].address);
            assert.equal(existAirline, true, "The first arline should be registered automatically.");

            // first airline is funded, it should success registering airlines           
            // register up to 4 airlines                                
            for (let i = 2; i <= 4; i ++) {               

                await config.flightSuretyApp.registerAirline(config.airlines[i].address, config.airlines[i].name, { from: config.airlines[0].address });
                existAirline = await config.flightSuretyApp.isAirline.call(config.airlines[i].address);
                assert.equal(existAirline, true, "The registered airline doesn't exist.");                     
            } 

            // fund up to 4 airlines with (no multiparty is needed)                                          
            for (let i = 2; i <= 4; i ++) {      

                await config.flightSuretyApp.fundAirline({ from: config.airlines[i].address, value: FUND_PRICE });
                airline = await config.flightSuretyApp.getAirline(config.airlines[i].address);
                assert.equal(airline.isFunded, true, "Airline was not properly funded!");                
            }             
        });


        it("Airlines can't register if they are not funded", async () => {
            
            // 5th airline is NOT funded, it shouldn't success registering an airline            
            await truffleAssert.reverts(
                config.flightSuretyApp.registerAirline(config.airlines[6].address, config.airlines[6].name, { from: config.airlines[5].address }), 
                "revert " + "The airline is not funded!"
            );
        });

        it("Airlines can't be more than once registered", async () => {
                        
            // try to fund twice an airline
            await truffleAssert.reverts(
                config.flightSuretyApp.fundAirline({ from: config.airlines[0].address, value: FUND_PRICE }), 
                "revert " + "The airline was already funded!"
            );
        });

        it("Airlines can't register if they don't provide enough fund", async () => {            

            // try to fund an airline with no enough ether
            let notEnoughEther = web3.utils.toWei("2", "ether");

            // A fund requires enough ether.
            await truffleAssert.reverts(
                config.flightSuretyApp.fundAirline({ from: config.airlines[6].address, value: notEnoughEther }), 
                "revert " + "Ether sent is not enough to fund an airline!"
            );
        });               
       
        it("Multiparty registration", async () => {

            // at this point we have 4 airlines registered and funded, 
            // we need 2 votes in order to register a new airline

            // register 5th airline (first attempt)
            await config.flightSuretyApp.registerAirline(config.airlines[5].address, config.airlines[5].address, { from: config.airlines[2].address });
            existAirline = await config.flightSuretyApp.isAirline.call(config.airlines[5].address);
            assert.equal(existAirline, false, "Only 1 vote is not enough!");          

            // at this point the airline can't be funded                
            await truffleAssert.reverts(
                config.flightSuretyApp.fundAirline({ from: config.airlines[5].address, value: FUND_PRICE }), 
                "revert " + "The airline was not registered!"
            );        
              
            // register 5th airline (second attempt using the same registrator). Has to fail.
            await truffleAssert.reverts(
                config.flightSuretyApp.registerAirline(config.airlines[5].address, config.airlines[5].name, { from: config.airlines[2].address }), 
                "revert " + "Caller has already called this function."
            );          

            // register 5th airline (third attempt using different registrator). Has to sucess.
            await config.flightSuretyApp.registerAirline(config.airlines[5].address, config.airlines[5].address, { from: config.airlines[3].address });
            existAirline = await config.flightSuretyApp.isAirline.call(config.airlines[5].address);
            assert.equal(existAirline, true, "With 2 votes should have been registered!.");              
        });
        
    })

});