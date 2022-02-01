import {
  ConvergentCurvePool__factory,
  ConvergentPoolFactory,
  ERC20,
  USDC,
  Vault,
  WETH,
} from "@elementfi/core-typechain";
import { Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ONE_YEAR_IN_SECONDS, SIX_MONTHS_IN_SECONDS } from "src/time";

const defaultOptions = {
  swapFee: ".1",
  durationInSeconds: SIX_MONTHS_IN_SECONDS,
  tParam: ONE_YEAR_IN_SECONDS,
};

export async function deployConvergentPool(
  signer: Signer,
  convergentPoolFactory: ConvergentPoolFactory,
  balancerVaultContract: Vault,
  baseAssetContract: WETH | USDC,
  yieldAssetContract: ERC20,
  options?: {
    swapFee?: string;
    durationInSeconds?: number;
    tParam?: number;
  }
) {
  const { swapFee, durationInSeconds } = { ...defaultOptions, ...options };
  const baseAssetSymbol = await baseAssetContract.symbol();

  // hardcoding this for now until i understand how to tweak this in combination with seed token
  // amounts to get desired yield asset price
  const tParam = Math.round(ONE_YEAR_IN_SECONDS * 10);

  const dateInMilliseconds = Date.now();
  const dateInSeconds = dateInMilliseconds / 1000;
  const expiration = Math.round(dateInSeconds + durationInSeconds);

  const createTx = await convergentPoolFactory.create(
    baseAssetContract.address,
    yieldAssetContract.address,
    expiration,
    tParam,
    parseEther(swapFee),
    `Element ${baseAssetSymbol} - fy${baseAssetSymbol}`,
    `${baseAssetSymbol}-fy${baseAssetSymbol}`
  );
  await createTx.wait(1);
  await createTx.wait(1);

  // grab last poolId from last event
  const newPools = convergentPoolFactory.filters.CCPoolCreated(null, null);
  const results = await convergentPoolFactory.queryFilter(newPools);
  const poolAddresses: string[] = results.map((result) => result.args?.[0]);
  const poolAddress = poolAddresses[poolAddresses.length - 1];

  const poolContract = ConvergentCurvePool__factory.connect(
    poolAddress,
    signer
  );
  const poolId = await poolContract.getPoolId();

  return { poolId, poolContract };
}
