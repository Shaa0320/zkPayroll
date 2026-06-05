const hre = require("hardhat");

async function main() {
  const [deployer, voter2] = await hre.ethers.getSigners();

  // 1️⃣ Deploy DAO with controlled gas
  const DAO = await hre.ethers.getContractFactory("PayRaiseDAO");
  const dao = await DAO.deploy(
    [deployer.address, voter2.address],
    { gasLimit: 8000000 }   // 🔥 FIX
  );
  await dao.waitForDeployment();
  console.log("DAO deployed at:", await dao.getAddress());

  // 2️⃣ Deploy SBT linked to DAO
  const SBT = await hre.ethers.getContractFactory("zkPayrollSBT");
  const sbt = await SBT.deploy(
    deployer.address,
    await dao.getAddress(),
    { gasLimit: 8000000 }   // 🔥 FIX
  );
  await sbt.waitForDeployment();
  console.log("zkPayroll SBT deployed at:", await sbt.getAddress());
}

main().catch(console.error);
