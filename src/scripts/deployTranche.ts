import {
  TrancheFactory,
  Tranche__factory,
  YVaultAssetProxy,
} from "@elementfi/core-typechain";
import { Signer } from "ethers";
import { getTerms } from "src/helpers/getTerms";

export async function deployTranche(
  signer: Signer,
  trancheFactoryContract: TrancheFactory,
  yearnVaultAssetProxy: YVaultAssetProxy,
  expirationTimeInUnixSeconds: number
) {
  const txReceipt = await trancheFactoryContract.deployTranche(
    expirationTimeInUnixSeconds,
    yearnVaultAssetProxy.address
  );
  await txReceipt.wait(1);

  const trancheAddresses = await getTerms(
    trancheFactoryContract.address,
    yearnVaultAssetProxy.address,
    signer
  );

  const lastTrancheDeployed = trancheAddresses[trancheAddresses.length - 1];
  const trancheContract = Tranche__factory.connect(lastTrancheDeployed, signer);
  return trancheContract;
}
