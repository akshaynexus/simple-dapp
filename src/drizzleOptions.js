import ERC20 from "./abi/ERC20.json";
import yVaultV2 from "./abi/yVaultV2.json";
import LidoVault from "./abi/LidoVault.json";
import yStrategy from "./abi/yStrategy.json";

import Web3 from "web3";
let web3 = new Web3(Web3.givenProvider);

const options = (config) => ({
  web3: {
    block: false,
  },
  syncAlways: false,
  contracts:
    config !== null
      ? [
          {
            contractName: "Vault", //yvzLOT
            web3Contract: new web3.eth.Contract(
              config.VAULT_ABI,
              config.VAULT_ADDR
            ),
          },
          {
            contractName: "WANT", //zLOT
            web3Contract: new web3.eth.Contract(ERC20, config.WANT_ADDR),
          },
          {
            contractName: "YFI", //YFI to approve bribe
            web3Contract: new web3.eth.Contract(ERC20, ""),
          },
        ]
      : [],
  events: {},
  polls: {
    accounts: 10000,
    blocks: false,
  },
});

export default options;
