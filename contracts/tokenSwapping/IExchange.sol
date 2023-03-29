// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IExchange {
    function deposit(address tokenAddress, uint amount) external;

    function withdraw(address tokenAddress, uint amount) external;
}