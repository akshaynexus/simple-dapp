<template lang="pug">
v-app
  v-app-bar(app flat color="surface" height="64")
    v-container(max-width="1440" class="py-0")
      v-row(align="center" no-gutters)
        v-col(cols="12")
          .app-bar__content
            v-avatar(size="40" color="primary" class="mr-4")
              v-icon(color="white") mdi-bank-multiple
            .app-bar__title
              h1.text-h6.font-weight-medium.ma-0 Vaults Registry
              p.text-caption.text-medium-emphasis.ma-0 Discover automated DeFi strategies
            v-spacer
            .app-bar__chips
              v-chip(
                v-if="chainName"
                size="small"
                variant="outlined"
                :color="getChainColor(chainCoin)"
              )
                v-icon(size="16" start) mdi-link-variant
                | {{ chainName }}
              v-chip(
                v-if="chainCoin"
                size="small"
                variant="text"
              )
                v-icon(size="16" start) mdi-currency-usd
                | {{ chainCoin }}

  v-main
    v-container(max-width="1440" class="py-3 home-layout")
      template(v-if="isSkeletonActive")
        v-row
          v-col(cols="12")
            v-card.hero-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line")
        v-row(class="mt-6" dense)
          v-col(cols="12" md="6")
            v-card.section-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line")
          v-col(cols="12" md="6")
            v-card.section-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line")
        v-row(class="mt-6" dense)
          v-col(
            v-for="n in 4"
            :key="'vault-skeleton-' + n"
            cols="12"
            sm="6"
            lg="3"
          )
            v-card.vault-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="card, list-item-two-line, actions")

      template(v-else-if="!chainId")
        v-row(justify="center")
          v-col(cols="12" sm="10" md="8" lg="6")
            v-card.connect-card(elevation="0")
              v-card-text.pa-8.text-center
                v-avatar(size="80" color="primary-container" class="mb-6")
                  v-icon(size="40" color="on-primary-container") mdi-wallet-outline
                h2.text-h4.font-weight-medium.mb-2 Connect Your Wallet
                p.text-body-1.text-medium-emphasis.mb-6 Please connect your wallet to view vaults for your network.
                v-btn(
                  @click="connectWallet"
                  variant="elevated"
                  color="primary"
                  size="large"
                  min-width="200"
                )
                  v-icon(start) mdi-wallet
                  | Connect Wallet

      template(v-else)
        v-card.hero-card(elevation="0")
          v-card-text
            v-row(align="stretch")
              v-col(cols="12" md="7")
                .hero-card__heading
                  v-avatar(size="48" :color="getChainColor(chainCoin)" class="mr-4")
                    v-icon(size="24" color="white") mdi-network
                  div
                    h2.text-h5.font-weight-medium.mb-1 Connected to {{ chainName }}
                    p.text-body-2.text-medium-emphasis.ma-0 Tracking {{ activeVaults.length + yearnVaultsOther.length + experimentVaults.length }} vaults on this network
                .hero-card__context.mt-6
                  v-chip.hero-chip(
                    variant="tonal"
                    size="small"
                    :color="getChainColor(chainCoin)"
                  )
                    v-icon(size="16" start) mdi-currency-usd
                    | {{ chainCoin || 'ETH' }}
                  v-chip.hero-chip(
                    size="small"
                    variant="tonal"
                    color="secondary"
                    v-if="hasAccount"
                  )
                    v-icon(size="16" start) mdi-wallet
                    | Portfolio Ready
                  v-chip.hero-chip(
                    size="small"
                    variant="text"
                    color="tertiary"
                    v-if="loadingSummaries"
                  )
                    v-icon(size="16" start) mdi-progress-clock
                    | Refreshing data
              v-col(cols="12" md="5")
                .hero-card__metrics
                  .hero-metric
                    span.hero-metric__label Active Vaults
                    span.hero-metric__value {{ activeVaults.length }}
                  .hero-metric
                    span.hero-metric__label Portfolio Vaults
                    span.hero-metric__value {{ hasAccount ? userVaults.length : 'N/A' }}
                  .hero-metric.hero-metric--accent
                    span.hero-metric__label Total Deposited
                    span.hero-metric__value(v-if="hasAccount") {{ totalUserVaultBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}
                    span.hero-metric__value.hero-metric__value--muted(v-else) Connect wallet to view balance
                v-progress-linear.mt-6(
                  v-if="loadingSummaries"
                  indeterminate
                  color="primary"
                  height="4"
                  rounded
                )

        section.section-block.mt-6(v-if="userVaults.length")
          v-card.section-card(elevation="0")
            v-card-title.section-card__title
              v-avatar(size="32" color="primary-container" class="mr-3")
                v-icon(size="20" color="on-primary-container") mdi-star
              div
                h3.text-h5.font-weight-medium.ma-0 Your Vaults
                p.text-body-2.text-medium-emphasis.ma-0 Vaults where you currently hold shares
              v-spacer
              v-chip(color="primary-container" text-color="on-primary-container") {{ userVaults.length }}
            v-divider
            v-card-text
              v-row(dense class="vaults-row")
                v-col(
                  v-for="vault in userVaults"
                  :key="vault.URL"
                  cols="12"
                  sm="6"
                  lg="4"
                  xl="3"
                  class="d-flex"
                )
                  v-card.vault-card.vault-card--portfolio(
                    hover
                    elevation="1"
                    @click="viewVaultDetails(vault.URL)"
                  )
                    v-card-text
                      .vault-card__header
                        v-avatar(size="32" class="mr-3") {{ vault.LOGO }}
                        div
                          h4.text-subtitle-1.font-weight-medium.ma-0.text-truncate {{ vault.TITLE }}
                          p.text-caption.text-medium-emphasis.ma-0 {{ vault.WANT_SYMBOL }}
                      .vault-card__metrics
                        template(v-if="vaultSummaries[vault.URL]")
                          .vault-card__metric
                            span.vault-card__metric-label Your Balance
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedBalance }} {{ vault.WANT_SYMBOL }}
                          .vault-card__metric
                            span.vault-card__metric-label Price Per Share
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedPps }}
                          .vault-card__metric
                            span.vault-card__metric-label Total Assets
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedAssets }} {{ vault.WANT_SYMBOL }}
                        template(v-else)
                          v-skeleton-loader(type="list-item-two-line")
                    v-card-actions.vault-card__actions
                      v-chip(size="small" color="primary" class="mr-2" variant="flat") In Portfolio
                      v-spacer
                      v-btn(
                        variant="outlined"
                        size="small"
                        :color="getChainColor(chainCoin)"
                        @click.stop="viewVaultDetails(vault.URL)"
                      )
                        v-icon(start) mdi-arrow-right
                        | Manage

        section.section-block.mt-6(v-if="otherActiveVaults.length")
          v-card.section-card(elevation="0")
            v-card-title.section-card__title
              v-avatar(size="32" color="success-container" class="mr-3")
                v-icon(size="20" color="on-success-container") mdi-check-circle
              div
                h3.text-h5.font-weight-medium.ma-0 Active Vaults
                p.text-body-2.text-medium-emphasis.ma-0 High-yield strategies currently accepting deposits
              v-spacer
              v-chip(color="success-container" text-color="on-success-container") {{ otherActiveVaults.length }}
            v-divider
            v-card-text
              v-row(dense class="vaults-row")
                v-col(
                  v-for="vault in otherActiveVaults"
                  :key="vault.URL"
                  cols="12"
                  sm="6"
                  lg="4"
                  xl="3"
                  class="d-flex"
                )
                  v-card.vault-card(
                    hover
                    elevation="1"
                    @click="viewVaultDetails(vault.URL)"
                  )
                    v-card-text
                      .vault-card__header
                        v-avatar(size="32" class="mr-3") {{ vault.LOGO }}
                        div
                          h4.text-subtitle-1.font-weight-medium.ma-0.text-truncate {{ vault.TITLE }}
                          p.text-caption.text-medium-emphasis.ma-0 {{ vault.WANT_SYMBOL }}
                      .vault-card__metrics
                        template(v-if="vaultSummaries[vault.URL]")
                          .vault-card__metric
                            span.vault-card__metric-label Your Balance
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedBalance }} {{ vault.WANT_SYMBOL }}
                          .vault-card__metric
                            span.vault-card__metric-label Price Per Share
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedPps }}
                          .vault-card__metric
                            span.vault-card__metric-label Total Assets
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedAssets }} {{ vault.WANT_SYMBOL }}
                        template(v-else)
                          v-skeleton-loader(type="list-item-two-line")
                    v-card-actions.vault-card__actions
                      v-chip(
                        :color="getStatusColor(vault.VAULT_STATUS)"
                        size="small"
                        variant="flat"
                      ) {{ vault.VAULT_STATUS }}
                      v-spacer
                      v-btn(
                        variant="outlined"
                        size="small"
                        :color="getChainColor(chainCoin)"
                        @click.stop="viewVaultDetails(vault.URL)"
                      )
                        v-icon(start) mdi-arrow-right
                        | View Details

        section.section-block.mt-6(v-if="yearnVaultsOther.length")
          v-card.section-card(elevation="0")
            v-card-title.section-card__title
              v-avatar(size="32" color="tertiary-container" class="mr-3")
                v-icon(size="20" color="on-tertiary-container") mdi-pause-circle
              div
                h3.text-h5.font-weight-medium.ma-0 Other Vaults
                p.text-body-2.text-medium-emphasis.ma-0 Vaults with limited availability
              v-spacer
              v-chip(color="tertiary-container" text-color="on-tertiary-container") {{ yearnVaultsOther.length }}
            v-divider
            v-card-text
              v-row(dense class="vaults-row")
                v-col(
                  v-for="vault in yearnVaultsOther"
                  :key="vault.URL"
                  cols="12"
                  sm="6"
                  lg="4"
                  xl="3"
                  class="d-flex"
                )
                  v-card.vault-card(
                    hover
                    elevation="1"
                    @click="viewVaultDetails(vault.URL)"
                  )
                    v-card-text
                      .vault-card__header
                        v-avatar(size="32" class="mr-3") {{ vault.LOGO }}
                        div
                          h4.text-subtitle-1.font-weight-medium.ma-0.text-truncate {{ vault.TITLE }}
                          p.text-caption.text-medium-emphasis.ma-0 {{ vault.WANT_SYMBOL }}
                      .vault-card__metrics
                        template(v-if="vaultSummaries[vault.URL]")
                          .vault-card__metric
                            span.vault-card__metric-label Your Balance
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedBalance }} {{ vault.WANT_SYMBOL }}
                          .vault-card__metric
                            span.vault-card__metric-label Price Per Share
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedPps }}
                          .vault-card__metric
                            span.vault-card__metric-label Total Assets
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedAssets }} {{ vault.WANT_SYMBOL }}
                        template(v-else)
                          v-skeleton-loader(type="list-item-two-line")
                    v-card-actions.vault-card__actions
                      v-chip(
                        :color="getStatusColor(vault.VAULT_STATUS)"
                        size="small"
                        variant="flat"
                      ) {{ vault.VAULT_STATUS }}
                      v-spacer
                      v-btn(
                        variant="outlined"
                        size="small"
                        color="tertiary"
                        @click.stop="viewVaultDetails(vault.URL)"
                      )
                        v-icon(start) mdi-arrow-right
                        | View Details

        section.section-block.mt-6(v-if="experimentVaults.length")
          v-card.section-card(elevation="0")
            v-card-title.section-card__title
              v-avatar(size="32" color="secondary-container" class="mr-3")
                v-icon(size="20" color="on-secondary-container") mdi-flask
              div
                h3.text-h5.font-weight-medium.ma-0 Experiment Vaults
                p.text-body-2.text-medium-emphasis.ma-0 Cutting-edge strategies in testing
              v-spacer
              v-chip(color="secondary-container" text-color="on-secondary-container") {{ experimentVaults.length }}
            v-divider
            v-card-text
              v-row(dense class="vaults-row")
                v-col(
                  v-for="vault in experimentVaults"
                  :key="vault.URL"
                  cols="12"
                  sm="6"
                  lg="4"
                  xl="3"
                  class="d-flex"
                )
                  v-card.vault-card(
                    hover
                    elevation="1"
                    @click="viewVaultDetails(vault.URL)"
                  )
                    v-card-text
                      .vault-card__header
                        v-avatar(size="32" class="mr-3") {{ vault.LOGO }}
                        div
                          h4.text-subtitle-1.font-weight-medium.ma-0.text-truncate {{ vault.TITLE }}
                          p.text-caption.text-medium-emphasis.ma-0 {{ vault.WANT_SYMBOL }}
                      .vault-card__metrics
                        template(v-if="vaultSummaries[vault.URL]")
                          .vault-card__metric
                            span.vault-card__metric-label Your Balance
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedBalance }} {{ vault.WANT_SYMBOL }}
                          .vault-card__metric
                            span.vault-card__metric-label Price Per Share
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedPps }}
                          .vault-card__metric
                            span.vault-card__metric-label Total Assets
                            span.vault-card__metric-value {{ vaultSummaries[vault.URL].formattedAssets }} {{ vault.WANT_SYMBOL }}
                        template(v-else)
                          v-skeleton-loader(type="list-item-two-line")
                    v-card-actions.vault-card__actions
                      v-chip(
                        :color="getStatusColor(vault.VAULT_STATUS)"
                        size="small"
                        variant="flat"
                      ) {{ vault.VAULT_STATUS }}
                      v-spacer
                      v-btn(
                        variant="outlined"
                        size="small"
                        color="secondary"
                        @click.stop="viewVaultDetails(vault.URL)"
                      )
                        v-icon(start) mdi-flask
                        | View Details

        v-card.empty-state-card.mt-6(elevation="0" v-if="!activeVaults.length && !yearnVaultsOther.length && !experimentVaults.length")
          v-card-text.text-center
            v-avatar(size="72" color="surface-variant" class="mb-4")
              v-icon(size="36" color="on-surface-variant") mdi-database-search
            h3.text-h5.font-weight-medium.mb-2 No Vaults Found
            p.text-body-2.text-medium-emphasis.ma-0 No vaults are available on this network. Try switching networks.

        .home-footer.mt-8
          p.text-caption.text-medium-emphasis Built with 💙 for the DeFi community • Powered by Yearn Finance
