async function main() {
  const [d, m2, emp] = await ethers.getSigners();

  const DAO = await ethers.getContractFactory("PayrollDAO");
  const dao = await DAO.deploy([d.address, m2.address]);
  await dao.waitForDeployment?.();

  console.log("DAO:", await dao.getAddress?.() ?? dao.target);

  const salary = ethers.parseEther("0.05");

  await dao.createProposal(0, emp.address, salary);
  await dao.vote(0,true);
  await dao.connect(m2).vote(0,true);
  await dao.executeProposal(0);

  console.log("Employee added:", emp.address);

  await dao.createProposal(3, emp.address, salary);
  await dao.vote(1,true);
  await dao.connect(m2).vote(1,true);
  await dao.executeProposal(1);

  console.log("Salary released to:", emp.address);
}
main();
