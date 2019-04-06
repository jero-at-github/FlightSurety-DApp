
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    
    await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`has correct initial isOperational() value`, async function () {    

    // Get operating status
    let status = await config.flightSuretyApp.isOperational.call({ from: config.owner});    
    assert.equal(status, true, "Incorrect initial operating status value in App contract");
    
    status = await config.flightSuretyData.isOperational.call({ from: config.owner});    
    assert.equal(status, true, "Incorrect initial operating status value in Data contract");
  });

  it(`can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;     

      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner in Data contract");
            
  });

  it(`can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;     

      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.owner});
          await config.flightSuretyData.setOperatingStatus(true, { from: config.owner});
      }
      catch(e) {          
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner in Data contract");
      
  });

  it(`can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false, { from: config.owner});

      let reverted = false;      
      try 
      {            
            await config.flightSuretyData.setTestingMode(true, { from: config.owner});                  
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true, { from: config.owner});

  });

  it.only('Airlines registration', async () => {
    
    let secondAirline = accounts[2];
    let thirdAirline = accounts[3];
    
    let existAirline = null;

    // first airline was automatically registered when deploying the contract
    existAirline = await config.flightSuretyApp.isAirline.call(config.firstAirline); 
    assert.equal(existAirline, true, "The first arline should be registered automatically.");    

    // first airline is funded, it should success registering an airline
    await config.flightSuretyApp.registerAirline(secondAirline, {from: config.firstAirline});        
    existAirline = await config.flightSuretyApp.isAirline.call(secondAirline);  
    assert.equal(existAirline, true, "The registered airline doesn't exist.");   
    
    // second airline is NOT funded, it shouldn't success registering an airline
    let success = true;
    try {
        await config.flightSuretyApp.registerAirline(thirdAirline, {from: config.secondAirline});    
    }
    catch (error) {
        success = false;
    }    
    assert.equal(success, false, "A registration action from a non funded airline should fail.");

    existAirline = await config.flightSuretyApp.isAirline.call(thirdAirline);     
    assert.equal(existAirline, false, "The registered airline shouldn't exist.");       
  });
 

});
