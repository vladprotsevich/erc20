// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ERC20 } from "./Erc20.sol";

contract CustomToken is ERC20 {
    constructor(address shop) ERC20("CustomeToken", "Tkn", 20, shop) {}
}