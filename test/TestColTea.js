/* global artifacts, it, contract, assert web3 before */ // ignore those keywords when linting
const truffleAssert = require('truffle-assertions')
const helper = require('./util.js')
const ColTea = artifacts.require('./ColTea')

contract('ColTea', async (accounts) => {
  const admin = accounts[0]
  const nonAdmin = accounts[1]
  const name = '52 week US Treasuries'
  const symbol = 'USTB'
  const decimals = 6
  const faceValue = 100000
  const cusip = '912794SL4'
  const JUL_3_12_00_00_UTC_2020 = 159377760015
  const custodianAddress = '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'
  const custodianIdentifier = 1111
  let colttoken
  let snapshotId

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

  beforeEach(async () => {
    let snapShot = await helper.takeSnapshot()
    snapshotId = snapShot['result']
  })

  afterEach(async () => {
    await helper.revertToSnapShot(snapshotId)
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

  describe('Test Minting and Burning', async () => {
    it('minting by nonAdmin', async () => {
      let currentSupply = (await colttoken.totalSupply.call()).toNumber()
      let txreceipt = colttoken.mint(admin, 3500, { from: nonAdmin })
      await truffleAssert.reverts(txreceipt)
      assert.equal(currentSupply, (await colttoken.totalSupply.call()).toNumber(), 'The minted amount incorrectly increased by a non-Admin')
    })

    it('minting by admin', async () => {
      let currentSupply = (await colttoken.totalSupply.call()).toNumber()
      let addedSupply = 3500
      let txreceipt = colttoken.mint(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)

      assert.equal(currentSupply + addedSupply, (await colttoken.totalSupply.call()).toNumber(), 'The minted amount has not increased the totalSupply by the expected amount by the admin')
    })

    it('burn from nonAdmin should fail', async () => {
      let currentSupply = (await colttoken.totalSupply.call()).toNumber()
      let addedSupply = 3500
      let txreceipt = colttoken.mint(admin, addedSupply, { from: admin })

      txreceipt = colttoken.burn(1, { from: nonAdmin })
      await truffleAssert.reverts(txreceipt)

      assert.equal(currentSupply + addedSupply, (await colttoken.totalSupply.call()), 'The token amount incorrectly decreased by burning from non-admin')

      txreceipt = colttoken.burnFrom(admin, 1, { from: nonAdmin })
      await truffleAssert.reverts(txreceipt)

      assert.equal(currentSupply + addedSupply, (await colttoken.totalSupply.call()), 'The token amount incorrectly decreased by burning from non-admin')
    })

    it('burn from admin succeeds', async () => {
      let currentSupply = (await colttoken.totalSupply.call()).toNumber()
      let addedSupply = 3500
      let burn3000 = 3000
      let burn500 = 500
      let txreceipt = colttoken.mint(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)

      txreceipt = colttoken.burn(burn3000, { from: admin })
      await truffleAssert.passes(await txreceipt)

      assert.equal(currentSupply + addedSupply - burn3000, (await colttoken.totalSupply.call()), 'The minted amount has not decreased the totalSupply by the expected amount')

      txreceipt = colttoken.burnFrom(admin, 500, { from: admin })
      await truffleAssert.reverts(txreceipt)

      assert.equal(currentSupply + addedSupply - burn3000, (await colttoken.totalSupply.call()), 'The minted amount incorrectly decreased from burnFrom when tokens were not approved')

      txreceipt = colttoken.approve(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)

      txreceipt = colttoken.burnFrom(admin, 500, { from: admin })
      await truffleAssert.passes(await txreceipt)

      assert.equal(currentSupply + addedSupply - burn3000 - burn500, (await colttoken.totalSupply.call()), 'The minted amount has not decreased the totalSupply by the expected amount')
    })
  })

  describe('Test Whitelisting Functions', async () => {
      it('ensure admin is in whitelist', async () => {
        assert.isTrue(await colttoken.isWhitelisted.call(admin))
      })
      it('minting to non-whitelist', async () => {
        let currentSupply = (await colttoken.totalSupply.call()).toNumber()
        let addedSupply = 3500
        let txreceipt = colttoken.mint(nonAdmin, addedSupply, { from: admin })
        await truffleAssert.reverts(txreceipt)

        assert.equal(currentSupply, (await colttoken.totalSupply.call()).toNumber(), 'The total supply incorrectly increase')
      })

      it('non-whitelist admin should not whitelist themselves', async () => {
        let txreceipt = colttoken.addWhitelisted(nonAdmin, { from: nonAdmin })
        await truffleAssert.reverts(txreceipt)
      })

      it('transferring to non-whitelist', async () => {

        let addedSupply = 3500
        let txreceipt = colttoken.mint(admin, addedSupply, { from: admin })
        await truffleAssert.passes(await txreceipt)
        let adminBalance = (await colttoken.balanceOf.call(admin))

        txreceipt = colttoken.transfer(nonAdmin, addedSupply, { from: admin })
        await truffleAssert.reverts(txreceipt)
       assert.equal(adminBalance, (await colttoken.balanceOf.call(admin)).toNumber())
      })

      it('whitelist nonAdmin to allow for successful transfer', async () => {

        let addedSupply = 3500
        let txreceipt = colttoken.mint(admin, addedSupply, { from: admin })
        await truffleAssert.passes(await txreceipt)
        let adminBalance = (await colttoken.balanceOf.call(admin))

        txreceipt = colttoken.addWhitelisted(nonAdmin, { from: admin })
        await truffleAssert.passes(await txreceipt)


        txreceipt = colttoken.transfer(nonAdmin, addedSupply, { from: admin })
        await truffleAssert.passes(await txreceipt)
        assert.equal(adminBalance, (await colttoken.balanceOf.call(nonAdmin)).toNumber())
      })
  })
})
