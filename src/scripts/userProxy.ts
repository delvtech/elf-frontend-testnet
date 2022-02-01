import { Signer } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";

import {
  UserProxy__factory,
  TrancheFactory,
  UserProxy,
  WETH,
} from "@elementfi/core-typechain";
// TODO: figure out how to alias the artifacts/ directory
import trancheData from "../../artifacts/src/contracts/Tranche.sol/Tranche.json";

export async function deployUserProxy(
  signer: Signer,
  wethContract: WETH,
  trancheFactory: TrancheFactory
): Promise<UserProxy> {
  const bytecodeHash = solidityKeccak256(["bytes"], [trancheData.bytecode]);
  const UserProxyDeployer = new UserProxy__factory(signer);
  const userProxyContract = await UserProxyDeployer.deploy(
    wethContract.address,
    trancheFactory.address,
    bytecodeHash
  );

  return userProxyContract;
}
