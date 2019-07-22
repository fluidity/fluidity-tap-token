# Col-Tea ( ERC20 collateral holder) built using Fluidity Truffle Box

Col-T stands for the ERC20 token that will be inserted into the CDP and used to withdraw Dai. This token can be used in conjunction with col-tea-scripts.

## Features

- Contains custom identifiying information for the treasury bill specifically CUSIP, custodian addess, and custodianIdentifier
- The token is mintable by just the owner. The owner is a trusted party. The tokens will be minted after the TBills have been purchased. The attestation of assets owned can be verified through off-chain services. Work is in progress to ensure said information can be determined on-chain as well.
- The token is burnable by just the owner. This action will take place when the TBills have been sold and they are no longer in posession of the custodian.

## Package versions
- solc: 0.5.10+commit.5a6ea5b1.Emscripten.clang
- Open-Zeppelin v2.2
- Truffle v5.0.26 (core: 5.0.26)

## Code has been flattened as well for Etherscan