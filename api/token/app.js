const express = require('express')

const app = express();
const port = 3000

app.get('/api/token', (req, res) => {
    const tokenName = req.query.tokenName;
    const tokenSymbol = req.query.tokenSymbol;
    const tokenAddress = req.query.tokenAddress;
    const depositedTokenAmount = req.query.depositedTokenAmount;

    res.header('Content-Type', 'application/json')
    res.json({
        name: "CRT",
        desciption: "Awarded NFT",
        image: "ipfs://QmRn9FTyV1fYAqSMxAciq9ZuoNtPKDRnuA5iYqoeacceGc",
        attributes: [
            {
                trait_type: "deposited token",
                value: "Token A",
                tokenName,
                tokenSymbol,
                tokenAddress,
                depositedTokenAmount
            }
        ]
    })
    res.end();
})

app.listen(port, function() { 
    console.log('Node app is running on port', port);
})