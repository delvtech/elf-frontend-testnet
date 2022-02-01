import {
  InterestTokenFactory,
  TestDate,
  TrancheFactory__factory,
} from "@elementfi/core-typechain";
import { Signer } from "ethers";

export async function deployTrancheFactory(
  signer: Signer,
  interestTokenFactoryContract: InterestTokenFactory,
  dateLibraryContract: TestDate
) {
  const interestTokenFactoryAddress = interestTokenFactoryContract.address;
  const dateLibraryAddress = dateLibraryContract.address;
  const trancheFactoryDeployer = new TrancheFactory__factory(signer);
  const trancheFactoryContract = await trancheFactoryDeployer.deploy(
    interestTokenFactoryAddress,
    dateLibraryAddress
  );

  await trancheFactoryContract.deployed();

  return trancheFactoryContract;
}
