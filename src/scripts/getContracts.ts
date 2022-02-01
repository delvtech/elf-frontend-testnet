import {
  ConvergentCurvePool__factory,
  ConvergentPoolFactory__factory,
  Tranche__factory,
  USDC__factory,
  UserProxy__factory,
  Vault__factory,
  WeightedPoolFactory__factory,
  WETH__factory,
} from "@elementfi/core-typechain";
import { Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import addresses from "src/all-addresses.json";

export function getContracts(hre: HardhatRuntimeEnvironment, signer?: Signer) {
  const {
    balancerVaultAddress,
    wethAddress,
    usdcAddress,
    convergentPoolFactoryAddress,
    weightedPoolFactoryAddress,
    wethTrancheAddress,
    marketFyWethAddress,
    usdcTrancheAddress,
    marketFyUsdcAddress,
    userProxyContractAddress,
  } = addresses;
  const { provider } = hre.ethers;
  const balancerVaultContract = Vault__factory.connect(
    balancerVaultAddress,
    signer ?? provider
  );
  const wethContract = WETH__factory.connect(wethAddress, signer ?? provider);
  const usdcContract = USDC__factory.connect(usdcAddress, signer ?? provider);

  const convergentPoolFactory = ConvergentPoolFactory__factory.connect(
    convergentPoolFactoryAddress,
    signer ?? provider
  );
  const weightedPoolFactory = WeightedPoolFactory__factory.connect(
    weightedPoolFactoryAddress,
    signer ?? provider
  );

  const wethTrancheContract = Tranche__factory.connect(
    wethTrancheAddress,
    signer ?? provider
  );

  const marketFyWethContract = ConvergentCurvePool__factory.connect(
    marketFyWethAddress,
    signer ?? provider
  );
  const usdcTrancheContract = Tranche__factory.connect(
    usdcTrancheAddress,
    signer ?? provider
  );

  const marketFyUsdcContract = ConvergentCurvePool__factory.connect(
    marketFyUsdcAddress,
    signer ?? provider
  );

  const userProxyContract = UserProxy__factory.connect(
    userProxyContractAddress,
    signer ?? provider
  );

  return {
    balancerVaultContract,
    wethContract,
    usdcContract,
    convergentPoolFactory,
    weightedPoolFactory,
    wethTrancheContract,
    marketFyWethContract,
    usdcTrancheContract,
    marketFyUsdcContract,
    userProxyContract,
  };
}
