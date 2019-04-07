
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {   

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/
    describe('Operations and settings', function () {

        var config;       

        before('setup contract', async () => {
            config = await Test.Config(accounts);       

            // autorize contractApp to call functions of contractData
            await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address);
        });

        it(`has correct initial isOperational() value`, async function () {

            // Get operating status
            let status = await config.flightSuretyApp.isOperational.call({ from: config.owner });
            assert.equal(status, true, "Incorrect initial operating status value in App contract");

            status = await config.flightSuretyData.isOperational.call({ from: config.owner });
            assert.equal(status, true, "Incorrect initial operating status value in Data contract");
        });

        it(`can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

            // Ensure that access is denied for non-Contract Owner account
            let accessDenied = false;

            try {
                await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
            }
            catch (e) {
                accessDenied = true;
            }
            assert.equal(accessDenied, true, "Access not restricted to Contract Owner in Data contract");

        });

        it(`can allow access to setOperatingStatus() for Contract Owner account`, async function () {

            // Ensure that access is allowed for Contract Owner account
            let accessDenied = false;

            try {
                await config.flightSuretyData.setOperatingStatus(false, { from: config.owner });
                await config.flightSuretyData.setOperatingStatus(true, { from: config.owner });
            }
            catch (e) {
                accessDenied = true;
            }
            assert.equal(accessDenied, false, "Access not restricted to Contract Owner in Data contract");

        });

        it(`can block access to functions using requireIsOperational when operating status is false`, async function () {

            await config.flightSuretyData.setOperatingStatus(false, { from: config.owner });

            let reverted = false;
            try {
                await config.flightSuretyData.setTestingMode(true, { from: config.owner });
            }
            catch (e) {
                reverted = true;
            }
            assert.equal(reverted, true, "Access not blocked for requireIsOperational");

            // Set it back for other tests to work
            await config.flightSuretyData.setOperatingStatus(true, { from: config.owner });

        });

    })

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

            // first airline was automatically registered when deploying the contract
            existAirline = await config.flightSuretyApp.isAirline.call(config.firstAirline);
            assert.equal(existAirline, true, "The first arline should be registered automatically.");

            // first airline is funded, it should success registering an airline
            await config.flightSuretyApp.registerAirline(config.testAddresses[2], { from: config.firstAirline });
            existAirline = await config.flightSuretyApp.isAirline.call(config.testAddresses[2]);
            assert.equal(existAirline, true, "The registered airline doesn't exist.");

            // second airline is NOT funded, it shouldn't success registering an airline
            let success = true;
            try {
                await config.flightSuretyApp.registerAirline(config.testAddresses[3], { from: config.testAddresses[2] });
            }
            catch (error) {
                success = false;
            }
            assert.equal(success, false, "A registration action from a non funded airline should fail.");

            existAirline = await config.flightSuretyApp.isAirline.call(config.testAddresses[3]);
            assert.equal(existAirline, false, "The registered airline shouldn't exist.");

            // register airlines till the threshold (4)

            // third airline
            await config.flightSuretyApp.registerAirline(config.testAddresses[3], { from: config.firstAirline });
            existAirline = await config.flightSuretyApp.isAirline.call(config.testAddresses[3]);
            assert.equal(existAirline, true, "The registered airline doesn't exist.");

            // fourth airline
            await config.flightSuretyApp.registerAirline(config.testAddresses[4], { from: config.firstAirline });
            existAirline = await config.flightSuretyApp.isAirline.call(config.testAddresses[4]);
            assert.equal(existAirline, true, "The registered airline doesn't exist.");
        });

        it('Airlines can submit funding', async () => {
            
            let success = null;

            // try to fund an airline again                       
            try {
                await config.flightSuretyApp.fundAirline({ from: config.firstAirline, value: FUND_PRICE });
                success = true;
            }
            catch (error) {                
                success = false;
            }       
            assert.equal(success, false, "An airline can't be funded more than once.");    

            // try to fund an airline with no enough ether
            let notEnoughEther = web3.utils.toWei("2", "ether");
            
            success = null;
            try {
                await config.flightSuretyApp.fundAirline({ from: config.testAddresses[2], value: notEnoughEther });
                success = true;
            }
            catch (error) {                
                success = false;
            }       
            assert.equal(success, false, "A fund requires enough ether.");                

            // register and fund up to 4 airlines                    
            for (let i = 2; i <= 4; i ++) {               
                await config.flightSuretyApp.fundAirline({ from: config.testAddresses[i], value: FUND_PRICE });
            }             
        });

        it('Airlines registration (with multiparty)', async () => {

            
        });

    })

});
