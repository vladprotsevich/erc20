// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BToken is ERC20, Ownable {
    constructor() ERC20("BToken", "B") {}

    function mint(address _to, uint amount) external onlyOwner {
        _mint(_to, amount);
    }

    function burn(address _from, uint amount) external onlyOwner {
        _burn(_from, amount);
    }
}