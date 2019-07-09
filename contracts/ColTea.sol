pragma solidity 0.5.10;
// Between these contracts they inherit IERC20, ERC20 and MinterRole
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract ColTea is ERC20Detailed, ERC20Burnable, ERC20Mintable {

    // Parameters provided in the constructor
    bytes9 public CUSIP;
    uint256 public totalFaceValue;       // TODO finalize number of decimal places stored - currently 0
    uint256 public maturityDate;
    address public custodianAddress;     // TODO this might have to be a bytes32 for an alphanumeric string
    uint256 public custodianIdentifier; // TODO determine the length to see if uint256 can be smaller

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        bytes9 _CUSIP,
        uint256 _totalFaceValue,
        uint256 _maturityDate,
        address _custodianAddress,
        uint256 _custodianIdentifier
    )
    public
    ERC20Detailed(_name, _symbol, _decimals)
    {
        CUSIP = _CUSIP;
        totalFaceValue = _totalFaceValue;
        maturityDate = _maturityDate;
        custodianAddress = _custodianAddress;
        custodianIdentifier = _custodianIdentifier;
    }
}