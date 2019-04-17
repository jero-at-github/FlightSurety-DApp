let Contract = require("./contract.js");
require("./flightsurety.css");

(async() => {
    
    let contract = new Contract('localhost', () => {

        let result = null;
        let selectedPassanger = null;
        let flightIndex = "";
        let flightIndex2 = "";
        let vueShowBuy;          
        let flightResponseLoading = false;      

        Vue.filter('toStatusDescription', function(statusCode) {
            
            statusCode = parseInt(statusCode);

            if (statusCode != null) {
            
                let result = null;
                                
                switch (statusCode) {
                    case -1:
                        result = "Loading...";
                        break;
                    case 0:
                        result = "Unknown";
                        break;
                    case 10:
                        result = "On time";    
                        break;
                    case 20:
                        result = "Late airline";                            
                        break;
                    case 30:
                        result = "Late weather";                            
                        break;
                    case 40:
                        result = "Late technical";                            
                        break;
                    case 50:
                        result = "Late other";                            
                        break;
                }                                               

                if (result != null) {
                    return result.toLocaleUpperCase();
                }                
            }
        });

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

        let vueFlightsList2 = new Vue({
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
                
                showBalance(); 
                showBuyButton();                
                showContractBalance();                
            });            
        }       

        function fetchFlightStatus(event) {

            if (!flightResponseLoading) {

                flightIndex2 = event.currentTarget.dataset.index;            
                vueFlightsList2.airlines_flights.flights[flightIndex2].statusCode = -1;

                setTimeout( () => {
                    
                    if (flightResponseLoading) {
                        let currentStatusCode = vueFlightsList2.airlines_flights.flights[flightIndex2].statusCode;

                        if (currentStatusCode == -1) {
                            vueFlightsList2.airlines_flights.flights[flightIndex2].statusCode = 0;       
                        }                

                        flightResponseLoading = false;
                    }
                }, 20000);
                
                flightResponseLoading = true;
                contract.fetchFlightStatus(flightIndex2);                
            }
        }

        async function registerAirlines() {
            
            await contract.registerAirlines(()=> {                    
                                              
                setTimeout( () => {
                    showContractBalance();
                    showRegisteredAirlines();

                }, 2000);                           
            });    
        }

        function getFunds() {

            let amount = document.querySelector("#funds").textContent;
            contract.getFunds(amount, selectedPassanger, () => {
                showFunds();
                showBalance();                
            });
                        
        }
        
        function initListeners() {

             // init listeners
            document.querySelector("#passengersList").addEventListener("change", () => {    
                
                selectedPassanger = document.querySelector("#passengersList").value;       
                
                showBalance(); 
                showBuyButton();
                showFunds();                                
            });
            selectedPassanger = document.querySelector("#passengersList").value;      

            document.querySelector("#flightsList").addEventListener("change", () => {   

                flightIndex = document.querySelector("#flightsList").value;                                
                showBuyButton();
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
            
            document.querySelector("#btnFunds").addEventListener("click", async () => {      
                getFunds();
            });                
        }                                   

        initListeners(); 
        refreshInfo();

        contract.FlightStatusInfoHandler = (statusCode) => {
            
            if (flightResponseLoading) {
                vueFlightsList2.airlines_flights.flights[flightIndex2].statusCode = statusCode;            
                showFunds();
                flightResponseLoading = false;
            }            
        }

        function toStatusDescription(statusCode) {
            return "Alex";
        }
    });            

})();






