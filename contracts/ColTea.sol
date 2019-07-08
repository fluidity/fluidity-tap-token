
// Between these contracts they inherit IERC20, ERC20 and MinterRole
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./helpers/BokkyPooBahsDateTimeLibrary.sol";

contract ColTea is ERC20Detailed, ERC20Burnable, ERC20Mintable {
    using SafeMath for uint256;

    // Parameters provided in the constructor
    bytes public CUSIP;
    uint256 public totalFaceValue;       // TODO finalize number of decimal places stored - currently 0
    uint256 public issueDate;
    uint8 public payFrequency;
    uint8 public tenor;                  // in days
    uint8 public coupon;
    address public custodianAddress;     // TODO this might have to be a bytes32 for an alphanumeric string
    uint256 public rate;
    uint256 public rateMultiplier;       // rate / rateMultiplier = percentage

    // Values calculated
    uint256 public maturityDate;
    uint256 public currentPriceOfPool;   // TODO finalize number of decimal places stored - currently 0


    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        bytes memory _CUSIP,
        uint256 _totalFaceValue,
        uint256 _issueDate,
        uint8 _payFrequency,
        uint8 _tenor,
        uint8 _coupon,
        address _custodianAddress,
        uint256 _rate,
        uint256 _rateMultiplier
    )
    public
    ERC20Detailed(_name, _symbol, _decimals)
    {
        CUSIP = _CUSIP;
        totalFaceValue = _totalFaceValue;
        issueDate = _issueDate;
        payFrequency = _payFrequency;
        tenor = _tenor;
        coupon = _coupon;
        custodianAddress = _custodianAddress;
        rate = _rate;
        rateMultiplier = _rateMultiplier;

        // Maturity date the issue date plus the tenor
        maturityDate = BokkyPooBahsDateTimeLibrary.addDays(issueDate, tenor);
        updatePriceOfPool();

    }

    // TODO access on this
    function updateRate(uint8 _newRate) external onlyMinter {
        rate = _newRate;
        updatePriceOfPool();
    }

    function updatePriceOfPool() internal {
        // These retain the value 0 if the maturity date has passed
        uint256 daysToMaturity;
        uint256 discount;
        if (now < maturityDate) {
            daysToMaturity = BokkyPooBahsDateTimeLibrary.diffDays(now, maturityDate);
            discount = totalFaceValue.mul(rate.mul(daysToMaturity)) / rateMultiplier.mul(360);
        }
        currentPriceOfPool = totalFaceValue.sub(discount);
    }
    
}
