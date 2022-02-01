import { BasePool__factory, Vault__factory } from "@elementfi/core-typechain";
import { Provider } from "@ethersproject/providers";
import { BigNumber, Signer } from "ethers";

interface ReservesResult {
  /**
   * addresses of tokens
   */
  tokens: string[];
  /**
   * reserves of tokens in same order as tokens
   */
  reserves: BigNumber[];
}
/**
 * Returns the reserves for a given pool.
 * @param poolAddress any pool with a getPoolId method
 * @param balancerVaultAddress the address of the balancer v2 vault
 * @param signerOrProvider
 */
export async function getReserves(
  poolAddress: string,
  balancerVaultAddress: string,
  signerOrProvider: Signer | Provider
): Promise<ReservesResult> {
  const balancerVault = Vault__factory.connect(
    balancerVaultAddress,
    signerOrProvider
  );

  const poolContract = BasePool__factory.connect(poolAddress, signerOrProvider);

  const poolId = await poolContract.getPoolId();
  const poolTokens = await balancerVault.getPoolTokens(poolId);

  return {
    tokens: poolTokens.tokens,
    reserves: poolTokens.balances,
  };
}
