// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '../TalesOfFeather.sol';

/// @title A contract that mocked TalesOfFeather
/// @dev This mock has a maximum supply set to 100, and 99 tokens are automatically minted when deployed
contract TalesOfFeatherMock is TalesOfFeather {
    constructor(
        string memory nftName,
        string memory nftSymbol,
        string memory hiddenMetadataUri,
        uint256 maxSupply,
        uint256 mintPrice,
        uint256 maxMintAmountPerTx
    )
        TalesOfFeather(
            nftName,
            nftSymbol,
            hiddenMetadataUri,
            maxSupply,
            mintPrice,
            maxMintAmountPerTx
        )
    {
        _safeMint(owner(), 99);
    }
}
