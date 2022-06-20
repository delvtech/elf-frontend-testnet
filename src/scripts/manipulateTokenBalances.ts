import { ERC20__factory } from "@elementfi/core-typechain";
import { mainnetTokenList, TokenInfo, TokenTag } from "@elementfi/tokenlist";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";

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

const AMOUNT = "5000";

export default async function manipulateTokenBalances(
  recipient: string,
  provider: JsonRpcProvider
) {
  const manipulatableTokens = mainnetTokenList.tokens
    .filter(
      (token) =>
        token.tags === undefined ||
        token.tags === [] ||
        token.tags.some((tag) => tag === TokenTag.CURVE)
    )
    .filter(
      (token) => !["ETH", "sEUR"].some((symbol) => symbol === token.symbol)
    );

  const isCurveToken = (token: TokenInfo) =>
    token.tags?.some((tag) => tag === TokenTag.CURVE);
  const vyperBasedTokens = manipulatableTokens.filter(isCurveToken);
  const solidityBasedTokens = manipulatableTokens.filter(
    (t) => !isCurveToken(t)
  );

  for (const token of solidityBasedTokens) {
    const slot = await findBalancesSlot(
      token.address,
      ContractLanguage.Solidity,
      provider
    );

    const erc20 = ERC20__factory.connect(token.address, provider);

    const index = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [recipient, slot]
    );

    const decimals = await erc20.decimals();
    const adjustedAmount = ethers.utils.parseUnits(AMOUNT, decimals);

    await provider.send("hardhat_setStorageAt", [
      token.address,
      index,
      ethers.utils.defaultAbiCoder.encode(["uint"], [adjustedAmount]),
    ]);
  }

  for (const token of vyperBasedTokens) {
    const slot = await findBalancesSlot(
      token.address,
      ContractLanguage.Vyper,
      provider
    );

    const erc20 = ERC20__factory.connect(token.address, provider);

    const index = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [slot, recipient]
    );

    const decimals = await erc20.decimals();
    const adjustedAmount = ethers.utils.parseUnits(AMOUNT, decimals);

    await provider.send("hardhat_setStorageAt", [
      token.address,
      index,
      ethers.utils.defaultAbiCoder.encode(["uint"], [adjustedAmount]),
    ]);
  }
}

// async function main() {
//   await manipulateTokenBalances(
//     "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
//     provider
//   );
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
