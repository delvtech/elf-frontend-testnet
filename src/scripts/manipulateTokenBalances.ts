import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { ERC20__factory } from "src/types/factories/ERC20__factory";
import { mainnetTokenList } from "@elementfi/tokenlist";

enum ContractLanguage {
  Solidity,
  Vyper,
}

// findBalancesSlot works by iterating across the first 100 slots for a given
// contract address. Notwithstanding a minute difference in mapping
// construction in solidity versus vyper contract, it works in each case by
// updating a potential balance slot, checking the balance for the test address
// (the zero address), and then seeing if matches. After each check, the slot is
// reset to its original value
async function findBalancesSlot(
  address: string,
  lang: ContractLanguage,
  provider: JsonRpcProvider
): Promise<number> {
  const account = ethers.constants.AddressZero;
  const probeA = ethers.utils.defaultAbiCoder.encode(["uint"], [1]);
  const probeB = ethers.utils.defaultAbiCoder.encode(["uint"], [2]);

  const token = ERC20__factory.connect(address, provider);

  for (let i = 0; i < 100; i++) {
    let probedSlot = ethers.utils.keccak256(
      lang === ContractLanguage.Solidity
        ? ethers.utils.defaultAbiCoder.encode(["address", "uint"], [account, i])
        : ethers.utils.defaultAbiCoder.encode(["uint", "address"], [i, account])
    );

    if (probedSlot.startsWith("0x0")) probedSlot = "0x" + probedSlot.slice(3);

    const prev = await provider.send("eth_getStorageAt", [
      address,
      probedSlot,
      "latest",
    ]);

    const probe = prev === probeA ? probeB : probeA;

    await provider.send("hardhat_setStorageAt", [address, probedSlot, probe]);

    const balance = await token.balanceOf(account);

    await provider.send("hardhat_setStorageAt", [address, probedSlot, prev]);

    if (balance.eq(ethers.BigNumber.from(probe))) return i;
  }
  throw "Balances slot not found!";
}

const AMOUNT = "10000";

export default async function manipulateTokenBalances(
  recipient: string,
  provider: JsonRpcProvider
) {
  return await Promise.all(
    mainnetTokenList.tokens
      .filter(
        (token) =>
          token.tags === undefined || token.tags.some((tag) => tag === "curve")
      )
      .filter((token) =>
        [
          "DAI",
          "USDC",
          "MIM",
          "LUSD",
          "3CRV",
          "alUSD",
          "USDT",
          "WETH",
          "stETH",
          "EURS",
          "LUSD3CRV-f",
          "alUSD3CRV-f",
          "MIM-3LP3CRV-f",
          "crv3crypto",
          "crvTricrypto",
          "steCRV",
          "eursCRV",
          "WBTC",
          // "ETH",
          // "sEUR",
        ].some((t) => t === token.symbol)
      )
      .map(
        async ({
          //name,
          address,
          tags,
        }) => {
          const isCurve = tags && tags.some((tag) => tag === "curve");

          const slot = await findBalancesSlot(
            address,
            isCurve ? ContractLanguage.Vyper : ContractLanguage.Solidity,
            provider
          );
          const token = ERC20__factory.connect(address, provider);

          const index = ethers.utils.solidityKeccak256(
            ["uint256", "uint256"],
            !isCurve ? [recipient, slot] : [slot, recipient]
          );

          const decimals = await token.decimals();
          const adjustedAmount = ethers.utils.parseUnits(AMOUNT, decimals);

          await provider.send("hardhat_setStorageAt", [
            address,
            index,
            ethers.utils.defaultAbiCoder.encode(["uint"], [adjustedAmount]),
          ]);
        }
      )
  );
}
