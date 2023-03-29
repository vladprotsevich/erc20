// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AToken is ERC20 {
    constructor(uint initialSupply) ERC20("AToken", "A") {
        _mint(msg.sender, initialSupply);
    }
}