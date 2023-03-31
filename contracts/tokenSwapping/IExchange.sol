// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IExchange {
    function deposit(address tokenAddress, uint256 amount) external;

    function withdraw(address tokenAddress, uint256 amount) external;
}