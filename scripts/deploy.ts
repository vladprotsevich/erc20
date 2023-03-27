import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const Erc = await ethers.getContractFactory('Shop', signer);
  const erc = await Erc.deploy()
  await erc.deployed()
  console.log(erc.address);
  console.log(await erc.token());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
