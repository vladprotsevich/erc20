// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BToken is ERC20, Ownable {
    constructor(uint initialSupply) ERC20("BToken", "B") {
        _mint(msg.sender, initialSupply);
    }

    function mintSomeTokensB(address _to, uint amount) external onlyOwner {
        _mint(_to, amount);
    }

    function burnSomeTokensB(address _from, uint amount) external onlyOwner {
        _burn(_from, amount);
    }
}