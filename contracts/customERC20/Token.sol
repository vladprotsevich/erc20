// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ERC20 } from "./Erc20.sol";

contract Token is ERC20 {
    constructor(address shop) ERC20("Token", "Tkn", 20) {}
}