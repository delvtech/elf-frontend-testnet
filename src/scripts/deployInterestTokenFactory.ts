import { Signer } from "ethers";

import { InterestTokenFactory__factory } from "src/types/factories/InterestTokenFactory__factory";

export async function deployInterestTokenFactory(signer: Signer) {
  const tokenFactoryDeployer = new InterestTokenFactory__factory(signer);
  const tokenFactoryContract = await tokenFactoryDeployer.deploy();
  await tokenFactoryContract.deployed();

  return tokenFactoryContract;
}
