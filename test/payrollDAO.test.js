const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PayrollDAO", function () {
  async function deployFixture() {
    const [deployer, member2, employee] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("PayrollDAO");
    const dao = await DAO.deploy([deployer.address, member2.address]);
    await dao.waitForDeployment?.();

    // Fund DAO
    await deployer.sendTransaction({
      to: await dao.getAddress?.() ?? dao.target,
      value: ethers.parseEther("1")
    });

    return { dao, deployer, member2, employee };
  }

  it("should add employee and release salary", async function () {
    const { dao, deployer, member2, employee } = await loadFixture(deployFixture);

    // Add employee proposal
    const salary = ethers.parseEther("0.1");
    await dao.createProposal(0, employee.address, salary); // 0 = AddEmployee
    await dao.vote(0, true);
    await dao.connect(member2).vote(0, true);
    await dao.executeProposal(0);

    let emp = await dao.employees(employee.address);
    expect(emp.exists).to.equal(true);

    // Release funds
    await dao.createProposal(3, employee.address, salary); // 3 = ReleaseFunds
    await dao.vote(1, true);
    await dao.connect(member2).vote(1, true);

    const before = await ethers.provider.getBalance(employee.address);
    await dao.executeProposal(1);
    const after = await ethers.provider.getBalance(employee.address);

    expect(after).to.be.gt(before);
  });
});