</template>



<script>
import chains from "./chains.json";
import { mapGetters } from "vuex";
import { ethers } from "ethers";

export default {
  name: "Home",
  props: ["allConfig", "chainId", "chainCoin", "isDrizzleReady"],
  data() {
    return {
      items: Object.keys(this.allConfig).map((key) => ({
        ...this.allConfig[key],
        URL: key,
      })),
      chains,
      vaultSummaries: {},
      loadingSummaries: false,
      summaryProvider: null,
      summaryProviderChain: null,
    };
  },
  mounted() {
    this.loadVaultSummaries();
  },
  computed: {
    ...mapGetters("drizzle", ["drizzleInstance"]),
    ...mapGetters("accounts", ["activeAccount"]),
    isSkeletonActive() {
      return this.loadingSummaries && this.hasAccount;
    },
    chainName() {
      if (this.chainId) {
        return this.chains[this.chainId]?.name || "Unknown Network";
      }
      return "Unknown Network";
    },
    yearnVaults() {
      const items = Array.isArray(this.items) ? this.items : [];
      return items
        .filter((item) => this.matchesChain(item.CHAIN_ID))
        .filter((item) => item.VAULT_TYPE === "yearn")
        .slice()
        .reverse();
    },
    activeVaults() {
      const vaults = Array.isArray(this.yearnVaults) ? this.yearnVaults : [];
      return vaults.filter((item) => item.VAULT_STATUS === "active");
    },
    userVaults() {
      const vaults = Array.isArray(this.activeVaults) ? this.activeVaults : [];
      return vaults.filter((vault) => this.getSummary(vault.URL)?.hasBalance);
    },
    otherActiveVaults() {
      const vaults = Array.isArray(this.activeVaults) ? this.activeVaults : [];
      return vaults.filter((vault) => !this.getSummary(vault.URL)?.hasBalance);
    },
    yearnVaultsOther() {
      const vaults = Array.isArray(this.yearnVaults) ? this.yearnVaults : [];
      return vaults
        .filter((item) => item.VAULT_STATUS !== "active" && item.VAULT_STATUS !== "stealth")
        .slice()
        .reverse();
    },
    yearnVaultsActive() {
      return this.activeVaults;
    },
    experimentVaults() {
      const items = Array.isArray(this.items) ? this.items : [];
      return items
        .filter((item) => this.matchesChain(item.CHAIN_ID))
        .filter((item) => item.VAULT_TYPE === "experiment" && item.VAULT_STATUS !== "stealth")
        .slice()
        .reverse();
    },
    hasAccount() {
      return !!this.activeAccount;
    },
    totalUserVaultBalance() {
      return this.userVaults.reduce((acc, vault) => {
        const summary = this.getSummary(vault.URL);
        return acc + (summary?.numericBalance || 0);
      }, 0);
    },
  },
  watch: {
    chainId() {
      this.loadVaultSummaries();
    },
    activeAccount() {
      this.loadVaultSummaries();
    },
    isDrizzleReady: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadVaultSummaries();
        }
      },
    },
  },
  methods: {
    getStatusColor(status) {
      const colors = {
        active: "success",
        withdraw: "warning",
        stealth: "error",
        default: "info",
      };
      return colors[status] || "info";
    },
    async connectWallet() {
      try {
        if (window.ethereum) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        } else {
          console.error("No wallet found");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    },
    viewVaultDetails(vaultUrl) {
      window.location.href = "/" + vaultUrl;
    },
    getChainColor(coin) {
      const colors = {
        ETH: "primary",
        BNB: "amber",
        MATIC: "purple",
        FTM: "indigo",
        KCS: "orange",
        OKT: "teal",
      };
      return colors[coin] || "primary";
    },
    matchesChain(chainIdValue) {
      if (!this.chainId) {
        return false;
      }
      const normalize = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === "string") {
          if (value.startsWith("0x")) {
            return parseInt(value, 16);
          }
          const parsed = parseInt(value, 10);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
        return Number(value);
      };
      return normalize(chainIdValue) === normalize(this.chainId);
    },
    getSummary(key) {
      return this.vaultSummaries[key] || null;
    },
    formatAmount(value, decimals, maximumFractionDigits = 2) {
      try {
        const amount = Number(ethers.formatUnits(value, decimals));
        if (!Number.isFinite(amount)) return "0";
        return amount.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits,
        });
      } catch (error) {
        console.error("Error formatting amount:", error);
        return "0";
      }
    },
    async loadVaultSummaries() {
      if (!this.chainId || !this.activeAccount) {
        this.loadingSummaries = false;
        this.vaultSummaries = {};
        return;
      }

      const requestToken = Symbol("vaultSummaries");
      this._currentSummaryRequest = requestToken;
      this.loadingSummaries = true;

      try {
        const vaultsToLoad = this.yearnVaults;
        const results = await Promise.all(
          vaultsToLoad.map((vault) => this.fetchVaultSummary(vault))
        );

        if (this._currentSummaryRequest !== requestToken) {
          return;
        }

        const summaryMap = {};
        results.forEach((summary, index) => {
          if (summary) {
            summaryMap[vaultsToLoad[index].URL] = summary;
          }
        });
        this.vaultSummaries = summaryMap;
      } catch (error) {
        console.error("Error loading vault summaries:", error);
      } finally {
        if (this._currentSummaryRequest === requestToken) {
          this.loadingSummaries = false;
        }
      }
    },
    async fetchVaultSummary(vault) {
      try {
        const provider = await this.getReadOnlyProvider();
        if (!provider) {
          return null;
        }

        const contract = new ethers.Contract(
          vault.VAULT_ADDR,
          vault.VAULT_ABI,
          provider
        );

        const [decimalsRaw, balanceRaw, totalAssetsRaw, pricePerShareRaw] = await Promise.all([
          contract.decimals().catch(() => 18),
          contract.balanceOf(this.activeAccount).catch(() => 0n),
          contract.totalAssets().catch(() => 0n),
          contract.pricePerShare().catch(() => 0n),
        ]);

        const decimals = Number(decimalsRaw || 18);
        const balance = ethers.toBigInt(balanceRaw || 0);
        const totalAssets = ethers.toBigInt(totalAssetsRaw || 0);
        const pricePerShare = ethers.toBigInt(pricePerShareRaw || 0);

        const formattedBalance = this.formatAmount(balance, decimals, 4);
        const formattedAssets = this.formatAmount(totalAssets, decimals, 2);
        const formattedPps = this.formatAmount(pricePerShare, decimals, 4);

        return {
          vault,
          decimals,
          rawBalance: balance,
          numericBalance: Number(ethers.formatUnits(balance, decimals)),
          hasBalance: balance > 0n,
          formattedBalance,
          formattedAssets,
          formattedPps,
          wantSymbol: vault.WANT_SYMBOL,
        };
      } catch (error) {
        console.error(`Failed to fetch summary for ${vault.URL}:`, error);
        return null;
      }
    },
    async getReadOnlyProvider() {
      if (!this.chainId) {
        return null;
      }

      const normalizedChain = Number(this.chainId);

      if (
        this.summaryProvider &&
        this.summaryProviderChain === normalizedChain
      ) {
        return this.summaryProvider;
      }

      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum, "any");
          const network = await browserProvider.getNetwork();
          if (Number(network.chainId) === normalizedChain) {
            this.summaryProvider = browserProvider;
            this.summaryProviderChain = normalizedChain;
            return this.summaryProvider;
          }
        } catch (error) {
          console.warn("Browser provider unavailable, falling back", error);
        }
      }

      const rpcUrl = this.getRpcUrlForChain(normalizedChain);
      if (!rpcUrl) {
        return null;
      }

      this.summaryProvider = new ethers.JsonRpcProvider(rpcUrl, normalizedChain, {
        batchMaxCount: 10,
      });
      this.summaryProviderChain = normalizedChain;
      return this.summaryProvider;
    },
    getRpcUrlForChain(chainId) {
      const map = {
        1: "https://eth.llamarpc.com",
        56: "https://binance.llamarpc.com",
        137: "https://polygon.llamarpc.com",
        250: "https://fantom.llamarpc.com",
        321: "https://rpc-mainnet.kcc.network",
        66: "https://exchainrpc.okex.org",
      };
      return map[chainId] || null;
    },
  },
};
</script>

