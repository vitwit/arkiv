import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying Arkiv contract...");
  console.log("Deployer address:", deployer);

  const deployedArkiv = await deploy("Arkiv", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
  });

  console.log(`Arkiv contract deployed at: ${deployedArkiv.address}`);
  console.log(`Transaction hash: ${deployedArkiv.transactionHash}`);
  
  // Verify deployment
  if (deployedArkiv.newlyDeployed) {
    console.log("✅ Arkiv contract newly deployed");
  } else {
    console.log("ℹ️  Arkiv contract already deployed");
  }
};

export default func;
func.id = "deploy_arkiv"; // id required to prevent reexecution
func.tags = ["Arkiv"];