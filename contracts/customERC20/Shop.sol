// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ERC20 } from "./Erc20.sol";
import { Token } from "./Token.sol";

contract Shop {
    ERC20 public token;
    address payable public owner;
    event Bought(uint indexed _amount, address indexed _buyer);
    event Sold(uint indexed _amount, address indexed _seller);
    event Withdaw(uint indexed _amount);

    constructor() {
        token = new Token(address(this));
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner!");
        _;
    }

    function shopBalance() external view onlyOwner returns(uint) {
        return payable(address(this)).balance;
    }

    function sell(uint _amountToSell) external {
        require(
            _amountToSell > 0 &&
            token.balanceOf(msg.sender) >= _amountToSell,
            "incorrect amount!"
        );

        require(
            token.allowance(msg.sender, address(this)) >= _amountToSell,
            "check allowance!"
        );

        token.transferFrom(msg.sender, address(this), _amountToSell);

        payable(msg.sender).transfer(_amountToSell);

        emit Sold(_amountToSell, msg.sender);
    }

    function tokenBalance() public view returns(uint) {
        return token.balanceOf(address(this));
    }

    function withdraw(uint _amountToWithdaw) external onlyOwner {
        require(token.balanceOf(address(this)) >= _amountToWithdaw, "not enough funds");

        owner.transfer(_amountToWithdaw);
        emit Withdaw(_amountToWithdaw);
    }

    receive() external payable {
        uint tokensToBuy = msg.value; // 1 wei = 1 token
        require(tokensToBuy > 0, "not enough funds!");

        require(tokenBalance() >= tokensToBuy, "not enough tokens!");

        token.transfer(msg.sender, tokensToBuy);

        emit Bought(tokensToBuy, msg.sender);
    }
}