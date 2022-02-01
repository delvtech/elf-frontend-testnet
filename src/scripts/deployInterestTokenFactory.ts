import { InterestTokenFactory__factory } from "@elementfi/core-typechain";
import { Signer } from "ethers";

export async function deployInterestTokenFactory(signer: Signer) {
  const tokenFactoryDeployer = new InterestTokenFactory__factory(signer);
  const tokenFactoryContract = await tokenFactoryDeployer.deploy();
  await tokenFactoryContract.deployed();

  return tokenFactoryContract;
}
