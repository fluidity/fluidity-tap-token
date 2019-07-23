/* global artifacts, it, contract, assert web3 before */ // ignore those keywords when linting
const truffleAssert = require('truffle-assertions')
const helper = require('./util.js')
const FluidityTap = artifacts.require('./FluidityTap')

contract('FluidityTap', async (accounts) => {
  const admin = accounts[0]
  const nonAdmin = accounts[1]
  const name = '52 week US Treasuries'
  const symbol = 'USTB'
  const decimals = 6
  const faceValue = 100000
  const cusip = '912794SL4'
  const JUL_3_12_00_00_UTC_2020 = 159377760015
  const custodianIdentifier = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef000000000000000000000000'
  const custodianAccount = 1111
  let fludityTapToken
  let snapshotId

  before('deploy FluidityTap contract', async () => {
    fludityTapToken = await FluidityTap.new(
      name, // name
      symbol, // symbol
      decimals, // decimals
      web3.utils.fromAscii(cusip).slice(0, 20), // cusip
      faceValue, // FaceValue
      JUL_3_12_00_00_UTC_2020, // maturityDate
      custodianIdentifier, // custodian address
      custodianAccount // custodian numeric identifer)
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
      assert.equal(name, (await fludityTapToken.name.call()), 'The name was not set correctly')
    })

    it('checking the symbol', async function () {
      assert.equal(symbol, await fludityTapToken.symbol.call(), 'The symbol was not set correctly')
    })

    it('checking the decimals', async function () {
      assert.equal(decimals, await fludityTapToken.decimals.call(), 'The decimal was not set correctly')
    })

    it('checking the cusip', async function () {
      assert.equal(cusip, web3.utils.toAscii(await fludityTapToken.cusip.call()), 'The cusip was not set correctly')
    })

    it('checking the total face value', async function () {
      assert.equal(faceValue, await fludityTapToken.totalFaceValue.call(), 'The total face value was not set correctly')
    })

    it('checking the maturity date', async () => {
      assert.equal(JUL_3_12_00_00_UTC_2020, await fludityTapToken.maturityDate.call(), 'The maturity date was not set correctly')
    })

    it('checking the custodian identifier', async function () {
      assert.equal(custodianIdentifier, await fludityTapToken.custodianIdentifier.call(), 'The custodian identifier was not set correctly')
    })

    it('checking the custodian account', async function () {
      assert.equal(custodianAccount, await fludityTapToken.custodianAccount.call(), 'The custodian account was not set correctly')
    })
  })

  describe('Test Minting and Burning', async () => {
    it('minting by nonAdmin', async () => {
      let currentSupply = (await fludityTapToken.totalSupply.call()).toNumber()
      let txreceipt = fludityTapToken.mint(admin, 3500, { from: nonAdmin })
      await truffleAssert.reverts(txreceipt)
      assert.equal(currentSupply, (await fludityTapToken.totalSupply.call()).toNumber(), 'The minted amount incorrectly increased by a non-Admin')
    })

    it('minting by admin', async () => {
      let currentSupply = (await fludityTapToken.totalSupply.call()).toNumber()
      let addedSupply = 3500
      let txreceipt = fludityTapToken.mint(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)

      assert.equal(currentSupply + addedSupply, (await fludityTapToken.totalSupply.call()).toNumber(), 'The minted amount has not increased the totalSupply by the expected amount by the admin')
    })

    it('burn from nonAdmin should fail', async () => {
      let currentSupply = (await fludityTapToken.totalSupply.call()).toNumber()
      let addedSupply = 3500
      let txreceipt = fludityTapToken.mint(admin, addedSupply, { from: admin })

      txreceipt = fludityTapToken.burn(1, { from: nonAdmin })
      await truffleAssert.reverts(txreceipt)

      assert.equal(currentSupply + addedSupply, (await fludityTapToken.totalSupply.call()), 'The token amount incorrectly decreased by burning from non-admin')

      txreceipt = fludityTapToken.burnFrom(admin, 1, { from: nonAdmin })
      await truffleAssert.reverts(txreceipt)

      assert.equal(currentSupply + addedSupply, (await fludityTapToken.totalSupply.call()), 'The token amount incorrectly decreased by burning from non-admin')
    })

    it('burn from admin succeeds', async () => {
      let currentSupply = (await fludityTapToken.totalSupply.call()).toNumber()
      let addedSupply = 3500
      let burn3000 = 3000
      let burn500 = 500
      let txreceipt = fludityTapToken.mint(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)

      txreceipt = fludityTapToken.burn(burn3000, { from: admin })
      await truffleAssert.passes(await txreceipt)

      assert.equal(currentSupply + addedSupply - burn3000, (await fludityTapToken.totalSupply.call()), 'The minted amount has not decreased the totalSupply by the expected amount')

      txreceipt = fludityTapToken.burnFrom(admin, 500, { from: admin })
      await truffleAssert.reverts(txreceipt)

      assert.equal(currentSupply + addedSupply - burn3000, (await fludityTapToken.totalSupply.call()), 'The minted amount incorrectly decreased from burnFrom when tokens were not approved')

      txreceipt = fludityTapToken.approve(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)

      txreceipt = fludityTapToken.burnFrom(admin, 500, { from: admin })
      await truffleAssert.passes(await txreceipt)

      assert.equal(currentSupply + addedSupply - burn3000 - burn500, (await fludityTapToken.totalSupply.call()), 'The minted amount has not decreased the totalSupply by the expected amount')
    })
  })

  describe('Test Whitelisting Functions', async () => {
    it('ensure admin is in whitelist and whitelistAdmin', async () => {
      assert.isTrue(await fludityTapToken.isWhitelisted.call(admin))
      assert.isTrue(await fludityTapToken.isWhitelistAdmin.call(admin))
    })

    it('ensure renounceWhitelistAdmin is no-op function', async () => {
      await truffleAssert.passes(await fludityTapToken.renounceWhitelistAdmin({ from: admin }))

      assert.isTrue(await fludityTapToken.isWhitelistAdmin.call(admin), 'admin was able to renounce whitelist')
    })

    it('ensure renounceWhitelisted(self) is no-op function', async () => {
      await truffleAssert.passes(await fludityTapToken.renounceWhitelisted({ from: admin }))

      assert.isTrue(await fludityTapToken.isWhitelisted.call(admin), 'admin was able to renounce whitelist')
    })

    it('ensure admin is in whitelist', async () => {
      assert.isTrue(await fludityTapToken.isWhitelisted.call(admin))
    })

    it('minting to non-whitelist', async () => {
      let currentSupply = (await fludityTapToken.totalSupply.call()).toNumber()
      let addedSupply = 3500
      let txreceipt = fludityTapToken.mint(nonAdmin, addedSupply, { from: admin })
      await truffleAssert.reverts(txreceipt)

      assert.equal(currentSupply, (await fludityTapToken.totalSupply.call()).toNumber(), 'The total supply incorrectly increase')
    })

    it('non-whitelist admin should not whitelist themselves', async () => {
      let txreceipt = fludityTapToken.addWhitelisted(nonAdmin, { from: nonAdmin })
      await truffleAssert.reverts(txreceipt)
    })

    it('transferring to non-whitelist', async () => {
      let addedSupply = 3500
      let txreceipt = fludityTapToken.mint(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)
      let adminBalance = (await fludityTapToken.balanceOf.call(admin))

      txreceipt = fludityTapToken.transfer(nonAdmin, addedSupply, { from: admin })
      await truffleAssert.reverts(txreceipt)
      assert.equal(adminBalance, (await fludityTapToken.balanceOf.call(admin)).toNumber())
    })

    it('transferFrom to non-whitelist', async () => {
      let addedSupply = 3500
      let txreceipt = fludityTapToken.mint(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)
      let adminBalance = (await fludityTapToken.balanceOf.call(admin))

      txreceipt = fludityTapToken.approve(nonAdmin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)

      txreceipt = fludityTapToken.transferFrom(admin, nonAdmin, addedSupply, { from: nonAdmin })
      await truffleAssert.reverts(txreceipt)
      assert.equal(adminBalance, (await fludityTapToken.balanceOf.call(admin)).toNumber())
    })

    it('whitelist nonAdmin to allow for successful transfer', async () => {
      let addedSupply = 3500
      let txreceipt = fludityTapToken.mint(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)
      let adminBalance = (await fludityTapToken.balanceOf.call(admin))

      txreceipt = fludityTapToken.addWhitelisted(nonAdmin, { from: admin })
      await truffleAssert.passes(await txreceipt)

      txreceipt = fludityTapToken.transfer(nonAdmin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)
      assert.equal(adminBalance, (await fludityTapToken.balanceOf.call(nonAdmin)).toNumber())
    })

    it('whitelist nonAdmin to allow for successful transferFrom', async () => {
      let addedSupply = 3500
      let txreceipt = fludityTapToken.mint(admin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)
      let adminBalance = (await fludityTapToken.balanceOf.call(admin))

      txreceipt = fludityTapToken.approve(nonAdmin, addedSupply, { from: admin })
      await truffleAssert.passes(await txreceipt)

      txreceipt = fludityTapToken.addWhitelisted(nonAdmin, { from: admin })
      await truffleAssert.passes(await txreceipt)

      txreceipt = fludityTapToken.transferFrom(admin, nonAdmin, addedSupply, { from: nonAdmin })
      await truffleAssert.passes(await txreceipt)
      assert.equal(adminBalance, (await fludityTapToken.balanceOf.call(nonAdmin)).toNumber())
    })
  })
})
