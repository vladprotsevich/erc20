// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "operator-filter-registry/src/DefaultOperatorFilterer.sol";

contract CRT is ERC721, ERC2981, ERC721Enumerable, ERC721URIStorage, Ownable, DefaultOperatorFilterer {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIds;

    mapping (uint256 => address) public depositedTokenAddress;
    mapping (uint256 => uint256) public depositedTokenAmount;

    constructor(address royaltyRecipient) ERC721('CRT Awarded', 'CRT') {
        _setDefaultRoyalty(royaltyRecipient, 500);
    }

    function mint(address to, address tokenDepositedAddress, uint256 tokenDepositedAmount) external onlyOwner returns(uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        depositedTokenAddress[newItemId] = tokenDepositedAddress;
        depositedTokenAmount[newItemId] = tokenDepositedAmount;

        string memory _tokenURI = string.concat('https://vladik-example-pro.serveo.net/api/token?tokenId=', Strings.toString(newItemId));

        super._safeMint(to, newItemId); // we will use function _checkOnERC721Received if another contract will try to make a deposit;
        super._setTokenURI(newItemId, _tokenURI); // the json metadata for NFT

        return newItemId;
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) public view override(ERC2981) returns (address, uint256) {
        return super.royaltyInfo(_tokenId, _salePrice);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override(ERC721, IERC721) onlyAllowedOperatorApproval(operator) {
        super.setApprovalForAll(operator, approved);
    }

    function approve(address operator, uint256 tokenId) public override(ERC721, IERC721) onlyAllowedOperatorApproval(operator) {
        super.approve(operator, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) onlyAllowedOperatorApproval(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
        public
        override(ERC721, IERC721)
        onlyAllowedOperator(from)
    {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint tokenId) internal override(ERC721, ERC721URIStorage) onlyOwner {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721Enumerable, ERC721) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}