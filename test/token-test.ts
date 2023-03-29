import { expect } from "chai"
import { ethers } from "hardhat"
import { AToken, Exchange } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Exchange SmartContract", async() => {
    let owner: SignerWithAddress;
    let tokenA: AToken;
    let exchange: Exchange;
    let emitValue: number;
    let tokenAmount: number;
    let tokenRatio: number; 

    beforeEach(async () => {
        emitValue = 50;
        tokenAmount = 15;
        tokenRatio = 10;
        [owner] = await ethers.getSigners();

        const TokenA = await ethers.getContractFactory("AToken", owner);
        tokenA = await TokenA.deploy(emitValue);

        await tokenA.deployed();

        const Exchange = await ethers.getContractFactory("Exchange", owner);
        exchange = await Exchange.deploy();

        await exchange.deployed();
    });

    async function depositTokens(tokenAmount: number) { // 1 token A === 10 token B
        await tokenA.approve(exchange.address, tokenAmount);

        const depositTrx = await exchange.deposit(tokenA.address, tokenAmount);
        await depositTrx.wait();
    }

    async function withdraw(tokenAmount: number) {
        const withdrawTrx = await exchange.withdraw(tokenA.address, tokenAmount);
        await withdrawTrx.wait();
    }


    it("should check if owner\'s tokens balance on equal to emit value", async () => {
        const ownerBalance = await tokenA.balanceOf(owner.address)
        expect(ownerBalance).to.eq(emitValue)
    }) 

    it("should return success if the values of tokens A and B are valid", async () => {
        await depositTokens(tokenAmount)

        const exchangeContractTokenABalance = await tokenA.balanceOf(exchange.address);
        expect(exchangeContractTokenABalance).to.eq(tokenAmount);

        const ownersTokenABalance = await tokenA.balanceOf(owner.address);
        expect(ownersTokenABalance).to.eq(emitValue - tokenAmount);

        const ownersBTokenBalance = await exchange.balancesTokenB(owner.address)
        expect(ownersBTokenBalance).to.eq(tokenAmount * tokenRatio);
    })

    it("should return success if user withdraw all tokens A back", async () => {
        await depositTokens(tokenAmount);
        await withdraw(tokenAmount);

        const exchangeContractTokenABalance = await tokenA.balanceOf(exchange.address);
        expect(exchangeContractTokenABalance).to.eq(0);

        const ownersTokenABalance = await tokenA.balanceOf(owner.address);
        expect(ownersTokenABalance).to.eq(emitValue);

        const ownersBTokenBalance = await exchange.balancesTokenB(owner.address)
        expect(ownersBTokenBalance).to.eq(0);
    })

    it("should return success if user withdraw not all tokens A back", async () => {
        await depositTokens(tokenAmount);
        await withdraw(tokenAmount - 5);

        const exchangeContractTokenABalance = await tokenA.balanceOf(exchange.address);
        expect(exchangeContractTokenABalance).to.eq(5);

        const ownersTokenABalance = await tokenA.balanceOf(owner.address);
        expect(ownersTokenABalance).to.eq(emitValue - 5);

        const ownersBTokenBalance = await exchange.balancesTokenB(owner.address)
        expect(ownersBTokenBalance).to.eq(5 * tokenRatio);
    })    

    it("should return failure if user does not have an enough balance for withdraw", async () => {
        await depositTokens(tokenAmount);
        await expect(withdraw(tokenAmount + 5)).to.be.revertedWith('Not enough tokens');
    })        

    it("should return failure if user does not have an enough balance for withdraw", async () => {
        await depositTokens(tokenAmount + 15);
        await expect(withdraw(tokenAmount + 10)).to.be.revertedWith('Max transaction tokens amount is 20');
    })

    it("should return failure if user withdraw zero tokens", async () => {
        await depositTokens(tokenAmount);
        await expect(withdraw(0)).to.be.revertedWith('Token amount have to be more than 0');
    })

    it("should return success if a few deposit transactions are valid", async () => {
        await depositTokens(tokenAmount);
        await depositTokens(tokenAmount);

        expect(await tokenA.balanceOf(exchange.address)).to.eq(tokenAmount + tokenAmount)
    })
})