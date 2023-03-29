// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IExchange.sol";
import "./BToken.sol";

contract Exchange is IExchange, Ownable {
    using SafeERC20 for IERC20;

    IERC20 private _tokenA;
    BToken private _tokenB;
    mapping (address => mapping (address=>uint)) private balances;

    constructor(address tokenA) {
        _tokenA = IERC20(tokenA);
        _tokenB = new BToken(0);
    }

    modifier enoughTokensToWithdraw(address tokenAddress, uint amount) {
        require(balances[msg.sender][tokenAddress] >= amount, "Not enough tokens");
        _;
    }      

    function balancesTokenB(address account) external view returns(uint) {
        return _tokenB.balanceOf(account);
    }

    function deposit(address tokenAddress, uint amount) external {
        balances[msg.sender][tokenAddress] = amount;
        _tokenA.safeTransferFrom(msg.sender, address(this), amount);

        amount *= 10;
        _tokenB.mintSomeTokensB(msg.sender, amount);
    }

    function withdraw(address tokenAddress, uint amount) external enoughTokensToWithdraw(tokenAddress, amount) {
        balances[msg.sender][tokenAddress] -= amount;

        _tokenA.safeTransfer(msg.sender, amount);

        amount *= 10;
        _tokenB.burnSomeTokensB(msg.sender, amount);
    }
}