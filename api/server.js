const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const { ethers } = require("ethers");
const csv = require("csv-parser");

const app = express();
app.use(express.json());

// 🔗 Blockchain connection
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// 🔐 Hardhat account
const signer = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);

// 📜 Contract
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const abi = [
  "function mint(address to, uint256 tokenId) public"
];

const contract = new ethers.Contract(contractAddress, abi, signer);

app.post("/run-zkpayroll", (req, res) => {
  const input = req.body;

  // Save input
  fs.writeFileSync("../input.json", JSON.stringify(input));

  // ✅ CORRECT ZK PIPELINE
  exec(`
  node ../circuits/zkPayroll_js/generate_witness.js ../circuits/zkPayroll_js/zkPayroll.wasm ../input.json ../witness.wtns &&
  snarkjs g16p ../keys/proving_key.zkey ../witness.wtns ../proof.json ../public.json &&
  snarkjs g16v ../keys/verification_key.json ../public.json ../proof.json
  `, async (error, stdout, stderr) => {

    if (error) {
      return res.status(500).json({ error: stderr });
    }

    // 🧠 DAO ELIGIBILITY LOGIC (ONLY ONCE)
    const eligible =
      input.age >= 21 &&
      input.salary >= 30000 &&
      input.citizenship === 1 &&
      input.isEmployee === 1 &&
      input.isVerified === 1;

    let txHash = null;

    // 🔥 Mint SBT
    if (eligible) {
      const tx = await contract.mint(signer.address, Date.now());
      await tx.wait();
      txHash = tx.hash;
    }

    res.json({
      zkProof: "verified",
      eligible: eligible,
      transactionHash: txHash,
      message: eligible
        ? "🎉 Candidate Approved & SBT Minted"
        : "❌ Candidate Not Eligible"
    });
  });
});

app.get("/process-csv", async (req, res) => {

  const results = [];

  fs.createReadStream("zkPayroll_FULL_1000.csv")
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {

      let roleGroups = {};

      for (const row of results.slice(0, 50)) { // limit for speed

        const input = {
  age: Number(row.ExperienceYears) + 21,
  salary: Number(row["WorkHours (avg/week)"]) * 1000,
  citizenship: 1,
  isEmployee: 1,
  isVerified: row["TrainingCompleted (Yes/No)"] === "Yes" ? 1 : 0
};
console.log("INPUT:", input);

        fs.writeFileSync("../input.json", JSON.stringify(input));

        await new Promise((resolve, reject) => {
          exec(`
          node ../circuits/zkPayroll_js/generate_witness.js ../circuits/zkPayroll_js/zkPayroll.wasm ../input.json ../witness.wtns &&
          snarkjs g16p ../keys/proving_key.zkey ../witness.wtns ../proof.json ../public.json &&
          snarkjs g16v ../keys/verification_key.json ../public.json ../proof.json
          `, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });

        const eligible =
          input.age >= 21 &&
          input.salary >= 30000 &&
          input.citizenship === 1 &&
          input.isEmployee === 1 &&
          input.isVerified === 1;

        let txHash = null;

        if (eligible) {
          const tx = await contract.mint(signer.address, Date.now());
          await tx.wait();
          txHash = tx.hash;
        }

        if (eligible) {

  const score =
    Number(row["PerformanceScore (0–100)"]) +
    Number(row["BehaviourScore (0–100)"]) +
    Number(row["SkillScore (0–100)"]) +
    Number(row["ReputationScore (weighted composite)"]);

  const role = row.Role;

  if (!roleGroups[role] || roleGroups[role].score < score) {
    roleGroups[role] = {
      id: row.EmployeeID,
      role: role,
      score: score,
      wallet: row.wallet_address
    };
  }
}
      }

      const selected = Object.values(roleGroups);

res.json({
  totalRoles: selected.length,
  selectedCandidates: selected
});
    });
});
app.listen(3000, () => console.log("🚀 Server running"));
