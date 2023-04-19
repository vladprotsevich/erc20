import { ethers } from 'hardhat'
import { Request, Response } from 'express';
import express from "express";
import nftJSON from "../../artifacts/contracts/tokenSwapping/CRT.sol/CRT.json";
import exchangeJSON from "../../artifacts/contracts/tokenSwapping/Exchange.sol/Exchange.json";

const app = express();
const port = 3000

app.get('/api/token', async (req: Request, res: Response) => {
    try {
        const tokenId = req.query.tokenId;

        const exchangeContract = await ethers.getContractAt('Exchange', '0x5c226eac87df4de25c2d26574448cdd828e8af6d');

        const nftContractAddress = await exchangeContract._nftCRT()

        const nftContract = await ethers.getContractAt('CRT', nftContractAddress);

        res.header('Content-Type', 'application/json')
        res.json({
            name: 'Boo ghost',
            desciption: "A little ghost NFT which is awarded by every deposit on Exchange contract",
            image: "ipfs://QmRn9FTyV1fYAqSMxAciq9ZuoNtPKDRnuA5iYqoeacceGc",
            attributes: [
                {
                    trait_type: "nft original name",
                    value: await nftContract.name()
                },
                {
                    trait_type: "nft symbol",
                    symbol: await nftContract.symbol()
                },
                {
                    trait_type: "deposited token address",
                    value: await nftContract.depositedTokenAddress(tokenId)
                },
                {
                    trait_type: "deposited token amount",
                    value: (await nftContract.depositedTokenAmount(tokenId)).toString()
                },
            ]
        })
        res.end();
    } catch {
        throw new Error('Not valid data')
    }
})

app.listen(port, function() {
    console.log('Node app is running on port', port);
})