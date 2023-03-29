// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IExchange.sol";
import "./BToken.sol";

contract Exchange is IExchange {
    using SafeERC20 for IERC20;

    IERC20 private _tokenA;
    BToken private _tokenB;
    uint constant maxTransactionAmount = 20;
    mapping (address => mapping (address => uint)) private balances;

    constructor() {
        _tokenB = new BToken(0);
    }

    modifier enoughTokensToWithdraw(address tokenAddress, uint amount) {
        require(balances[msg.sender][tokenAddress] >= amount, "Not enough tokens");
        _;
    }      

    modifier maxTransactionTokenAmount(uint amount) {
        require(maxTransactionAmount >= amount, "Max transaction tokens amount is 20");
        _;
    }

    function balancesTokenB(address account) external view returns(uint) {
        return _tokenB.balanceOf(account);
    }

    function deposit(address tokenAddress, uint amount) external {
        _tokenA = IERC20(tokenAddress);
        balances[msg.sender][tokenAddress] += amount;
        _tokenA.safeTransferFrom(msg.sender, address(this), amount);

        _tokenB.mint(msg.sender, amount * 10);
    }

    function withdraw(address tokenAddress, uint amount) external enoughTokensToWithdraw(tokenAddress, amount)
     maxTransactionTokenAmount(amount) {
        balances[msg.sender][tokenAddress] -= amount;

        _tokenA.safeTransfer(msg.sender, amount);

        _tokenB.burn(msg.sender, amount * 10);
    }
}