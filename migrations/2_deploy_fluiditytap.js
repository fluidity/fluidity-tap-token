const FluidityTap = artifacts.require("FluidityTap");
const name = "US Treasuries"
const symbol = 'USTR'
const CUSIP = '912796VT3'
const decimals = 6
const faceValue = 1000
const SEP_3_12_00_00_UTC_2019 = 1567468800
const custodianIdentifier = 'Brokerage_name'
const custodianAccount = 12345678

module.exports = deployer => {
  deployer.deploy(FluidityTap,
      name, // name
      symbol, // symbol
      decimals, //decimals
      web3.utils.fromAscii(CUSIP).slice(0, 20), // CUSIP
      faceValue, // FaceValue
      SEP_3_12_00_00_UTC_2019, // maturityDate
      web3.utils.fromAscii(custodianIdentifier).slice(0, 66), // custodian address
      custodianAccount // custodian numeric identifer
    )
};