<style scoped>
.home-layout {
  padding-left: 16px !important;
  padding-right: 16px !important;
}

.app-bar__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-bar__title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-bar__chips {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-card {
  border-radius: 20px;
  background: rgb(var(--v-theme-surface-container));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.hero-card__heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.hero-card__context {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-chip {
  border-radius: 999px;
}

.hero-card__metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-metric__label {
  font-size: 13px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
}

.hero-metric__value {
  font-size: 28px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.15;
}

.hero-metric__value--muted {
  font-size: 14px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.hero-metric--accent .hero-metric__value {
  color: rgb(var(--v-theme-primary));
}

.section-block + .section-block {
  margin-top: 32px;
}

.section-card {
  border-radius: 18px;
  background: rgb(var(--v-theme-surface-container));
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.section-card__title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
}

.vaults-row {
  row-gap: 24px;
}

.vault-card {
  border-radius: 18px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
}

.vault-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.vault-card--portfolio {
  border-color: rgba(var(--v-theme-primary), 0.4);
  background: rgba(var(--v-theme-primary), 0.08);
}

.vault-card .v-card__text {
  padding: 12px;
}

.vault-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.vault-card__metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vault-card__metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vault-card__metric-label {
  font-size: 12px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
}

.vault-card__metric-value {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.vault-card__actions {
  padding: 0 20px 16px;
}

.connect-card {
  border-radius: 20px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.14);
}

.empty-state-card {
  border-radius: 20px;
  background: rgb(var(--v-theme-surface-container));
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 12px;
}

.home-footer {
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.shimmer-card {
  border-radius: 18px;
  background: rgb(var(--v-theme-surface-variant));
}

.skeleton-chip {
  border-radius: 999px;
}

.v-btn,
.v-text-field,
.v-progress-linear,
.v-card {
  transition: all 0.2s ease;
}

a {
  color: inherit;
  text-decoration: none;
}

@media (max-width: 1264px) {
  .hero-card__metrics {
    margin-top: 16px;
  }

  .hero-metric__value {
    font-size: 24px;
  }
}

@media (max-width: 960px) {
  .home-layout {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  .section-block + .section-block {
    margin-top: 32px;
  }
}

@media (max-width: 600px) {
  .hero-card__metrics {
    padding-top: 12px;
    gap: 12px;
  }

  .hero-metric__value {
    font-size: 22px;
  }

  .vault-card .v-card__text {
    padding: 12px;
  }

  .vault-card__actions {
    padding: 0 20px 16px;
  }

  .section-block + .section-block {
    margin-top: 32px;
  }
}
</style>
