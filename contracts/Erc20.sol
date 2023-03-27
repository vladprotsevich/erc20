// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC20.sol";

contract ERC20 is IERC20 {
    uint totalTokens; 
    address owner;
    mapping(address => uint) balances;
    mapping(address => mapping (address => uint)) allowances;
    string _name;
    string _symbol;

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner!");
        _;
    }

    modifier enoughTokens(address account, uint amount) {
        require(balanceOf(account) >= amount);
        _;
    }

    constructor(string memory name_, string memory symbol_, uint initialAmount_, address shop) {
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
        mint(initialAmount_, shop);
    }

    function mint(uint amount, address shop) internal onlyOwner {
        balances[shop] += amount;
        totalTokens += amount;

        emit Transfer(address(0), shop, amount);
    }

    function burn(address from, uint amount) external onlyOwner enoughTokens(from, amount) {
        balances[from] -= amount;
        totalTokens -= amount;
    }

    function name() external view returns(string memory) {
        return _name;
    }

    function symbol() external view returns(string memory) {
        return _symbol;
    }

    function decimals() external pure returns(uint) {
        return 18;
    }

    function totalSupply() external view returns(uint) {
        return totalTokens;
    }

    function balanceOf(address account) public view returns(uint) {
        return balances[account];
    }

    function transfer(address _to, uint _amount) external enoughTokens(msg.sender, _amount) {
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;

        emit Transfer(msg.sender, _to, _amount);
    }

    function allowance(address _owner, address _spender) public view returns(uint) {
        return allowances[_owner][_spender];
    }

    function transferFrom(address sender, address recipient, uint amount) public enoughTokens(sender, amount) {
        allowances[sender][recipient] -= amount;

        balances[sender] -= amount;
        balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function approve(address sender, uint amount) public {
        allowances[msg.sender][sender] = amount;
        emit Approve(msg.sender, sender, amount);
    }
}