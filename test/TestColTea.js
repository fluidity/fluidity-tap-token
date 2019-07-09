/* global artifacts, it, contract, assert web3 before */ // ignore those keywords when linting

const ColTea = artifacts.require('./ColTea')

contract('ColTea', async (accounts) => {
  const name = '52 week US Treasuries'
  const symbol = 'USTB'
  const decimals = 6
  const faceValue = 100000
  const cusip = '912794SL4'
  const JUL_3_12_00_00_UTC_2020 = 159377760015
  const custodianAddress = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'
  const custodianIdentifier = 1111
  let colttoken

  before('deploy SMToken contract', async () => {
    colttoken = await ColTea.new(
      name, // name
      symbol, // symbol
      decimals, // decimals
      web3.utils.fromAscii(cusip).slice(0, 20), // cusip
      faceValue, // FaceValue
      JUL_3_12_00_00_UTC_2020, // maturityDate
      custodianAddress, // custodian address
      custodianIdentifier // custodian numeric identifer)
    )
  })

  describe('Test Default Values', async () => {
    it('check the default name', async () => {
      assert.equal(name, (await colttoken.name.call()), 'The name was not set correctly')
    })

    it('checking the symbol', async function () {
      assert.equal(symbol, await colttoken.symbol.call(), 'The symbol was not set correctly')
    })

    it('checking the decimals', async function () {
      assert.equal(decimals, await colttoken.decimals.call(), 'The decimal was not set correctly')
    })

    it('checking the cusip', async function () {
      assert.equal(cusip, web3.utils.toAscii(await colttoken.cusip.call()), 'The cusip was not set correctly')
    })

    it('checking the total face value', async function () {
      assert.equal(faceValue, await colttoken.totalFaceValue.call(), 'The total face value was not set correctly')
    })

    it('checking the maturity date', async () => {
      assert.equal(JUL_3_12_00_00_UTC_2020, await colttoken.maturityDate.call(), 'The maturity date was not set correctly')
    })

    it('checking the custodian address', async function () {
      assert.equal(custodianAddress, await colttoken.custodianAddress.call(), 'The custodian address was not set correctly')
    })

    it('checking the custodian identifier', async function () {
      assert.equal(custodianIdentifier, await colttoken.custodianIdentifier.call(), 'The custodian identifier was not set correctly')
    })
  })
})
