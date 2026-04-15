import fs from "fs";
import path from "path";

import { createPublicClient, http } from "viem";
import { bsc } from "viem/chains";

const yVaultV2 = JSON.parse(
  fs.readFileSync(path.resolve("src/abi/yVaultV2.json"), "utf8")
);

const ERC20_ABI = [
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
];

const RPC_URLS = [
  "https://binance.llamarpc.com",
  "https://1rpc.io/bnb",
  "https://rpc.poolz.finance/bsc",
  "https://binance-smart-chain-public.nodies.app",
  "https://public-bsc-mainnet.fastnode.io",
  "https://bsc.therpc.io",
  "https://public-bsc.nownodes.io",
];

const clients = RPC_URLS.map((url) => ({
  url,
  client: createPublicClient({
    chain: bsc,
    transport: http(url, {
      timeout: 20_000,
      retryCount: 2,
    }),
    batch: {
      multicall: true,
    },
  }),
}));

const vaults = [
  { key: "vai-vault", address: "0xad6b79f4Beaef46DEad4b6A4188fd7c14Bf07c57", title: "VAI Vault" },
  { key: "icream-bnb", address: "0x9A6ddBe926f01ecd0c51CBAdABFE01Dfd0D417D9", title: "iCream BNB" },
  { key: "another-icream-bnb", address: "0xde5119aD6FA09c5F6A0E7c62bb56cdf44031d917", title: "Another iCream BNB" },
  { key: "yetanothericream-bnb", address: "0x3b2679c9AECf2111ea0169F6e5d21976EDB0E27A", title: "Yet Another iCream BNB" },
  { key: "icreamstake", address: "0xDD715A2537aAc71317e07BF28655DA51f0897Bd7", title: "iCream Stake" },
  { key: "anothernew-icream-bnb", address: "0x8aA5279EA08A699860860fd492AC6469B19baEF5", title: "Another New iCream BNB" },
  { key: "isoak-bnb", address: "0x007109F96f9AA2523f283Faac074a1887EcCFF1a", title: "iSoak BNB" },
  { key: "egg", address: "0xe99EA79F9C3BF03Fe7D0F76dbf6c9DCC738Eb26F", title: "EGG Vault" },
  { key: "brew", address: "0x07409eC5a1a8309067223409926b32acED85f91B", title: "Brew Vault" },
  { key: "nyanethlp", address: "0x72B6389294c96D84122B65a7F01d73B08B5DBD42", title: "Nyan ETH LP" },
  { key: "smoke", address: "0x005Ad6Db36161526100711fE2F359e9Ed9893aae", title: "Smoke Vault" },
  { key: "taco-bnb-lp", address: "0x825fa148Fc45e6A79441746d4dD5379272EEdb8c", title: "Taco BNB LP" },
  { key: "three-eps", address: "0xEe30c4d787117965c867Db395243f0a5845917fa", title: "3EPS Vault" },
  { key: "busd-new", address: "0x563f3DC2D04B6C9622236F017084456Abea05602", title: "BUSD Vault" },
  { key: "wbnb", address: "0xE1CBDCDbcf7F8Fa6Dca9c1406d0bf27C308890Ec", title: "WBNB Vault" },
];

function chunkArray(array, chunkCount) {
  const result = Array.from({ length: chunkCount }, () => []);
  array.forEach((item, index) => {
    result[index % chunkCount].push(item);
  });
  return result;
}

async function fetchAllVaults() {
  const chunks = chunkArray(vaults, clients.length);
  const chunkResults = await Promise.all(
    chunks.map((chunk, index) =>
      processChunk(clients[index % clients.length], chunk)
    )
  );

  const flattened = chunkResults.flat();
  const needsFallback = flattened.filter((entry) => entry && !entry.complete);

  for (const entry of needsFallback) {
    const fallbackData = await fetchWithFallback(entry.vault);
    if (fallbackData) {
      Object.assign(entry, fallbackData, { complete: true });
    }
  }

  return flattened.map((entry) => (entry ? normalizeResult(entry) : null));
}

