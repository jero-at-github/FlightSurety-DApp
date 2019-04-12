
import Contract from './contract';
import './flightsurety.css';

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        new Vue({
            el: '#flightsList',
            data: {
                flights: contract.commonConfig.flights
            }
        })

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            document.querySelector("#operationalStatus").innerHTML = result;            
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
    
    });
    

})();






