async function main() {
  const [d, m2] = await ethers.getSigners();
  console.log("Deployer:", d.address);

  const DAO = await ethers.getContractFactory("PayrollDAO");
  const dao = await DAO.deploy([d.address, m2.address]);
  await dao.waitForDeployment?.();

  await d.sendTransaction({
    to: await dao.getAddress?.() ?? dao.target,
    value: ethers.parseEther("1")
  });

  console.log("DAO deployed to:", await dao.getAddress?.() ?? dao.target);
}
main();
