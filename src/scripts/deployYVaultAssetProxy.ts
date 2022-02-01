import { YVaultAssetProxy__factory } from "@elementfi/core-typechain";
import { Signer } from "ethers";

export async function deployYearnVaultAssetProxy(
  signer: Signer,
  yearnVaultAddress: string,
  baseAssetAddress: string,
  name: string,
  symbol: string
) {
  const deployer = new YVaultAssetProxy__factory(signer);
  return await deployer.deploy(
    yearnVaultAddress,
    baseAssetAddress,
    name,
    symbol
  );
}
