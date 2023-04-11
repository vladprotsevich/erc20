// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "operator-filter-registry/src/DefaultOperatorFilterer.sol";


contract CRT is ERC721, ERC721URIStorage, Ownable, DefaultOperatorFilterer {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIds;

    constructor() ERC721('CRT Awarded', 'CRT') {}

    function mintNFT(address to, address depositedTokenAddress, uint256 depositedAmount) external onlyOwner returns(uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        string memory tokenUR = generateTokenURI(depositedTokenAddress, depositedAmount);
        
        super._safeMint(to, newItemId); // we will use function _checkOnERC721Received if another contract will try to make a deposit;
        super._setTokenURI(newItemId, tokenUR); // the json metadata for NFT

        return newItemId;
    }

    function generateTokenURI(address depositedTokenAddress, uint256 depositedAmount) public view onlyOwner returns(string memory) {
        string memory _name = name();
        string memory _symbol = symbol();
        string memory _tokenAddress = Strings.toHexString(uint256(uint160(depositedTokenAddress)), 20);
        string memory _amount = Strings.toString(depositedAmount);

        return string.concat("http://localhost:3000/api/token?", "tokenName=", _name,
         "&tokenSymbol=", _symbol, "&tokenAddress=", _tokenAddress, "&depositedTokenAmount=", _amount);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }    

    function setApprovalForAll(address operator, bool approved) public override onlyAllowedOperatorApproval(operator) {
        super.setApprovalForAll(operator, approved);
    }

    function approve(address operator, uint256 tokenId) public override onlyAllowedOperatorApproval(operator) {
        super.approve(operator, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override onlyAllowedOperatorApproval(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
        public
        override
        onlyAllowedOperator(from)
    {
        super.safeTransferFrom(from, to, tokenId, data);
    }       

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }    

    function _burn(uint tokenId) internal override(ERC721, ERC721URIStorage) onlyOwner {
        super._burn(tokenId);
    }     
}