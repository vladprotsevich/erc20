import * as dotenv from "dotenv"
import { ethers } from "hardhat"
import { AbiItem } from 'web3-utils'
import { createAlchemyWeb3 } from "@alch/alchemy-web3"
import exchangeContractJSON from "../artifacts/contracts/tokenSwapping/Exchange.sol/Exchange.json"

dotenv.config();

const {API_URL, PUBLIC_KEY, PRIVATE_KEY} = process.env;

const web3 = createAlchemyWeb3(String(API_URL));

const exchangeContractAddress = "0x8cb08880a3f12c881b29bf424bb5017c8fb9414b";
const tokenAContractAddress = "0x729D82E674F01b490Dc4CcfFfa505485a52700CB";

const exchangeContract = new web3.eth.Contract(exchangeContractJSON.abi as AbiItem[], exchangeContractAddress);

async function approve(to: string, amount: number) {
    const tokenAContract = await ethers.getContractAt('AToken', tokenAContractAddress);
    await tokenAContract.approve(to, amount);
}

async function deposit(tokenAddress: string, amount: number) {
    const nonce = await web3.eth.getTransactionCount(String(PUBLIC_KEY), 'latest');

    const trx = {
        'from': PUBLIC_KEY,
        'to': exchangeContractAddress,
        'nonce': nonce,
        'gas': 500000,
        'data': exchangeContract.methods.deposit(tokenAddress, amount).encodeABI()
    };

    const signPromise = web3.eth.accounts.signTransaction(trx, String(PRIVATE_KEY));
    signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        String(signedTx.rawTransaction),
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            )
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            )
          }
        }
      )
    })
    .catch((err) => {
      console.log("Promise failed:", err)
    })
}

approve(exchangeContractAddress, 5);
deposit(tokenAContractAddress, 2)
