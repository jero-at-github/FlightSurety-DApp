pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {

    bool private operational = true;            
    FlightSuretyData flightSuretyData;

    uint private FUND_PRICE = 10 ether;   
    uint private MAX_BUY_PRICE = 1 ether;  

    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)    

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;          // Account used to deploy contract    

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
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");  
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

// endregion

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor(address dataContract, address firstAirlineAddress, string firstAirlineName) public 
    {
        contractOwner = msg.sender; // set contract owner
        
        flightSuretyData = FlightSuretyData(dataContract);                                      // instance the data contract             
        flightSuretyData.firstAirlineRegistration(firstAirlineAddress, firstAirlineName);       // first airline registration
    }

// region utility functions

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

// endregion   

// region function modifiers

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    modifier paidEnough(uint value) { 
        require(value >= FUND_PRICE, "Ether sent is not enough to fund an airline!"); 
        _;
    }

     modifier checkFundValue(address sender, uint value) {
        _;
        uint amountToReturn = value.sub(FUND_PRICE);
        sender.transfer(amountToReturn);
    }

    modifier checkBuyValue(address sender, uint value) {
        // check that more than 0 Ether was sent
        require(value > 0, "Ether sent is not enough to buy a surety!"); 
        _;
        // return if the passenger paid more than the maximum buy price
        if (value > MAX_BUY_PRICE) {
            uint amountToReturn = value.sub(MAX_BUY_PRICE);
            sender.transfer(amountToReturn);
        }        
    }

// endregion

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/
   
   /**
    * Get the number of registered airlines.
    */
    function getNumRegAirlines() external view   
                returns(uint256)
    {
        return flightSuretyData.getNumRegAirlines();
    }
  
   /**
    * First airline registration hapenning when the contract is deployed.
    */
    function fundAirline() 
        paidEnough(msg.value)  
        checkFundValue(msg.sender, msg.value)      
        external payable               
    {
       flightSuretyData.fundAirline(msg.sender, msg.value);
    }

   /**
    * @dev Add an airline to the registration queue
    *
    */   
    function registerAirline(address airlineAddress, string name) public
                returns(bool success, uint256 votes)
    {
        return flightSuretyData.registerAirline(airlineAddress, name, msg.sender);        
    }

   /**
    * Checks if a certain airline exists.
    */
    function isAirline(address airlineAddress) public view returns(bool) {       
        
        return flightSuretyData.isAirline(airlineAddress);
    }

     /**
    * Gets and airline.
    */
    function getAirline(address airlineAddress) public view                     
                returns(string name, bool isCreated, bool isRegistered, bool isFunded) 
    {       
        return flightSuretyData.getAirline(airlineAddress);        
    }    

    function getFlightKey (
                address airline,
                string flight,
                uint256 timestamp)
            pure
            internal
            returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
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
        return flightSuretyData.registerFlight(
            description,
            flightCode,
            updatedTimestamp,
            airline);         
    }

    /**
    * @dev Buy insurance for a flight
    *
    */   
    function buySurety(string description, string flightCode, address airline)     
        checkBuyValue(msg.sender, msg.value)
        external
        payable
    {
        flightSuretyData.buySurety(description, flightCode, airline, msg.sender, msg.value);            
    }

    function isSuretyAlreadyBought(string description, string flightCode, address airline) public view returns (bool)
    {               
        return flightSuretyData.isSuretyAlreadyBought(description, flightCode, airline, msg.sender);
    }

    function getPassengerSaldo() public view returns (uint) {
        return flightSuretyData.getPassengerSaldo(msg.sender);
    }

// endregion

}   

contract FlightSuretyData {

    function registerAirline(address airlineAddress, string name, address sender) external returns(bool success, uint256 votes);
    function firstAirlineRegistration(address firstAirlineAddress, string firstAirlineName) external;
    function isAirline(address airlineAddress) public view returns(bool);
    function fundAirline(address sender, uint value) external payable;
    function getAirline(address airlineAddress) public view returns(string name, bool isCreated, bool isRegistered, bool isFunded);                                
    function getNumRegAirlines() external view returns(uint256);
    function registerFlight(string description, string flightCode, uint256 updatedTimestamp, address airline) external;
    function buySurety(string description, string flightCode, address airline, address sender, uint value) external payable;
    function isSuretyAlreadyBought(string description, string flightCode, address airline, address sender) public view returns (bool);
    function getPassengerSaldo(address passenger) public view returns (uint);
}