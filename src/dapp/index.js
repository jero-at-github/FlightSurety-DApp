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

        function refreshInfo() {

            showBalance(); 
            showBuyButton();
            showFunds();
            showContractBalance();
            showRegisteredAirlines();
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

        function showRegisteredAirlines(flight) {
             
            contract.getNumRegAirlines((response) => {                
                document.querySelector("#numRegisteredAirlines").textContent = response;
            });                 
        }      

        function buySurety() {

            let value =  document.querySelector("#suretyValue").value;
            value = value.replace(",", ".");
            
            contract.buySurety(flightIndex, selectedPassanger, value, () => {
                refreshInfo();
            });            
        }       

        function fetchFlightStatus(event) {

            let flightIndex = event.currentTarget.dataset.index;
            contract.fetchFlightStatus(flightIndex);
        }

        async function registerAirlines() {
            
            await contract.registerAirlines(()=> {                    
                                              
                setTimeout( () => {
                    showContractBalance();
                    showRegisteredAirlines();

                }, 2000);                           
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

            document.querySelector("#btnRegisterAirlines").addEventListener("click", async () => {      
                await registerAirlines();
            });            

            let btnsFetchFlightStatus = document.querySelectorAll(".btnFetchFlightStatus");
            btnsFetchFlightStatus.forEach( (element, index) => {   
                element.addEventListener("click", async (event) => {                
                    fetchFlightStatus(event);
                });            
            });            

            refreshInfo();
        }                           

        initListeners(); 

        contract.FlightStatusInfoHandler = (statusCode) => {
            showFunds();

        }
    });            

})();






