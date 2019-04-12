pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {    
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                              // Account used to deploy contract
    mapping(address => uint256) private authorizedContracts;    // External contracts authorized to call functions of data contract
    bool private operational = true;                            // Blocks all state changes throughout the contract if false    
    uint8 private IART = 4;                                     // (I)nitial (A)riline (R)egistration (T)hreshold
    uint256 private  numRegAirlines = 0;                        // Number of registered airlines
    uint256 private  numFundedAirlines = 0;                     // Number of funded airlines
    uint private FUND_PRICE = 10 ether;

    mapping(address => address[]) private registrationVotes;    // mapping for store the multiparty airline registration votes    

    struct Airline {
        string name;
        bool isCreated;
        bool isRegistered;
        bool isFunded;        
    }

    mapping(address => Airline) airlines;                                // Mapping for storing airlines

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

    modifier requireIsCallerAuthorized()
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

    modifier checkValue(address sender, uint value) {
        _;
        uint amountToReturn = value - FUND_PRICE;
        sender.transfer(amountToReturn);
    }


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

   /**
    * Get the number of registered airlines.
    */
    function getNumRegAirlines() external view
                requireIsCallerAuthorized()
                returns(uint256)
    {
        return numRegAirlines;
    }

   /**
    * First airline registration hapenning when the contract is deployed.
    */
    function fundAirline(address sender, uint value) external payable
                requireIsCallerAuthorized()
                requireIsAirlineNotFunded(sender) 
                paidEnough(value)        
                checkValue(sender, value) {

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
                requireIsCallerAuthorized()         
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
                requireIsCallerAuthorized()                
                returns(bool) {       
        
        return airlines[airlineAddress].isCreated;
    }

    /**
    * Gets and airline.
    */
    function getAirline(address airlineAddress) public view 
                requireIsCallerAuthorized()                
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
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

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

