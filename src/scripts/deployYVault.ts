import { TestYVault__factory } from "@elementfi/core-typechain";
import { Signer } from "ethers";

// TODO: update TestYVault to accept name/symbol
export async function deployYearnVault(
  signer: Signer,
  baseAssetAddress: string,
  decimals: number,
  name: string,
  symbol: string
) {
  const deployer = new TestYVault__factory(signer);
  return deployer.deploy(baseAssetAddress, decimals);
}
