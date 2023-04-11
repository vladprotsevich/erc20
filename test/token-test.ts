import { expect } from "chai"
import { ethers } from "hardhat"
import { AToken, CRT, Exchange } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";
import CRTJSON from "../artifacts/contracts/tokenSwapping/CRT.sol/CRT.json";

describe("Exchange SmartContract", async() => {
    let owner: SignerWithAddress;
    let collector: SignerWithAddress;
    let tokenA: AToken;
    let exchange: Exchange;
    let emitValue: number;
    let tokenAmount: number;
    let tokenRatio: number; 
    let addressTokenB: string;
    let crt: any;

    beforeEach(async () => {
        emitValue = 50;
        tokenAmount = 15;
        tokenRatio = 10;

        [owner, collector] = await ethers.getSigners();

        const TokenA = await ethers.getContractFactory("AToken", owner);
        tokenA = await TokenA.deploy(emitValue);

        await tokenA.deployed();

        const Exchange = await ethers.getContractFactory("Exchange", owner);
        exchange = await Exchange.deploy();

        await exchange.deployed();

        addressTokenB = await exchange._addressTokenB();

        crt = new ethers.Contract(await exchange._nftCRT(), CRTJSON.abi, owner);
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

        const ownersBTokenBalance = await exchange.balances(owner.address, addressTokenB)
        expect(ownersBTokenBalance).to.eq(tokenAmount * tokenRatio);
    })

    it("should return success if user withdraw all tokens A back", async () => {
        await depositTokens(tokenAmount);
        await withdraw(tokenAmount);

        const exchangeContractTokenABalance = await tokenA.balanceOf(exchange.address);
        expect(exchangeContractTokenABalance).to.eq(0);

        const ownersTokenABalance = await tokenA.balanceOf(owner.address);
        expect(ownersTokenABalance).to.eq(emitValue);

        const ownersBTokenBalance = await exchange.balances(owner.address, addressTokenB)
        expect(ownersBTokenBalance).to.eq(0);
    })

    it("should return success if user withdraw not all tokens A back", async () => {
        await depositTokens(tokenAmount);
        await withdraw(tokenAmount - 5);

        const exchangeContractTokenABalance = await tokenA.balanceOf(exchange.address);
        expect(exchangeContractTokenABalance).to.eq(5);

        const ownersTokenABalance = await tokenA.balanceOf(owner.address);
        expect(ownersTokenABalance).to.eq(emitValue - 5);

        const ownersBTokenBalance = await exchange.balances(owner.address, addressTokenB)
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

    it("should check on received nft after deposit", async () => {
        expect(await crt.balanceOf(owner.address)).to.eq(0)
        await depositTokens(tokenAmount);
        expect(await crt.balanceOf(owner.address)).to.eq(1)
    })

    it("should be success if token owner address are equal to deposited user address", async () => {
        await depositTokens(tokenAmount);
        expect(await crt.ownerOf(1)).to.eq(owner.address);
    })    

    it("should be success if token owner address are not equal to another user address", async () => {
        await depositTokens(tokenAmount);
        expect(await crt.ownerOf(1)).to.not.eq(collector.address);
    })        

    it("should check metadata url on correctness", async () => {
        await depositTokens(tokenAmount);
        const tokenName = await crt.name();
        const tokenSymbol = await crt.symbol();
        console.log(tokenName)
        const expectedTokenURI = `http://localhost:3000/api/token?tokenName=${tokenName}&tokenSymbol=${tokenSymbol}&tokenAddress=${tokenA.address.toLowerCase()}&depositedTokenAmount=${tokenAmount}`;
        expect(await crt.tokenURI(1)).to.eq(expectedTokenURI)
    })    
})