# Fluidity TAP Token: Treasuries Pilot
Fluidity Tokenized Asset Portfolio (TAP) is a model to obtain leverage on real world assets using the MakerDAO Multi-Collateral Dai (MCD) credit system. This repository contains the smart contract that represents a Treasury bill as an ERC-20 token that is pledged to the MCD system as collateral. Created with the [Fluidity Truffle Box](https://github.com/fluidity/fluidity-truffle-box).

## Features
* Treasury bill data includes CUSIP, custodian address, and a custodian identifier. Custodian information is used by the position oracles to attest ownership.
* Only the owner of the token, the sponsor of the TAP, is able to mint tokens once Treasury bills have been purchased.
* Only the owner of the token is able to burn tokens once the Treasury bills have been sold and are no longer held by the custodian.
* Enforces transfer restrictions to ensure that any holder of the token is whitelisted. This comes into play during an MCD liquidation event and auction.
* A set of whitelist administrators are able to modify the whitelist. An event is emitted when there is a change to the whitelist.
Smart contract code has been flattened for verification on Etherscan.

## Package versions
* solc: 0.5.10+commit.5a6ea5b1.Emscripten.clang
* Open-Zeppelin v2.2
* Truffle v5.0.26 (core: 5.0.26)

## Contact Us
Fluidity is a financial technology company based in Brooklyn, New York, on a mission to rebuild finance using blockchain technology. Reach us at team@fluidity.io for any inquiries related to this repository, the Tokenized Asset Portfolio (TAP), or working with our team.
