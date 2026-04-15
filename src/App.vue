<template lang="pug">
v-app
  v-app-bar(app) Test Vaults Registry
  v-main
    v-container(fluid)
      div(v-if="isDrizzleInitialized", id="app")
        Section(
          :config="config"
          :allConfig="allConfig"
          :chainId="chainId"
          :chainCoin="chainCoin"
          :chainExplorer="chainExplorer"
          :is-drizzle-ready="isDrizzleInitialized"
        )
      div(v-else , id="app")
        v-progress-linear(indeterminate color="primary")
        p(class="text-center mt-4") Connecting to blockchain...
</template>
<script>
import config from "./config.js";
import chains from "./chains.json";
import Vault from "./Vault";
import Home from "./Home";
import NotFound from "./NotFound";
import { mapGetters } from "vuex";
import Web3 from "web3";

const vaultPath = window.location.pathname.substring(1);
const vaultConfig = config[vaultPath] || null;

let VaultType;

switch (window.location.pathname) {
  default:
    VaultType = Object.prototype.hasOwnProperty.call(config, vaultPath)
      ? Vault
      : NotFound;
}

/*
const VaultType = window.location.pathname === '/yvsteth' ? LidoVault : (
  Object.prototype.hasOwnProperty.call(config, vaultPath) ? Vault : NotFound
)
*/

const Section = window.location.pathname === "/" ? Home : VaultType;

let web3 = new Web3(Web3.givenProvider);
window.ethereum.on("chainChanged", (chainIdHex) => window.location.reload());

export default {
  name: "app",
  components: {
    Section,
  },
  data() {
    return {
      config: vaultConfig,
      allConfig: config,
      isHome: window.location.pathname === "/",
      chainId: 0,
      // Add caching for chain ID to prevent excessive requests
      chainIdCache: null,
      lastChainCheck: 0,
      chainCheckInterval: 30000, // 30 seconds
    };
  },
  async created() {
    // Initialize chain ID and listen for changes
    await this.updateChainId();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        this.updateChainId();
        window.location.reload();
      });
    }
  },
  methods: {
    async updateChainId() {
      const now = Date.now();

      if (this._chainIdCache && (now - this._lastChainCheck) <= this._chainCheckInterval) {
        this.chainId = this._chainIdCache;
        return;
      }

      let detectedChainId = null;

      if (this.isDrizzleInitialized && this.drizzleInstance?.web3?.eth?.getChainId) {
        try {
          detectedChainId = await this.drizzleInstance.web3.eth.getChainId();
        } catch (error) {
          console.warn("Drizzle getChainId failed, falling back", error);
        }
      }

      if (!detectedChainId && typeof window !== "undefined" && window.ethereum) {
        try {
          const raw = await window.ethereum.request({ method: "eth_chainId" });
          detectedChainId = parseInt(raw, 16);
        } catch (error) {
          console.warn("window.ethereum chainId request failed", error);
        }
        if (!detectedChainId && window.ethereum?.chainId) {
          const raw = window.ethereum.chainId;
          detectedChainId = raw.startsWith("0x") ? parseInt(raw, 16) : Number(raw);
        }
        if (!detectedChainId && window.ethereum?.networkVersion) {
          detectedChainId = Number(window.ethereum.networkVersion);
        }
      }

      if (detectedChainId) {
        this._chainIdCache = detectedChainId;
        this._lastChainCheck = now;
        this.chainId = detectedChainId;
      } else {
        this.chainId = this._chainIdCache || 0;
      }
    },
  },
  watch: {
    isDrizzleInitialized: {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          await this.updateChainId();
        }
      },
    },
  },
  computed: {
    ...mapGetters("drizzle", ["isDrizzleInitialized", "drizzleInstance"]),
    chainName() {
      if (this.chainId) {
        return chains[this.chainId]?.name;
      }
      return 'Unknown Network';
    },
    chainCoin() {
      if (this.chainId) {
        return chains[this.chainId]?.coin;
      }
      return 'ETH';
    },
    chainExplorer() {
      if (this.chainId) {
        return chains[this.chainId]?.block_explorer;
      }
      return '';
    },
  },
};
</script>
