const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer, network, accounts) {

    var commonConfig = require("../common-config.js")(accounts);   

    deployer.deploy(FlightSuretyData)
    .then(() => {
        return deployer.deploy(FlightSuretyApp, FlightSuretyData.address, commonConfig.airlines[0].address, commonConfig.airlines[0].name)
                .then(async () => {

                    let contractData = await FlightSuretyData.deployed();
                    contractData.authorizeContract(FlightSuretyApp.address);

                    let contractApp = await FlightSuretyApp.deployed();   
                    const FUND_PRICE = web3.utils.toWei("10", "ether");
                    contractApp.fundAirline({from: commonConfig.airlines[0].address, value: FUND_PRICE});

                    let config = {
                        "localhost": {
                            url: 'http://localhost:7545',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address
                        },
                        "commonConfig": commonConfig
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
    });
}