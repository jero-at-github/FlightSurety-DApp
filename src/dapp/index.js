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
                flights: contract.commonConfig.flights
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

        function showBalance() {
                                    
            contract.getBalance(selectedPassanger, (response) => {                
                document.querySelector("#balance").textContent = response;
            });
        }

        function showBuyButton(flight) {
                       
            contract.isSuretyAlreadyBought(flightIndex, selectedPassanger, (error, result) => {                
                console.log(result);
                vueShowBuy.alreadyBought = result;
            });                    
        }

        /*
        function buySurety() {

            let value =  document.querySelector("#suretyValue").value;
            value = value.replace(",", ".");
            
            contract.buySurety(flightIndex, selectedPassanger, value);
        }
        */

        // init listeners
        document.querySelector("#passengersList").addEventListener("change", () => {    
            
            selectedPassanger = document.querySelector("#passengersList").value;       
            showBalance();
        });
        selectedPassanger = document.querySelector("#passengersList").value;      

        document.querySelector("#flightsList").addEventListener("change", () => {   

            flightIndex = document.querySelector("#flightsList").value;
            showBuyButton();
        });
        flightIndex = document.querySelector("#flightsList").value;

        document.querySelector("#btnBuySurety").addEventListener("click", () => {      

            //buySurety();
        });

        showBalance(); 
        showBuyButton();
    });            

})();






