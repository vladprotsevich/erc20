// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IExchange.sol";
import "./BToken.sol";
import "./CRT.sol";

contract Exchange is IExchange {
    using SafeERC20 for IERC20;

    BToken private immutable _tokenB;
    CRT public immutable _nftCRT;
    address public immutable _addressTokenB;

    mapping (address => mapping (address => uint256)) public balances;

    uint8 constant maxTransactionAmount = 25;

    constructor() {
        _tokenB = new BToken();
        _nftCRT = new CRT(msg.sender);
        _addressTokenB = address(_tokenB);
    }

    modifier enoughTokensToWithdraw(address tokenAddress, uint256 amount) {
        require(balances[msg.sender][tokenAddress] >= amount, "Not enough tokens");
        _;
    }

    modifier validateTokenAmount(uint256 amount) {
        require(amount > 0, "Token amount have to be more than 0");
        require(maxTransactionAmount >= amount, "Max transaction tokens amount is 20");
        _;
    }

    function deposit(address tokenAddress, uint256 amount) external {
        balances[msg.sender][tokenAddress] += amount;

        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amount);

        balances[msg.sender][_addressTokenB] += amount * 10;

        _tokenB.mint(msg.sender, amount * 10);

        _nftCRT.mint(msg.sender, tokenAddress, amount);

        emit Deposit(msg.sender, address(this), tokenAddress, amount);
    }

    function withdraw(address tokenAddress, uint256 amount) external enoughTokensToWithdraw(tokenAddress, amount)
     validateTokenAmount(amount) {
        balances[msg.sender][tokenAddress] -= amount;

        IERC20(tokenAddress).safeTransfer(msg.sender, amount);

        balances[msg.sender][_addressTokenB] -= amount * 10;
        _tokenB.burn(msg.sender, amount * 10);

        emit Withdraw(address(this), msg.sender, tokenAddress, amount);
    }

    event Deposit(address _from, address _to, address _tokenAddress, uint256 _tokenAmount);
    event Withdraw(address _from, address _to, address _tokenAddress, uint256 _tokenAmount);
}