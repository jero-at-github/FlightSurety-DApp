
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
        });

        it('Airlines registration (no multiparty)', async () => {
            
            let existAirline = null;
            let airline = null;

            // first airline was automatically registered when deploying the contract
            existAirline = await config.flightSuretyApp.isAirline.call(config.firstAirline);
            assert.equal(existAirline, true, "The first arline should be registered automatically.");

            // first airline is funded, it should success registering airlines           
            // register up to 4 airlines                                
            for (let i = 2; i <= 4; i ++) {               

                await config.flightSuretyApp.registerAirline(config.testAddresses[i], { from: config.firstAirline });
                existAirline = await config.flightSuretyApp.isAirline.call(config.testAddresses[i]);
                assert.equal(existAirline, true, "The registered airline doesn't exist.");                     
            } 

            // fund up to 4 airlines                                
            for (let i = 2; i <= 4; i ++) {      

                await config.flightSuretyApp.fundAirline({ from: config.testAddresses[i], value: FUND_PRICE });
                airline = await config.flightSuretyApp.getAirline(config.testAddresses[i]);
                assert.equal(airline.isFunded, true, "Airline was not properly funded!");                
            }             

            // register 5th airline
            await config.flightSuretyApp.registerAirline(config.testAddresses[5], { from: config.firstAirline });
            existAirline = await config.flightSuretyApp.isAirline.call(config.testAddresses[5]);
            assert.equal(existAirline, false, "Beyond the 4th airline the registration has to use multyparty.");          
        });

        it("Airlines can't register if they are not funded", async () => {
            
            // 5th airline is NOT funded, it shouldn't success registering an airline            
            await truffleAssert.reverts(
                config.flightSuretyApp.registerAirline(config.testAddresses[6], { from: config.testAddresses[5] }), 
                "revert " + "The airline is not funded!"
            );
        });

        it("Airlines can't be more than once registered", async () => {
                        
            // try to fund twice an airline
            await truffleAssert.reverts(
                config.flightSuretyApp.fundAirline({ from: config.firstAirline, value: FUND_PRICE }), 
                "revert " + "The airline was already funded!"
            );
        });

        it("Airlines can't register if they don't provide enough fund", async () => {            

            // try to fund an airline with no enough ether
            let notEnoughEther = web3.utils.toWei("2", "ether");

            // A fund requires enough ether.
            await truffleAssert.reverts(
                config.flightSuretyApp.fundAirline({ from: config.testAddresses[6], value: notEnoughEther }), 
                "revert " + "Ether sent is not enough to fund an airline!"
            );
        });

        it("test", async () => {            

            // try to fund an airline with no enough ether
            let notEnoughEther = web3.utils.toWei("2", "ether");
            
            success = true;
            try {
                await config.flightSuretyApp.fundAirline({ from: config.testAddresses[7], value: notEnoughEther });
                success = false;
                //assert.equal(success, false, "A fund requires enough ether.");                
                return;
            }
            catch (error) {                
                success = false;
            }                   
        });

        it("a", async () => {
            // register 5th airline
            await config.flightSuretyApp.registerAirline(config.testAddresses[5], { from: config.testAddresses[2] });
            existAirline = await config.flightSuretyApp.isAirline.call(config.testAddresses[5]);
            assert.equal(existAirline, true, "Beyond the 4th airline the registration has to use multyparty.");   
        });
    })

});