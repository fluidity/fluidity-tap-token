const ColTea = artifacts.require("ColTea");
const name = "52 week US Treasuries"
const symbol = 'USTB'
const CUSIP = '912794SL4'
const decimals = 6
const faceValue = 100000
const JUL_3_12_00_00_UTC_2020 = 159377760015
const custodianAddress = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
const custodianIdentifier = 1111

module.exports = deployer => {
  deployer.deploy(ColTea,
      name, // name
      symbol, // symbol
      decimals, //decimals
      web3.utils.fromAscii(CUSIP).slice(0, 20), // CUSIP
      faceValue, // FaceValue
      JUL_3_12_00_00_UTC_2020, // maturityDate
      custodianAddress, // custodian address
      custodianIdentifier // custodian numeric identifer
    )
};
