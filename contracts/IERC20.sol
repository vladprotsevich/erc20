// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.0;

interface IERC20 {
    function name() external view returns(string memory);

    function symbol() external view returns(string memory);

    function decimals() external pure returns(uint); 

    function totalSupply() external view returns(uint);

    function balanceOf(address account) external view returns(uint); 

    function transfer(address _to, uint _amout) external; 

    function transferFrom(address sender, address recipient, uint amount) external; 

    function allowance(address _owner, address _spender) external view returns(uint); 

    function approve(address sender, uint amount) external; 

    event Transfer(address indexed _from, address indexed _to, uint amount);

    event Approve(address indexed _owner, address indexed _to, uint amount);
}