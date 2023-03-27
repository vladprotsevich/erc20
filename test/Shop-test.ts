import { expect } from "chai"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20, Shop } from "../typechain-types";
import tokenJSON from "../artifacts/contracts/CustomToken.sol/CustomToken.json"
import { Contract } from "ethers";
import { TransactionResponse } from "@ethersproject/providers";

describe("Shop", async () => {
    let owner: SignerWithAddress;
    let buyer: SignerWithAddress;
    let shop: Shop;
    let erc20: ERC20 | Contract;
    let tokenAmount: number;
    let trx: TransactionResponse;
    
    beforeEach(async () => {
        [owner, buyer] = await ethers.getSigners();

        const Shop = await ethers.getContractFactory("Shop", owner);
        shop = await Shop.deploy();
        await shop.deployed();

        erc20 = new ethers.Contract(await shop.token(), tokenJSON.abi, owner)

        tokenAmount = 3;

        trx = await buyer.sendTransaction({
            value: tokenAmount,
            to: shop.address,
        });

        await trx.wait()        
    })

    it("should have an owner and a token", async () => {
        expect(await shop.owner()).to.eq(owner.address);

        expect(await shop.token()).to.be.properAddress;
    })    

    it("allows to buy", async () => {
        expect(await erc20.balanceOf(buyer.address)).to.eq(tokenAmount)

        await expect(() => trx).
          to.changeEtherBalance(shop, tokenAmount)
              
        await expect(trx)
          .to.emit(shop, "Bought")
          .withArgs(tokenAmount, buyer.address)
    })

    it("allows to withdraw from shop", async function() {
        const withdrawAmount = 2

        const withdrawTrx = await shop.withdraw(withdrawAmount)
        await withdrawTrx.wait();

        await expect(() => withdrawTrx)
            .to.changeEtherBalance(shop, -withdrawAmount)

        await expect(() => withdrawTrx)
            .to.changeEtherBalance(owner, withdrawAmount)

        await expect(withdrawTrx)
            .to.emit(shop, "Withdaw")
            .withArgs(withdrawAmount)
    })

    it("allows to sell", async function () {
        const sellAmount = 2;

        const approval = await erc20.connect(buyer).approve(shop.address, sellAmount);

        await approval.wait()

        const sellTrx = await shop.connect(buyer).sell(sellAmount)

        expect(await erc20.balanceOf(buyer.address)).to.eq(1)

        await expect(() => sellTrx)
            .to.changeEtherBalance(shop.address, -sellAmount);

        await expect(sellTrx)
            .to.emit(shop, "Sold")
            .withArgs(sellAmount, buyer.address)
    })
})