function normalizeResult(entry) {
  if (!entry) return null;
  const { vault, wantAddress, wantSymbol, wantName, wantDecimals } = entry;
  if (!wantAddress || !wantSymbol || wantDecimals === null || Number.isNaN(wantDecimals)) {
    console.warn(`Skipping ${vault.key} due to incomplete data`);
    return null;
  }
  return {
    key: vault.key,
    title: vault.title,
    vaultAddress: vault.address,
    wantAddress,
    wantSymbol,
    wantName,
    wantDecimals,
  };
}

async function processChunk(clientEntry, chunk) {
  if (!chunk.length) return [];

  const client = clientEntry.client;

  const tokenContracts = chunk.map((vault) => ({
    address: vault.address,
    abi: yVaultV2,
    functionName: "token",
  }));

  let tokenResults = [];
  try {
    tokenResults = await client.multicall({
      contracts: tokenContracts,
      allowFailure: true,
    });
  } catch (error) {
    console.error("Multicall token lookup failed:", error);
    tokenResults = chunk.map(() => ({ status: "failure" }));
  }

  const outputs = [];

  for (let i = 0; i < chunk.length; i++) {
    const vault = chunk[i];
    const tokenResult = tokenResults[i];
    let wantAddress = null;

    if (tokenResult && tokenResult.status === "success") {
      wantAddress = tokenResult.result;
    }

    let wantSymbol = "";
    let wantName = "";
    let wantDecimals = null;

    let complete = false;

    if (wantAddress) {
      try {
        const infoCalls = await client.multicall({
          allowFailure: true,
          contracts: [
            { address: wantAddress, abi: ERC20_ABI, functionName: "symbol" },
            { address: wantAddress, abi: ERC20_ABI, functionName: "name" },
            { address: wantAddress, abi: ERC20_ABI, functionName: "decimals" },
          ],
        });

        const [symbolCall, nameCall, decimalsCall] = infoCalls;
        wantSymbol = symbolCall.status === "success" ? symbolCall.result : "";
        wantName = nameCall.status === "success" ? nameCall.result : "";
        wantDecimals =
          decimalsCall.status === "success"
            ? Number(decimalsCall.result)
            : null;

        complete =
          Boolean(wantAddress) &&
          Boolean(wantSymbol) &&
          wantDecimals !== null &&
          !Number.isNaN(wantDecimals);
      } catch (error) {
        console.error(`Failed to fetch want metadata for ${vault.key}:`, error);
      }
    }

    outputs.push({
      vault,
      wantAddress,
      wantSymbol,
      wantName,
      wantDecimals,
      complete,
    });
  }

  return outputs;
}

async function fetchWithFallback(vault) {
  for (const { client, url } of clients) {
    try {
      const wantAddress = await client.readContract({
        address: vault.address,
        abi: yVaultV2,
        functionName: "token",
      });

      const infoCalls = await client.multicall({
        allowFailure: true,
        contracts: [
          { address: wantAddress, abi: ERC20_ABI, functionName: "symbol" },
          { address: wantAddress, abi: ERC20_ABI, functionName: "name" },
          { address: wantAddress, abi: ERC20_ABI, functionName: "decimals" },
        ],
      });

      const [symbolCall, nameCall, decimalsCall] = infoCalls;

      return {
        vault,
        wantAddress,
        wantSymbol: symbolCall.status === "success" ? symbolCall.result : "",
        wantName: nameCall.status === "success" ? nameCall.result : "",
        wantDecimals:
          decimalsCall.status === "success"
            ? Number(decimalsCall.result)
            : null,
        complete:
          symbolCall.status === "success" &&
          decimalsCall.status === "success" &&
          !Number.isNaN(Number(decimalsCall.result)),
      };
    } catch (error) {
      console.error(
        `Fallback attempt failed for ${vault.key} on ${url}:`,
        error
      );
    }
  }

  console.error(`All fallback attempts failed for ${vault.key}`);
  return null;
}

async function main() {
  const results = await fetchAllVaults();
  const successful = results.filter(Boolean);

  console.table(
    successful.map((entry) => ({
      key: entry.key,
      vault: entry.vaultAddress,
      want: entry.wantAddress,
      symbol: entry.wantSymbol,
      decimals: entry.wantDecimals,
    }))
  );

  console.log(
    JSON.stringify(
      successful,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    )
  );
}

main().catch((error) => {
  console.error("Unexpected error", error);
  process.exit(1);
});
