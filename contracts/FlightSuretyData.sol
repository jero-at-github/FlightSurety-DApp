pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {    

    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner;                              // Account used to deploy contract
    mapping(address => uint256) private authorizedContracts;    // External contracts authorized to call functions of data contract
    bool private operational = true;                            // Blocks all state changes throughout the contract if false    
    uint8 private IART = 4;                                     // (I)nitial (A)riline (R)egistration (T)hreshold
    uint256 private  numRegAirlines = 0;                        // Number of registered airlines
    uint256 private  numFundedAirlines = 0;                     // Number of funded airlines
    uint private FUND_PRICE = 10 ether;
    uint private MAX_BUY_PRICE = 1 ether;    

    mapping(address => address[]) private registrationVotes;    // mapping to store the multiparty airline registration votes    
    mapping(bytes32 => Surety[]) private sureties;              // mapping to store the relation flight-passengers

    struct Surety {
        address passenger;
        uint pricePaid;
    }

    struct Airline {
        string name;
        bool isCreated;
        bool isRegistered;
        bool isFunded;        
    }

    mapping(address => Airline) airlines;                                // Mapping for storing airlines

    struct Flight {       
        string description;
        string flightCode;
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }

    mapping(bytes32 => Flight) public flights;    

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public 
    {
        contractOwner = msg.sender;        
    }

// region function modifiers

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsCallerAuthorized
    {
        require(authorizedContracts[msg.sender] == 1, "Caller is not contract owner");
        _;
    }

    modifier requireIsSenderFundedAirline(address sender)
    {
        require(airlines[sender].isFunded == true, "The airline is not funded!");
        _;
    }    

    modifier requireIsAirlineNotRegistered(address airlineAddress)
    {
        require(airlines[airlineAddress].isCreated == false, "The airline is already registered!");
        _;
    }    

    modifier requireIsAirlineNotFunded(address airlineAddress)
    {
        require(airlines[airlineAddress].isFunded == false, "The airline was already funded!");
        _;
    }    
     
    modifier paidEnough(uint value) { 
        require(value >= FUND_PRICE, "Ether sent is not enough to fund an airline!"); 
        _;
    }

    modifier checkFundValue(address sender, uint value) {
        _;
        uint amountToReturn = value - FUND_PRICE;
        sender.transfer(amountToReturn);
    }

    modifier checkBuyValue(address sender, uint value) {
        // check that more than 0 Ether was sent
        require(value > 0, "Ether sent is not enough to buy a surety!"); 
        _;
        // return if the passenger paid more than the maximum buy price
        if (value > MAX_BUY_PRICE) {
            uint amountToReturn = value - MAX_BUY_PRICE;
            sender.transfer(amountToReturn);
        }        
    }
    /*
    modifier requireIsSuretyNotBought(bytes32 flightKey, address sender) {
        
        bool status = isSuretyAlreadyBought(flightKey, sender);
        require(status == false, "This passenger bought already a surety for this flight!");
        _;
    }
    */

// endregion

// region utility region

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            requireContractOwner
                            returns(bool) 
    {        
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner                            
    {
        require(mode != operational, "New mode must be different from existing mode");   
        operational = mode;                  
    }    

    function setTestingMode(bool value) public view 
                requireContractOwner requireIsOperational
                returns(bool) {
                    
        return value;
    }

    function authorizeContract
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        authorizedContracts[contractAddress] = 1;
    }

    function deauthorizeContract
                            (
                                address contractAddress
                            )
                            external
                            requireContractOwner
    {
        delete authorizedContracts[contractAddress];
    }

// endregion

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function isSuretyAlreadyBought(string description, string flightCode, address airline, address sender) public view returns (bool)
    {                
        bool result = false;

        // generate key     
        bytes32 flightKey = keccak256(abi.encodePacked(airline, flightCode, description));

        Surety[] memory _sureties = sureties[flightKey];
        
        for (uint i=0; i < _sureties.length; i++) {
            
            if (_sureties[i].passenger == sender) {
                result = true;
                break;
            }
        }        

        return result;     
    }

   /**
    * Get the number of registered airlines.
    */
    function getNumRegAirlines() external view
                requireIsCallerAuthorized
                returns(uint256)
    {
        return numRegAirlines;
    }

   /**
    * First airline registration hapenning when the contract is deployed.
    */
    function fundAirline(address sender, uint value) external payable
                requireIsCallerAuthorized
                requireIsAirlineNotFunded(sender) 
                paidEnough(value)        
                checkFundValue(sender, value) {

        // set the airline as funded
        airlines[sender].isFunded = true; 
        numFundedAirlines ++;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address airlineAddress, string name, address sender) external 
                requireIsCallerAuthorized        
                requireIsAirlineNotRegistered(airlineAddress)
                requireIsSenderFundedAirline(sender)                       
                returns(bool success, uint256 votes)
    {            
        // check if we are in the initial airlines registration threshold
        if (numFundedAirlines < IART) {

            // register the airline
            airlines[airlineAddress] = 
                Airline({
                    name: name, 
                    isCreated: true,
                    isRegistered: true,
                    isFunded: false                                               
                });

            votes = 0;
            success = true;    
        }
        // Multipary case
        else {
                    
            //address[] memory currentVotes = registrationVotes[airlineAddress];            

            bool isDuplicate = false;
            for(uint c=0; c < registrationVotes[airlineAddress].length; c++) {
                if (registrationVotes[airlineAddress][c] == sender) {
                    isDuplicate = true;
                    break;
                }
            }
            require(!isDuplicate, "Caller has already called this function.");

            registrationVotes[airlineAddress].push(sender);            

            if (registrationVotes[airlineAddress].length >= numFundedAirlines / 2) {
                
                // register the airline
                airlines[airlineAddress] = 
                    Airline({
                        name: name,
                        isCreated: true,
                        isRegistered: true,
                        isFunded: false                                               
                    });

                success = true;                     
            }   
            else {
                success = false;
            }        

            votes = registrationVotes[airlineAddress].length;
        }        

        if (success) {
            numRegAirlines ++;
        } 

        return (success, votes);
    }

   /**
    * First airline registration hapenning when the contract is deployed.
    */
    function firstAirlineRegistration(address firstAirlineAddress, string firstAirlineName) external {

        // register the airline
        airlines[firstAirlineAddress] = 
            Airline({
                name: firstAirlineName,
                isCreated: true,
                isRegistered: true,
                isFunded: true
            });

        numRegAirlines ++;            
        numFundedAirlines ++;
    }

   /**
    * Checks if a certain airline exists.
    */
    function isAirline(address airlineAddress) public view 
                requireIsCallerAuthorized                
                returns(bool) {       
        
        return airlines[airlineAddress].isCreated;
    }

    /**
    * Gets and airline.
    */
    function getAirline(address airlineAddress) public view 
                requireIsCallerAuthorized                
                returns(string name, bool isCreated, bool isRegistered, bool isFunded) 
    {       
        
        return (
            airlines[airlineAddress].name,
            airlines[airlineAddress].isCreated,
            airlines[airlineAddress].isRegistered,
            airlines[airlineAddress].isFunded
        );
    }

    /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight(          
        string description,
        string flightCode,
        uint256 updatedTimestamp,
        address airline) external
                                
    {   
        // generate key     
        bytes32 key = keccak256(abi.encodePacked(airline, flightCode, description));

        // register flight
        flights[key] = Flight({
                        description: description,
                        flightCode: flightCode,
                        isRegistered: true,
                        statusCode: STATUS_CODE_UNKNOWN,
                        updatedTimestamp: updatedTimestamp,
                        airline: airline});             
    }

    /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus
                                (
                                    address airline,
                                    string memory flight,
                                    uint256 timestamp,
                                    uint8 statusCode
                                )
                                internal
                                pure
    {
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
                        (
                            address airline,
                            string flight,
                            uint256 timestamp                            
                        )
                        external
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });

        emit OracleRequest(index, airline, flight, timestamp);
    } 


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes
                            (
                            )
                            view
                            external
                            returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
                        (
                            uint8 index,
                            address airline,
                            string flight,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }
  
    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal
                            returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buySurety(string description, string flightCode, address airline, address sender, uint value)
        requireIsCallerAuthorized
        //requireIsSuretyNotBought(flightKey, sender) 
        //checkBuyValue(sender, value)
        external
        payable
    {
       
        bytes32 flightKey = keccak256(abi.encodePacked(airline, flightCode, description));

        Surety memory surety = Surety({
            passenger: sender,
            pricePaid: value
        });

        sureties[flightKey].push(surety); 
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

