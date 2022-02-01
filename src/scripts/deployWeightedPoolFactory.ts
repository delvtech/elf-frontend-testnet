import { Vault, WeightedPoolFactory__factory } from "@elementfi/core-typechain";
import { Signer } from "ethers";

export async function deployWeightedPoolFactory(
  signer: Signer,
  balancerVaultContract: Vault
) {
  const signerAddress = await signer.getAddress();
  const balancerVaultAddress = balancerVaultContract.address;
  const deployer = new WeightedPoolFactory__factory(signer);
  const weightedPoolFactoryContract = await deployer.deploy(
    balancerVaultAddress
  );

  await weightedPoolFactoryContract.deployed();
  await balancerVaultContract.setRelayerApproval(
    signerAddress,
    weightedPoolFactoryContract.address,
    true
  );

  return weightedPoolFactoryContract;
}
