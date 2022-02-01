import {
  Tranche,
  USDC,
  WETH,
  YVaultAssetProxy__factory,
} from "@elementfi/core-typechain";
import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { MAX_ALLOWANCE } from "../maxAllowance";

export async function mintTrancheAssets(
  signer: Signer,
  baseAssetContract: WETH | USDC,
  trancheContract: Tranche,
  baseAssetAmountIn: string
) {
  const signerAddress = await signer.getAddress();

  // allow tranche contract to take signers's base asset tokens
  await baseAssetContract
    .connect(signer)
    .approve(trancheContract.address, MAX_ALLOWANCE);

  const wrappedPositionAddress = await trancheContract.position();
  const wrappedPositionContract = YVaultAssetProxy__factory.connect(
    wrappedPositionAddress,
    signer
  );
  await baseAssetContract
    .connect(signer)
    .approve(wrappedPositionContract.address, MAX_ALLOWANCE);

  const baseAssetDecimals = await baseAssetContract.decimals();
  const baseAssetDeposit = parseUnits(baseAssetAmountIn, baseAssetDecimals);

  // deposit base asset into tranche contract
  const depositTx = await trancheContract.deposit(
    baseAssetDeposit,
    signerAddress
  );

  await depositTx.wait(1);

  return depositTx;
}
