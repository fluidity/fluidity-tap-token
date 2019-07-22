pragma solidity 0.5.10;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";

/**
  * @notice Represents value that will be stored in a MCD
  * @dev inherits IERC20, ERC20 and MinterRole
  * @dev inherits ERC20Detailed, ERC20Burnable, ERC20Mintable
  * @dev deployer is the owner to start
  */
contract ColTea is ERC20Detailed, ERC20Burnable, ERC20Mintable, Ownable, WhitelistedRole {

    // Parameters provided in the constructor
    bytes9 public cusip;
    uint256 public totalFaceValue;
    uint256 public maturityDate;
    address public custodianAddress;
    uint256 public custodianIdentifier;

    /**
    * @notice The constructor for the ColTea.
    * @param _name name of the token (per ERC20Detailed)
    * @param _symbol symbol of the token (per ERC20Detailed)
    * @param _decimals decimals of the token (per ERC20Detailed)
    * @param _cusip standard identifier of Treasury Bills
    * @param _totalFaceValue overal value of TBills in USD
    * @param _maturityDate the date that the TBill is matured
    * @param _custodianAddress The address of the custodian
    * @param _custodianIdentifier The numeric identifier of the custodian
    */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        bytes9 _cusip,
        uint256 _totalFaceValue,
        uint256 _maturityDate,
        address _custodianAddress,
        uint256 _custodianIdentifier
    )
    public
    ERC20Detailed(_name, _symbol, _decimals) {
        cusip = _cusip;
        totalFaceValue = _totalFaceValue;
        maturityDate = _maturityDate;
        custodianAddress = _custodianAddress;
        custodianIdentifier = _custodianIdentifier;
        addWhitelisted(msg.sender); // ensure owner is whitelisted
    }

    /**
     * @dev See `IERC20.transfer`.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(isWhitelisted(recipient), "UNAUTHORIZED_RECIPIENT");
        return super.transfer(recipient, amount);
    }

    /**
     * @dev See `IERC20.transferFrom`.
     *
     * Emits an `Approval` event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of `ERC20`;
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `value`.
     * - the caller must have allowance for `sender`'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(isWhitelisted(recipient), "UNAUTHORIZED_RECIPIENT");
        return super.transferFrom(sender, recipient, amount);
    }

    /**
     * @dev Override to only be done by owner.
     *
     */
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Override to only be done by owner.
     *
     */
    function burnFrom(address account, uint256 amount) public onlyOwner {
        _burnFrom(account, amount);
    }

    /**
     * @dev See `ERC20._mint`.
     *
     * Requirements:
     *
     * - the caller must have the `MinterRole`.
     */
    function mint(address account, uint256 amount) public onlyMinter returns (bool) {
        require(isWhitelisted(account), "UNAUTHORIZED_RECIPIENT");
        return super.mint(account, amount);
    }

    /**
     * @dev Override to be a no-op.
     *
     */
    function renounceWhitelistAdmin() public {
        return;
    }

    /**
      *
      * @dev Disallow addresses from removing themselves
      * from the whitelist.
      *
      */
    function renounceWhitelisted() public {
        return;
    }
}