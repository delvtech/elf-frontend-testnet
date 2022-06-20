import "@nomiclabs/hardhat-waffle";
import "hardhat-tracer";
import {
  extendEnvironment,
  HardhatUserConfig,
  task,
  types,
} from "hardhat/config";
import "module-alias/register";
import manipulateTokenBalances from "./src/scripts/manipulateTokenBalances";

task("intervalMining", "Mine blocks on an interval")
  .addOptionalParam(
    "interval",
    "ms interval to mine blocks at. default is 10s",
    10000,
    types.int
  )
  .setAction(async (taskArgs, hre) => {
    const { interval = 10000 } = taskArgs;
    console.log("Disabling automine");
    await hre.ethers.provider.send("evm_setAutomine", [false]);
    console.log("Setting mining interval to", interval);
    await hre.ethers.provider.send("evm_setIntervalMining", [interval]);
  });

task("autoMine", "Mine blocks on every transaction automatically").setAction(
  async (_, hre) => {
    console.log("Enabling automine");
    await hre.ethers.provider.send("evm_setAutomine", [true]);
    console.log("Disabling interval");
    await hre.ethers.provider.send("evm_setIntervalMining", [0]);
  }
);

task(
  "manipulateTokenBalances",
  "Sets storage slots on an array of ERC20 functions"
).setAction(async (_, hre) => {
  const [, { address }] = await hre.ethers.getSigners();
  await manipulateTokenBalances(address, hre.ethers.provider);
});

extendEnvironment((hre) => {
  hre.run("manipulateTokenBalances");
});

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/kwjMP-X-Vajdk1ItCfU-56Uaq1wwhamK",
        blockNumber: 14468156,
      },
      accounts: { count: 5 },
    },
  },
};

export default config;
