import {
  ConvergentPoolFactory,
  ERC20,
  InterestToken__factory,
  TrancheFactory,
  USDC,
  Vault,
  WeightedPoolFactory,
  WETH,
  YVaultAssetProxy,
} from "@elementfi/core-typechain";
import { Signer } from "ethers";
import { deployConvergentPool } from "src/scripts/deployConvergentPool";
import { setupPrincipalTokenPool } from "src/scripts/setupPrincipalToken";
import { SIX_MONTHS_IN_SECONDS } from "src/time";
import { deployTranche } from "./deployTranche";
import { setupInterestTokenPool } from "./setupInterestTokenPool";

const defaultOptions = {
  swapFeeConvergentCurvePool: "0.1",
  swapFeeWeightedPool: ".003",
  durationInSeconds: SIX_MONTHS_IN_SECONDS,
};

export async function deployTrancheAndMarket(
  signer: Signer,
  trancheFactory: TrancheFactory,
  yearnVaultAssetProxy: YVaultAssetProxy,
  baseAssetContract: WETH | USDC,
  balancerVaultContract: Vault,
  convergentPoolFactory: ConvergentPoolFactory,
  weightedPoolFactory: WeightedPoolFactory,
  options: {
    swapFeeConvergentCurvePool?: string;
    swapFeeWeightedPool?: string;
    durationInSeconds?: number;
    baseAssetIn: string;
    yieldAssetIn: string;
    ytBaseAssetIn: string;
    ytYieldAssetIn: string;
    mintAmount: string;
  }
) {
  const {
    swapFeeConvergentCurvePool,
    swapFeeWeightedPool,
    durationInSeconds,
    baseAssetIn,
    yieldAssetIn,
    ytBaseAssetIn,
    ytYieldAssetIn,
    mintAmount,
  } = {
    ...defaultOptions,
    ...options,
  };

  const expiration = durationInSeconds + Math.round(Date.now() / 1000);

  // deploy a tranche
  const trancheContract = await deployTranche(
    signer,
    trancheFactory,
    yearnVaultAssetProxy,
    expiration
  );
  const interestTokenAddress = await trancheContract.interestToken();
  const interestTokenContract = InterestToken__factory.connect(
    interestTokenAddress,
    signer
  );

  // deploy an FYT market, seed with base asset
  const { poolId: fytPoolId, poolContract: fytPoolContract } =
    await deployConvergentPool(
      signer,
      convergentPoolFactory,
      balancerVaultContract,
      baseAssetContract,
      trancheContract as unknown as ERC20,
      { swapFee: swapFeeConvergentCurvePool, durationInSeconds }
    );

  // seed market with initial yield asset
  await setupPrincipalTokenPool(
    signer,
    balancerVaultContract,
    fytPoolId,
    baseAssetContract,
    trancheContract,
    { mintAmount, baseAssetIn, yieldAssetIn }
  );

  // now setup a yc market
  const { poolId: ycPoolId, poolContract: ycPoolContract } =
    await setupInterestTokenPool(
      signer,
      trancheContract,
      balancerVaultContract,
      baseAssetContract,
      weightedPoolFactory,
      {
        swapFee: swapFeeWeightedPool,
        baseAssetIn: ytBaseAssetIn,
        yieldAssetIn: ytYieldAssetIn,
      }
    );

  return {
    trancheContract,
    interestTokenContract,
    fytPoolContract,
    fytPoolId,
    ycPoolContract,
    ycPoolId,
  };
}
