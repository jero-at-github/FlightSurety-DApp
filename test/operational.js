
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Operationals Tests', async (accounts) => {   

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

});

