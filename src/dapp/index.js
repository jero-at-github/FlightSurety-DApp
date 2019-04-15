let Contract = require("./contract.js");
require("./flightsurety.css");

(async() => {
    


    let contract = new Contract('localhost', () => {

        let result = null;
        let selectedPassanger = null;
        let flightIndex = null;
        let vueShowBuy;        

        vueShowBuy = new Vue({
            el: '#showBuyButton',
            data: {
                alreadyBought: false 
            }
        });

        new Vue({
            el: '#passengersList',
            data: {
                passengers: contract.commonConfig.passengers
            }
        })

        new Vue({
            el: '#flightsList',
            data: {
                airlines_flights: {
                    airlines: contract.commonConfig.airlines,
                    flights: contract.commonConfig.flights
                }
            }
        })

        new Vue({
            el: '#flightsList2',
            data: {
                airlines_flights: {
                    airlines: contract.commonConfig.airlines,
                    flights: contract.commonConfig.flights
                }
            }
        })

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            document.querySelector("#operationalStatus").textContent = result;            
        });            

        // User-submitted transaction
        /*
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
        */

        function refreshInfo() {

            showBalance(); 
            showBuyButton();
            showFunds();
            showContractBalance();
        }

        function showContractBalance() {

            contract.getBalance(contract.contractAddress, (response) => {                
                document.querySelector("#contractBalance").textContent = response;
            });
        }

        function showBalance() {
                                    
            contract.getBalance(selectedPassanger, (response) => {                
                document.querySelector("#balance").textContent = response;
            });
        }

        function showFunds() {
                                    
            contract.getPassengerFunds(selectedPassanger, (response) => {                
                document.querySelector("#funds").textContent = response;
            });
        }

        function showBuyButton(flight) {
                       
            contract.isSuretyAlreadyBought(flightIndex, selectedPassanger, (error, result) => {                                
                vueShowBuy.alreadyBought = result;
            });                    
        }
      
        function buySurety() {

            let value =  document.querySelector("#suretyValue").value;
            value = value.replace(",", ".");
            
            contract.buySurety(flightIndex, selectedPassanger, value, () => {
                refreshInfo();
            });            
        }       

        function initListeners() {

             // init listeners
            document.querySelector("#passengersList").addEventListener("change", () => {    
                
                selectedPassanger = document.querySelector("#passengersList").value;       
                refreshInfo();
            });
            selectedPassanger = document.querySelector("#passengersList").value;      

            document.querySelector("#flightsList").addEventListener("change", () => {   

                flightIndex = document.querySelector("#flightsList").value;
                refreshInfo();
            });
            flightIndex = document.querySelector("#flightsList").value;

            document.querySelector("#btnBuySurety").addEventListener("click", () => {      

                buySurety();
            });

            refreshInfo();
        }
                   
        contract.registerAirlines(()=> {                    
            document.querySelector("#numRegisteredAirlines").textContent = "4";                  
            setTimeout( () => {
                showContractBalance();
            }, 2000);            
        });

        initListeners(); 
    });            

})();






