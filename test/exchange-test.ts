// @ts-nocheck
import { expect } from "chai"
import { ethers } from "hardhat"
import { AToken, CRT, Exchange } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import CRTJSON from "../artifacts/contracts/tokenSwapping/CRT.sol/CRT.json";

describe("Exchange SmartContract", async() => {
    let [owner, collector]: SignerWithAddress[] = [];
    let [emitValue, tokenAmount, tokenRatio]: number[] = [50, 25, 10];
    let exchange: Exchange;
    let tokenA: AToken;
    let crt: CRT
    let addressTokenB: string;

    beforeEach(async () => {
        [owner, collector] = await ethers.getSigners();

        const Exchange = await ethers.getContractFactory("Exchange", owner);
        exchange = await Exchange.deploy();

        await exchange.deployed();

        crt = new ethers.Contract(await exchange._nftCRT(), CRTJSON.abi, owner);

        addressTokenB = await exchange._addressTokenB();

        const TokenA = await ethers.getContractFactory("AToken", owner);
        tokenA = await TokenA.deploy(emitValue);

        await tokenA.deployed();

        await depositTokens(tokenAmount); // tokenAmount === 25
    })

    async function depositTokens(depositedTokenAmount: number) { // 1 token A === 10 token B
        await tokenA.connect(owner).approve(exchange.address, depositedTokenAmount);

        const depositTrx = await exchange.deposit(tokenA.address, depositedTokenAmount);
        await depositTrx.wait();
    }

    async function withdraw(tokenAmount: number) {
        const withdrawTrx = await exchange.connect(owner).withdraw(tokenA.address, tokenAmount);
        await withdrawTrx.wait();
    }

    it("should return success if the values of tokens A and B are valid", async () => {
        const exchangeContractTokenABalance = await tokenA.balanceOf(exchange.address);
        expect(exchangeContractTokenABalance).to.eq(tokenAmount);

        const ownersTokenABalance = await tokenA.balanceOf(owner.address);
        expect(ownersTokenABalance).to.eq(emitValue - tokenAmount);

        const ownersBTokenBalance = await exchange.balances(owner.address, addressTokenB)
        expect(ownersBTokenBalance).to.eq(tokenAmount * tokenRatio);
    })

    it("should return success if user withdraw all tokens A back", async () => {
        await withdraw(tokenAmount - 5);

        const exchangeContractTokenABalance = await tokenA.balanceOf(exchange.address);
        expect(exchangeContractTokenABalance).to.eq(5);

        const ownersTokenABalance = await tokenA.balanceOf(owner.address);
        expect(ownersTokenABalance).to.eq(emitValue - 5);

        const ownersBTokenBalance = await exchange.balances(owner.address, addressTokenB)
        expect(ownersBTokenBalance).to.eq(5 * tokenRatio);
    })

    it("should return success if user withdraw not all tokens A back", async () => {
        await withdraw(tokenAmount - 15);

        const exchangeContractTokenABalance = await tokenA.balanceOf(exchange.address);
        expect(exchangeContractTokenABalance).to.eq(15);

        const ownersTokenABalance = await tokenA.balanceOf(owner.address);
        expect(ownersTokenABalance).to.eq(35);

        const ownersBTokenBalance = await exchange.balances(owner.address, addressTokenB)
        expect(ownersBTokenBalance).to.eq(15 * tokenRatio);
    })

    it("should return failure if user does not have an enough balance for withdraw", async () => {
        await expect(withdraw(tokenAmount + 5)).to.be.revertedWith('Not enough tokens');
    })

    it("should return failure if user does not have an enough balance for withdraw", async () => {
        await depositTokens(5);
        await expect(withdraw(tokenAmount + 5)).to.be.revertedWith('Max transaction tokens amount is 20');
    })

    it("should return failure if user withdraw zero tokens", async () => {
        await expect(withdraw(0)).to.be.revertedWith('Token amount have to be more than 0');
    })

    it("should check on received nft after deposit", async () => {
        expect(await crt.balanceOf(owner.address)).to.eq(1)
    })

    it("should check on received nft after twice deposit", async () => {
        await depositTokens(tokenAmount);
        expect(await crt.balanceOf(owner.address)).to.eq(2)
    })

    it("should be success if token owner address are equal to deposited user address", async () => {
        expect(await crt.ownerOf(1)).to.eq(owner.address);
    })

    it("should be success if token owner address are not equal to another user address", async () => {
        expect(await crt.ownerOf(1)).to.not.eq(collector.address);
    })

    it("should check metadata url on correctness", async () => {
        const expectedTokenURI = "api/token?tokenId=1";
        expect(await crt.tokenURI(1)).to.eq(expectedTokenURI);
    })
})