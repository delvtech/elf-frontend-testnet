import { Signer } from "ethers";

import { Vault__factory } from "src/types/factories/Vault__factory";
import { WETH } from "src/types/WETH";

export async function deployBalancerVault(signer: Signer, wethContract: WETH) {
  const wethAddress = wethContract.address;
  const signerAddress = await signer.getAddress();
  const vaultDeployer = new Vault__factory(signer);
  const vaultContract = await vaultDeployer.deploy(
    signerAddress,
    wethAddress,
    0,
    0
  );

  await vaultContract.deployed();

  return vaultContract;
}
