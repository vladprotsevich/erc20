import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const Exchange = await ethers.getContractFactory('Exchange', signer);
  const TokenA = await ethers.getContractFactory('AToken', signer);

  const tokenA = await TokenA.deploy(15)
  await tokenA.deployed()

  const exchange = await Exchange.deploy()
  await exchange.deployed()

  console.log("Exchange Contract deployed to address:", exchange.address);
  console.log("TokenA Contract deployed to address:", tokenA.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
