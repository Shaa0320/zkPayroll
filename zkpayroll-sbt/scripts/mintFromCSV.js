const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const sbt = await hre.ethers.getContractAt(
    "zkPayrollSBT",
    CONTRACT_ADDRESS
  );

  const rows = fs
    .readFileSync("zkPayroll_ELIGIBLE_1000.csv", "utf8")
    .trim()
    .split("\n")
    .slice(1); // skip header

  for (const row of rows) {
    const cols = row.split(",");
    const wallet = cols[0];      // wallet_address
    const year = Number(cols[cols.length - 5] || 2026); // appraisal_year

    await sbt.setEligible(wallet, true);
    await sbt.mintAppraisal(wallet, 2026);

    console.log("Minted SBT for:", wallet);
  }
}

main().catch(console.error);
