<template lang="pug">
v-app
  template(v-if="!isSkeletonActive")
    v-app-bar(app flat color="surface" height="64")
      v-container(max-width="1440" class="py-0")
        v-row(align="center" no-gutters)
          v-col(cols="12")
            .app-bar__content
              v-btn.app-bar__nav-btn(
                icon
                variant="text"
                color="primary"
                @click="goHome"
              )
                v-icon mdi-arrow-left
              .app-bar__title
                h1.text-h6.font-weight-medium.ma-0 {{ config.TITLE }}
                p.text-caption.text-medium-emphasis.ma-0 Yearn Finance Vault
              v-spacer
              .app-bar__chips
                v-chip(size="small" color="primary" text-color="white") {{ config.WANT_SYMBOL }}
                v-chip(
                  size="small"
                  variant="outlined"
                  :color="getStatusColor(config.VAULT_STATUS)"
                ) {{ config.VAULT_STATUS.toUpperCase() }}
                v-chip(
                  v-if="chainCoin"
                  size="small"
                  variant="tonal"
                  color="secondary"
                ) {{ chainCoin }}

    v-main
      v-container(max-width="1440" class="py-3 vault-layout")
        v-row
          v-col(cols="12")
            v-card.hero-card(elevation="0")
              v-card-text
                v-row(align="center")
                  v-col(cols="12" md="7")
                    .hero-card__heading
                      v-avatar(size="56" color="primary" class="mr-4")
                        v-icon(size="28" color="white") mdi-bank
                      div
                        h2.text-h5.font-weight-medium.mb-1 Intelligent Yield Automation
                        p.text-body-2.text-medium-emphasis.ma-0 {{ getStatusDescription(config.VAULT_STATUS) }}
                    .hero-card__context.mt-6
                      v-chip.hero-chip(
                        variant="text"
                        size="small"
                        prepend-icon="mdi-account-cog"
                      ) Managed by {{ config.VAULT_DEV }}
                      v-chip.hero-chip(
                        variant="text"
                        size="small"
                        prepend-icon="mdi-currency-usd"
                      ) {{ vault_total_assets | fromWei(2, vault_decimals) }} {{ config.WANT_SYMBOL }} assets
                      v-chip.hero-chip(
                        v-if="vault_available_limit"
                        variant="text"
                        size="small"
                        prepend-icon="mdi-timelapse"
                      ) {{ vault_available_limit | fromWei(2, vault_decimals) }} {{ config.WANT_SYMBOL }} available
                  v-col(cols="12" md="5")
                    .hero-card__metrics
                      .hero-metric
                        span.hero-metric__label Yearly APY
                        span.hero-metric__value {{ get_yearly_apy }}%
                      .hero-metric
                        span.hero-metric__label Total AUM
                        span.hero-metric__value {{ vault_total_aum | toCurrency(2, vault_decimals) }}
                      .hero-metric.hero-metric--progress
                        div
                          span.hero-metric__label Capacity Used
                          span.hero-metric__value {{ Math.round(progress_limit) }}%
                        v-progress-linear.mt-3(
                          :model-value="progress_limit"
                          color="primary"
                          rounded
                          height="6"
                        )

        v-row(class="mt-6 metrics-row" dense)
          v-col(cols="12" md="4")
            v-card.metric-card(elevation="0")
              v-card-title.metric-card__title
                v-avatar(size="32" color="success-container" class="mr-3")
                  v-icon(size="20" color="on-success-container") mdi-trending-up
                span.text-subtitle-1.font-weight-medium Performance
              v-divider
              v-card-text
                .metric-row
                  span.metric-row__label Daily APY
                  span.metric-row__value.success--text {{ (get_yearly_apy / 365).toFixed(3) }}%
                .metric-row
                  span.metric-row__label Yearly APY
                  span.metric-row__value {{ get_yearly_apy }}%
                .metric-row
                  span.metric-row__label Performance Fee
                  span.metric-row__value {{ vault_perfFee }}%
          v-col(cols="12" md="4")
            v-card.metric-card(elevation="0")
              v-card-title.metric-card__title
                v-avatar(size="32" color="primary-container" class="mr-3")
                  v-icon(size="20" color="on-primary-container") mdi-currency-usd
                span.text-subtitle-1.font-weight-medium Assets
              v-divider
              v-card-text
                .metric-row
                  span.metric-row__label Total AUM
                  span.metric-row__value {{ vault_total_aum | toCurrency(2, vault_decimals) }}
                .metric-row
                  span.metric-row__label Total Assets
                  span.metric-row__value {{ vault_total_assets | fromWei(2, vault_decimals) }} {{ config.WANT_SYMBOL }}
                .metric-row
                  span.metric-row__label {{ config.WANT_SYMBOL }} Price
                  span.metric-row__value {{ want_price | toCurrency(4) }}
          v-col(cols="12" md="4")
            v-card.metric-card(elevation="0")
              v-card-title.metric-card__title
                v-avatar(size="32" color="tertiary-container" class="mr-3")
                  v-icon(size="20" color="on-tertiary-container") mdi-chart-pie
                span.text-subtitle-1.font-weight-medium Vault Insights
              v-divider
              v-card-text
                .metric-row
                  span.metric-row__label Price Per Share
                  span.metric-row__value {{ vault_price_per_share | fromWei(8, vault_decimals) }}
                .metric-row
                  span.metric-row__label Available Limit
                  span.metric-row__value {{ vault_available_limit | fromWei(2, vault_decimals) }} {{ config.WANT_SYMBOL }}
                .metric-row.metric-row--progress
                  div
                    span.metric-row__label Capacity Used
                    span.metric-row__value {{ Math.round(progress_limit) }}%
                  v-progress-linear.mt-3(
                    :model-value="progress_limit"
                    color="primary"
                    rounded
                    height="6"
                  )

        v-row(class="mt-6" dense)
          v-col(cols="12" lg="7")
            v-card.section-card(elevation="0")
              v-card-title.section-card__title
                v-avatar(size="32" color="secondary-container" class="mr-3")
                  v-icon(size="20" color="on-secondary-container") mdi-wallet
                span.text-subtitle-1.font-weight-medium Your Wallet
              v-divider
              v-card-text
                .wallet-grid
                  .wallet-metric
                    span.wallet-label Vault Shares
                    span.wallet-value {{ yvtoken_balance | fromWei(2, vault_decimals) }}
                  .wallet-metric
                    span.wallet-label {{ config.WANT_SYMBOL }} Balance
                    span.wallet-value {{ want_balance | fromWei(2, vault_decimals) }}
                  .wallet-metric
                    span.wallet-label {{ chainCoin }} Balance
                    span.wallet-value {{ coin_balance | fromWei(2) }}
                  .wallet-metric
                    span.wallet-label Deposited Value
                    span.wallet-value {{ vault_net_deposited }} {{ config.WANT_SYMBOL }}
          v-col(cols="12" lg="5")
            v-card.section-card(elevation="0")
              v-card-title.section-card__title
                v-avatar(size="32" color="primary-container" class="mr-3")
                  v-icon(size="20" color="on-primary-container") mdi-cog
                span.text-subtitle-1.font-weight-medium Manage Vault
              v-divider
              v-card-text
                .action-toggle.mb-6
                  v-btn-toggle(
                    v-model="actionSwitch"
                    variant="outlined"
                    mandatory
                    divided
                  )
                    v-btn(:value="true")
                      v-icon.mr-2 mdi-arrow-down-bold
                      | Deposit
                    v-btn(:value="false")
                      v-icon.mr-2 mdi-arrow-up-bold
                      | Withdraw
                v-text-field(
                  v-if="actionSwitch ? vault_available_limit > 0 : true"
                  v-model.number="amount"
                  type="number"
                  :label="actionSwitch ? 'Deposit Amount' : 'Withdraw Amount'"
                  variant="outlined"
                  :suffix="config.WANT_SYMBOL"
                  :min="0"
                  :max="actionSwitch ? want_balance : yvtoken_balance"
                  hide-details
                  class="mb-6"
                )
                .action-buttons
                  template(v-if="is_guest || yfi_needed <= 0")
                    v-btn.mb-3(
                      v-if="actionSwitch && vault_available_limit > 0 && !has_allowance_vault"
                      @click="on_approve_vault"
                      variant="outlined"
                      color="primary"
                      size="large"
                      block
                    )
                      v-icon(start) mdi-shield-check
                      | Approve {{ config.WANT_SYMBOL }}
                    v-btn.mb-3(
                      v-if="actionSwitch ? vault_available_limit > 0 && has_allowance_vault : has_yvtoken_balance"
                      @click="on_vault_action_click"
                      variant="elevated"
                      :color="actionSwitch ? 'success' : 'error'"
                      size="large"
                      block
                      :disabled="!amount || amount <= 0"
                    )
                      v-icon(start) {{ actionSwitch ? 'mdi-arrow-down-bold' : 'mdi-arrow-up-bold' }}
                      | {{ actionSwitch ? 'Deposit' : 'Withdraw' }}
                    v-btn(
                      v-if="actionSwitch ? vault_available_limit > 0 && has_allowance_vault : has_yvtoken_balance"
                      @click="on_all_click"
                      variant="text"
                      color="primary"
                      block
                    )
                      v-icon(start) mdi-all-inclusive
                      | {{ actionSwitch ? 'Deposit All' : 'Withdraw All' }}
                    .text-caption.text-medium-emphasis.mt-2(
                      v-if="actionSwitch && vault_available_limit <= 0"
                    ) Deposits are currently closed
                  template(v-else)
                    v-alert(type="error" variant="tonal")
                      v-icon.mr-2 mdi-lock
                      | You need {{ yfi_needed | fromWei(4) }} YFI to access this vault

        section.strategies-section(v-if="strategies.length")
          .section-heading
            v-avatar(size="32" color="tertiary-container" class="mr-3")
              v-icon(size="20" color="on-tertiary-container") mdi-strategy
            div
              h3.text-h5.font-weight-medium.ma-0 Strategies ({{ strategies.length }})
              p.text-body-2.text-medium-emphasis.ma-0 How capital is currently allocated
          v-row(class="mt-4" dense)
            v-col(
              v-for="(strategy, index) in strategies"
              :key="index"
              cols="12"
              md="6"
              xl="4"
            )
              v-card.strategy-card(elevation="0")
                v-card-text
                  .strategy-card__header
                    h4.text-subtitle-1.font-weight-medium.ma-0 Strategy {{ index + 1 }}
                    v-btn(
                      :href="chainExplorer + '/address/' + strategy.address + '#code'"
                      target="_blank"
                      variant="text"
                      color="primary"
                      size="small"
                    )
                      v-icon mdi-open-in-new
                  p.text-body-2.text-medium-emphasis.ma-0.mt-2 {{ strategy.name }}
                  p.text-caption.text-medium-emphasis.ma-0.mt-1
                    span Strategist:
                    template(v-if="strategy.strategist")
                      template(v-if="getExplorerUrl(strategy.strategist)")
                        a.ml-2.font-weight-medium(
                          :href="getExplorerUrl(strategy.strategist)"
                          target="_blank"
                          rel="noopener"
                        ) {{ formatAddress(strategy.strategist) }}
                      template(v-else)
                        span.ml-2.font-weight-medium {{ formatAddress(strategy.strategist) }}
                    template(v-else)
                      span.ml-2.font-weight-medium —
                  p.text-caption.text-medium-emphasis.ma-0.mt-1
                    span Rewards Address:
                    template(v-if="strategy.rewards")
                      template(v-if="getExplorerUrl(strategy.rewards)")
                        a.ml-2.font-weight-medium(
                          :href="getExplorerUrl(strategy.rewards)"
                          target="_blank"
                          rel="noopener"
                        ) {{ formatAddress(strategy.rewards) }}
                      template(v-else)
                        span.ml-2.font-weight-medium {{ formatAddress(strategy.rewards) }}
                    template(v-else)
                      span.ml-2.font-weight-medium —
                  p.text-caption.text-medium-emphasis.ma-0.mt-1
                    span Rewards Balance:
                    span.ml-2.font-weight-medium {{ formatVaultShares(strategy.vaultBalance) }}
            v-card-actions.pt-2
              v-spacer
              v-btn(
                v-if="isStrategyStrategist(strategy)"
                :loading="strategy._harvesting"
                    :disabled="strategy._harvesting"
                    color="primary"
                    size="small"
                    @click="onHarvestStrategy(strategy, index)"
                  )
                    v-icon(start) mdi-leaf
                    | Harvest
              v-btn.ml-2(
                v-if="isStrategyRewardsRecipient(strategy) && hasStrategyRewards(strategy)"
                :loading="strategy._claiming"
                :disabled="strategy._claiming"
                color="secondary"
                size="small"
                @click="onClaimStrategyRewards(strategy, index)"
                  )
                    v-icon(start) mdi-hand-coin
                    | Claim Rewards

        .contract-section.mt-8
          v-card.contract-card(elevation="0")
            v-card-text.contract-card__content
              .contract-card__row
                p.text-caption.text-medium-emphasis.ma-0
                  | Made with 💙 by
                  a(:href="'https://twitter.com/' + config.VAULT_DEV" target="_blank") {{ config.VAULT_DEV }}
                  |  • Yearn Finance Vault
                v-btn(
                  :href="chainExplorer + '/address/' + config.VAULT_ADDR + '#code'"
                  target="_blank"
                  variant="text"
                  color="primary"
                  size="small"
                )
                  v-icon(start) mdi-code-braces
                  | View Contract

        v-alert(
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-6"
        )
          v-icon.mr-2 mdi-alert-circle
          | {{ error }}

  template(v-else)
    v-app-bar(app flat color="surface" height="64")
      v-container(max-width="1440" class="py-0")
        v-row(align="center" no-gutters)
          v-col(cols="12")
            .app-bar__content
              v-skeleton-loader(type="button" width="48" height="48" class="mr-4")
              div
                v-skeleton-loader(type="heading" width="200" class="mb-1")
                v-skeleton-loader(type="text" width="160")
              v-spacer
              v-skeleton-loader(type="chip" width="120" class="skeleton-chip")

    v-main
      v-container(max-width="1440" class="py-8")
        v-row
          v-col(cols="12")
            v-card.hero-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line")
        v-row(class="mt-6" dense)
          v-col(cols="12" md="4")
            v-card.metric-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line")
          v-col(cols="12" md="4")
            v-card.metric-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line")
          v-col(cols="12" md="4")
            v-card.metric-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line")
        v-row(class="mt-6" dense)
          v-col(cols="12" lg="7")
            v-card.section-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line" class="mb-6")
                v-skeleton-loader(type="text" class="mb-3")
                v-skeleton-loader(type="text" class="mb-3")
                v-skeleton-loader(type="text" class="mb-3")
          v-col(cols="12" lg="5")
            v-card.section-card.shimmer-card(elevation="0")
              v-card-text
                v-skeleton-loader(type="list-item-two-line" class="mb-6")
                v-skeleton-loader(type="text" class="mb-3")
                v-skeleton-loader(type="button" class="mb-3")
                v-skeleton-loader(type="button")
        section.strategies-section
          v-skeleton-loader(type="heading" width="200" class="mb-4")
          v-row(dense)
            v-col(cols="12" md="6")
              v-card.strategy-card.shimmer-card(elevation="0")
                v-card-text
                  v-skeleton-loader(type="list-item-two-line")
            v-col(cols="12" md="6")
              v-card.strategy-card.shimmer-card(elevation="0")
                v-card-text
                  v-skeleton-loader(type="list-item-two-line")
        .contract-section.mt-8
          v-card.contract-card.shimmer-card(elevation="0")
            v-card-text
              v-skeleton-loader(type="text" width="260" class="mb-2")
              v-skeleton-loader(type="button" width="140")
</template>



<script>
import { mapGetters } from "vuex";
import { ethers } from "ethers";
import axios from "axios";
import ProgressBar from "./components/ProgressBar";
import GuestList from "./abi/GuestList.json";
import yVaultV2 from "./abi/yVaultV2.json";
import yStrategy from "./abi/yStrategy.json";
import ERC20 from "./abi/ERC20.json";

import Web3 from "web3";

const STRATEGY_EXTRA_ABI = [
  {
    inputs: [],
    name: "strategist",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "harvest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const STRATEGY_ABI = [...yStrategy, ...STRATEGY_EXTRA_ABI];

// Use a public RPC provider as fallback when no wallet is available
const getWeb3Provider = () => {
  if (Web3.givenProvider) {
    return Web3.givenProvider;
  }
  // Fallback to a public RPC provider (Ethereum mainnet)
  return new Web3.providers.HttpProvider('https://eth.llamarpc.com');
};

let web3 = new Web3(getWeb3Provider());

const max_uint = (2n ** 256n - 1n).toString();
const BN_ZERO = 0n;
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

const ERROR_NEGATIVE = "You have to deposit a positive number of tokens 🐀";
const ERROR_NOT_ENOUGH_DEPOSIT = "You don't have enough tokens to deposit";
const ERROR_NOT_ENOUGH_SHARES =
  "You don't have enough vault tokens to withdraw";
const ERROR_NEGATIVE_ALL = "You don't have tokens to deposit 🐀";
const ERROR_NEGATIVE_WITHDRAW = "You don't have any vault shares";
const ERROR_GUEST_LIMIT = "That would exceed your guest limit. Try less.";
const ERROR_GUEST_LIMIT_ALL =
  "That would exceed your guest limit. Try not doing all in.";

export default {
  name: "Vault",
  components: {
    ProgressBar,
  },
  props: ["config", "chainId", "chainCoin", "chainExplorer"],
  data() {
    return {
      username: null,
      actionSwitch: true,
      want_price: 0,
      amount: 0,
      amount_wrap: 0,
      strategies: [],
      strategies_balance: 0,
      average_price: 0,
      error: null,
      contractGuestList: null,
      is_guest: false,
      entrance_cost: 1n,
      total_yfi: 0n,
      bribe_unlocked: false,
      bribe_cost: 0n,
      vault_activation: 0,
      roi_year: 0,
    };
  },
  filters: {
    fromWei(data, precision, decimals) {
      if (decimals === undefined) decimals = 18;
      if (data === "loading") return data;
      if (data > 2 ** 255) return "♾️";
      try {
        // Format the value first
        let formatted = ethers.formatUnits(data, decimals);
        // Parse as number to remove any trailing zeros
        let numberValue = parseFloat(formatted);
        // Format with commas
        let value = numberValue.toLocaleString('en-US', {
          minimumFractionDigits: precision || 2,
          maximumFractionDigits: precision || 2
        });
        return value;
      } catch (error) {
        console.error("Error in fromWei filter:", error);
        return "0";
      }
    },
    fromWeiToFloat(data, decimals) {
      if (decimals === undefined) decimals = 18;
      if (data === "loading") return data;
      if (data > 2 ** 255) return "♾️";
      try {
        let value = ethers.formatUnits(data, decimals);
        return parseFloat(value);
      } catch (error) {
        console.error("Error in fromWeiToFloat filter:", error);
        return 0;
      }
    },
    fromWei15(data, precision) {
      if (data === "loading") return data;
      if (data > 2 ** 255) return "♾️";
      try {
        // Format the value first
        let formatted = ethers.formatUnits(data, 15);
        // Parse as number to remove any trailing zeros
        let numberValue = parseFloat(formatted);
        // Format with commas
        let value = numberValue.toLocaleString('en-US', {
          minimumFractionDigits: precision || 2,
          maximumFractionDigits: precision || 2
        });
        return value;
      } catch (error) {
        console.error("Error in fromWei15 filter:", error);
        return "0";
      }
    },
    toPct(data, precision) {
      if (isNaN(data)) return "-";
      return `${(data * 100).toFixed(precision)}%`;
    },
    toCurrency(data, precision) {
      if (!data) return "-";
      if (typeof data !== "number") {
        data = parseFloat(data);
      }
      var formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: precision,
      });
      return formatter.format(data);
    },
  },
  methods: {
    getStatusColor(status) {
      const colors = {
        'active': 'success',
        'withdraw': 'warning',
        'stealth': 'error',
        'default': 'info'
      };
      return colors[status] || 'info';
    },
    getStatusDescription(status) {
      const descriptions = {
        'active': 'Currently accepting deposits and generating yield',
        'withdraw': 'Only withdrawals are available at this time',
        'stealth': 'Private vault with restricted access',
        'default': 'Status unknown'
      };
      return descriptions[status] || descriptions.default;
    },
    goHome() {
      window.location.href = "/";
    },
    on_approve_vault() {
      this.drizzleInstance.contracts["WANT"].methods["approve"].cacheSend(
        this.vault,
        max_uint,
        { from: this.activeAccount }
      );
    },
    on_approve_bribe() {
      this.drizzleInstance.contracts["YFI"].methods["approve"].cacheSend(
        this.vault,
        max_uint,
        { from: this.activeAccount }
      );
    },
    on_deposit() {
      this.error = null;

      if (this.amount <= 0) {
        this.error = ERROR_NEGATIVE;
        this.amount = 0;
        return;
      } else if (this.amount > this.want_balance) {
        this.error = ERROR_NOT_ENOUGH_DEPOSIT;
        this.amount = 0;
        return;
      }

      this.drizzleInstance.contracts["Vault"].methods["deposit"].cacheSend(
        ethers.utils
          .parseUnits(this.amount.toString(), this.vault_decimals)
          .toString(),
        {
          from: this.activeAccount,
        }
      );
    },
    on_vault_action_click() {
      if (this.actionSwitch) {
        this.on_deposit();
      } else {
        this.on_withdraw();
      }
    },
    on_all_click() {
      if (this.actionSwitch) {
        //Deposit all
        this.on_deposit_all();
      } else {
        this.on_withdraw_all();
      }
    },
    on_deposit_all() {
      if (this.want_balance <= 0) {
        this.error = ERROR_NEGATIVE_ALL;
        this.amount = 0;
        return;
      }

      this.drizzleInstance.contracts["Vault"].methods["deposit"].cacheSend({
        from: this.activeAccount,
      });
    },
    on_bribe_the_bouncer() {
      this.contractGuestList.methods
        .bribe_the_bouncer()
        .send({ from: this.activeAccount })
        .then((response) => {});
    },
    getVaultSharesForAmount(amount) {
      let curPricePerShare = this.$options.filters.fromWeiToFloat(
        this.vault_price_per_share
      );
      return amount / curPricePerShare;
    },
    on_withdraw() {
      if (this.yvtoken_balance <= 0) {
        this.error = ERROR_NEGATIVE_WITHDRAW;
        this.amount = 0;
        return;
      }
      if (this.amount <= 0) {
        this.error = ERROR_NEGATIVE;
        this.amount = 0;
        return;
      }
      //
      let withdrawSharesAmount = this.getVaultSharesForAmount(this.amount);
      let currVaultShares = this.$options.filters.fromWeiToFloat(
        this.yvtoken_balance
      );

      if (withdrawSharesAmount > currVaultShares) {
        this.error = ERROR_NOT_ENOUGH_SHARES;
        this.amount = 0;
        return;
      }
      const decimals = Number(this.vault_decimals || 18);
      let parsedAmount;

      try {
        parsedAmount = ethers
          .parseUnits(withdrawSharesAmount.toString(), decimals)
          .toString();
      } catch (error) {
        console.error("Failed to parse withdraw amount:", error);
        this.error = "Unable to parse withdraw amount. Please try a smaller precision.";
        return;
      }

      this.drizzleInstance.contracts["Vault"].methods["withdraw"].cacheSend(parsedAmount, {
        from: this.activeAccount,
      });
    },
    on_withdraw_all() {
      if (this.yvtoken_balance <= 0) {
        this.error = ERROR_NEGATIVE_WITHDRAW;
        this.amount = 0;
        return;
      }
      this.drizzleInstance.contracts["Vault"].methods["withdraw"].cacheSend({
        from: this.activeAccount,
      });
    },
    async load_reverse_ens() {
      try {
        if (!this.activeAccount) return;

        // Only attempt ENS lookup on Ethereum mainnet
        if (this.chainId !== 1) {
          this.username = null;
          return;
        }

        let lookup = this.activeAccount.toLowerCase().substr(2) + ".addr.reverse";

        // Check if resolver exists before calling
        try {
          let resolver = await this.drizzleInstance.web3.eth.ens.resolver(lookup);
          if (!resolver) {
            this.username = null;
            return;
          }

          let namehash = ethers.namehash(lookup);
          let name = await resolver.methods.name(namehash).call();
          this.username = name || null;
        } catch (resolverError) {
          // Resolver doesn't exist for this address
          this.username = null;
        }
      } catch (error) {
        console.error("Error loading ENS:", error.message);
        this.username = null;
      }
    },
    async get_strategies(vault) {
      // this.vault_underlying_lpFunds();
      for (let i = 0, p = Promise.resolve(); i < 20; i++) {
        p = p.then(
          (_) =>
            new Promise((resolve) =>
              vault.methods
                .withdrawalQueue(i)
                .call()
                .then((strat_addr) => {
                  if (strat_addr !== ADDRESS_ZERO) {
                    const strategyContract = this.buildStrategyContract(strat_addr);

                    const strategyData = {
                      address: strat_addr,
                      balance: null,
                      strategist: null,
                      rewards: null,
                      vaultBalance: 0n,
                      _harvesting: false,
                      _claiming: false,
                    };

                    this.$set(this.strategies, i, strategyData);

                    strategyContract.methods
                      .name()
                      .call()
                      .then((name) => {
                        this.$set(this.strategies[i], "name", name);
                      })
                      .catch((error) => {
                        console.error("Error fetching strategy name:", error);
                      });

                    strategyContract.methods
                      .strategist()
                      .call()
                      .then((addr) => {
                        const strategistAddress =
                          typeof addr === "string" ? addr.toLowerCase() : null;
                        this.$set(this.strategies[i], "strategist", strategistAddress);
                      })
                      .catch((error) => {
                        console.error("Error fetching strategist:", error);
                        this.$set(this.strategies[i], "strategist", null);
                      });

                    strategyContract.methods
                      .rewards()
                      .call()
                      .then((addr) => {
                        const rewardsAddress =
                          typeof addr === "string" ? addr.toLowerCase() : null;
                        this.$set(this.strategies[i], "rewards", rewardsAddress);
                      })
                      .catch((error) => {
                        console.error("Error fetching rewards address:", error);
                        this.$set(this.strategies[i], "rewards", null);
                      });

                    this.fetchStrategyVaultBalance(strat_addr, i);
                  }

                  resolve();
                })
            )
        );
      }
    },
    getLPShare() {
      let tSupply = this.lpSupply;
      let vSupply = this.vault_total_assets;
      let totalSupply = parseFloat(ethers.utils.formatEther(tSupply));
      let currentBaseAsset = parseFloat(ethers.utils.formatEther(vSupply));
      return (currentBaseAsset / totalSupply) * 100;
    },
    vault_underlying_lpFunds() {
      if (this.config.LP_VAULT) {
        let token0Addr = this.token0;
        let token1addr = this.token1;
        this.token0_0 = new web3.eth.Contract(ERC20, token0Addr);
        this.token1_0 = new web3.eth.Contract(ERC20, token1addr);
        let symbols = [];
        this.reserveData = this.reserves;
        //Get symbols
        this.token0_0.methods
          .symbol()
          .call()
          .then((symbol) => {
            symbols.push(symbol);
          });
        this.token1_0.methods
          .symbol()
          .call()
          .then((symbol) => {
            symbols.push(symbol);
          });
        let supplyShare = this.getLPShare();
        console.log(`Sup share ${supplyShare}`);
        for (let i = 0; i < this.reserveData.length - 1; i++) {
          this.reserveData[i] = parseFloat(
            ethers.utils.formatEther(this.reserveData[i])
          );
        }
        this.multiplierRatio = supplyShare / 100;
        this.symbols = symbols;
        // let reserves = this.reserves
        // console.log(`Reserves: ${JSON.stringify(reserves)}`)
        console.log(symbols);
      }
    },
    ensureCacheKey(contract, method, args) {
      if (!this._drizzleCacheKeys) {
        this._drizzleCacheKeys = Object.create(null);
      }

      const contractKeys =
        this._drizzleCacheKeys[contract] ||
        (this._drizzleCacheKeys[contract] = Object.create(null));
      const argsKey = args.length ? JSON.stringify(args) : "default";
      const methodKey = `${method}_${argsKey}`;

      if (contractKeys[methodKey]) {
        return contractKeys[methodKey];
      }

      let cacheKey;
      try {
        cacheKey = this.drizzleInstance.contracts[contract].methods[method].cacheCall(
          ...args
        );
      } catch (error) {
        console.error(`Error calling ${contract}.${method}:`, error);
        return null;
      }

      contractKeys[methodKey] = cacheKey;
      return cacheKey;
    },
    buildStrategyContract(address) {
      return new web3.eth.Contract(STRATEGY_ABI, address);
    },
    call(contract, method, args, out = "number") {
      // Safety checks to prevent null reference errors
      if (!this.drizzleInstance?.contracts?.[contract]?.methods?.[method]) {
        return out === "number" ? 0 : null;
      }

      const key = this.ensureCacheKey(contract, method, args);
      if (key === null) {
        return out === "number" ? 0 : null;
      }

      let value;
      try {
        value = this.contractInstances?.[contract]?.[method]?.[key]?.value;
      } catch (error) {
        console.error(`Error getting contract instance value:`, error);
        value = null;
      }

      let result;
      switch (out) {
        case "number":
          if (value === null || value === undefined) value = 0;
          // eslint-disable-next-line no-undef
          result = BigInt(value);
          break;
        case "address":
          if (value === null) value = "";
          result = value.toString();
          break;
        default:
          result = value;
      }

      return result;
    },
    primeVaultMetrics() {
      try {
        const requiredCalls = [
          ["Vault", "pricePerShare", []],
          ["Vault", "totalAssets", []],
          ["Vault", "availableDepositLimit", []],
        ];
        requiredCalls.forEach(([contract, method, args]) => {
          this.ensureCacheKey(contract, method, args);
        });
      } catch (error) {
        console.error("Error priming vault metrics:", error);
      }
    },
    async fetchStrategyVaultBalance(address, index) {
      try {
        const vaultContract = new web3.eth.Contract(yVaultV2, this.config.VAULT_ADDR);
        const rawBalance = await vaultContract.methods.balanceOf(address).call();
        const balanceBigInt = ethers.toBigInt(rawBalance);
        this.$set(this.strategies[index], "vaultBalance", balanceBigInt);
      } catch (error) {
        console.error("Error fetching strategy vault balance:", error);
        this.$set(this.strategies[index], "vaultBalance", 0n);
      }
    },
    formatAddress(address, chars = 4) {
      if (!address) {
        return "—";
      }
      const normalized = address.toLowerCase();
      return `${normalized.slice(0, 2 + chars)}…${normalized.slice(-chars)}`;
    },
    getExplorerUrl(address) {
      if (!address || !this.chainExplorer) {
        return null;
      }
      const base = this.chainExplorer.endsWith("/")
        ? this.chainExplorer.slice(0, -1)
        : this.chainExplorer;
      return `${base}/address/${address}`;
    },
    formatVaultShares(value) {
      try {
        if (value === null || value === undefined) {
          return "—";
        }
        const decimalsRaw = this.vault_decimals;
        const decimals =
          typeof decimalsRaw === "bigint"
            ? Number(decimalsRaw)
            : typeof decimalsRaw === "number"
            ? decimalsRaw
            : 18;
        const formatted = ethers.formatUnits(value, decimals);
        const num = Number(formatted);
        if (Number.isNaN(num)) {
          return formatted;
        }
        return num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
      } catch (error) {
        console.error("Error formatting vault shares:", error);
        return "—";
      }
    },
    isStrategyStrategist(strategy) {
      if (!strategy?.strategist || !this.activeAccount) {
        return false;
      }
      return strategy.strategist === this.activeAccount.toLowerCase();
    },
    isStrategyRewardsRecipient(strategy) {
      if (!strategy?.rewards || !this.activeAccount) {
        return false;
      }
      return strategy.rewards === this.activeAccount.toLowerCase();
    },
    hasStrategyRewards(strategy) {
      try {
        return strategy && strategy.vaultBalance && strategy.vaultBalance > 0n;
      } catch (error) {
        return false;
      }
    },
    async onHarvestStrategy(strategy, index) {
      if (!this.isStrategyStrategist(strategy)) {
        return;
      }
      const strategyContract = this.buildStrategyContract(strategy.address);
      this.$set(this.strategies[index], "_harvesting", true);
      this.error = null;
      try {
        await strategyContract.methods.harvest().send({ from: this.activeAccount });
        await this.fetchStrategyVaultBalance(strategy.address, index);
      } catch (error) {
        console.error("Error harvesting strategy:", error);
        this.error =
          (error && error.message) || "Failed to harvest the strategy. Please try again.";
      } finally {
        this.$set(this.strategies[index], "_harvesting", false);
      }
    },
    async onClaimStrategyRewards(strategy, index) {
      if (!this.isStrategyRewardsRecipient(strategy) || !this.hasStrategyRewards(strategy)) {
        return;
      }

      this.$set(this.strategies[index], "_claiming", true);
      this.error = null;

      try {
        const vaultContract = new web3.eth.Contract(yVaultV2, this.config.VAULT_ADDR);
        const amount = strategy.vaultBalance.toString();
        await vaultContract.methods
          .transferFrom(strategy.address, this.activeAccount, amount)
          .send({ from: this.activeAccount });

        await this.fetchStrategyVaultBalance(strategy.address, index);
      } catch (error) {
        console.error("Error pulling strategist rewards:", error);
        this.error =
          (error && error.message) ||
          "Failed to pull strategist rewards. Ensure the vault allowance is set.";
      } finally {
        this.$set(this.strategies[index], "_claiming", false);
      }
    },
  },
  computed: {
    ...mapGetters("accounts", ["activeAccount", "activeBalance"]),
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData", "contractInstances"]),
    isVaultMetricsReady() {
      if (!this.isDrizzleInitialized) {
        return false;
      }

      const vaultContracts = this.contractInstances?.Vault;
      if (!vaultContracts) {
        return false;
      }

      const hasValue = (methodName) => {
        const entries = vaultContracts[methodName];
        if (!entries) {
          return false;
        }
        return Object.values(entries).some(
          (entry) => entry && entry.value !== undefined && entry.value !== null
        );
      };

      return hasValue("pricePerShare") && hasValue("totalAssets");
    },
    isSkeletonActive() {
      return !this.isVaultMetricsReady;
    },

    user() {
      return this.activeAccount;
    },
    vault() {
      return this.drizzleInstance?.contracts?.["Vault"]?.address || null;
    },
    vault_perfFee() {
      return this.call("Vault", "performanceFee", [], "string") / 100;
    },
    vault_version() {
      return this.call("Vault", "apiVersion", [], "string");
    },
    vault_supply() {
      return this.call("Vault", "totalSupply", []);
    },
    vault_deposit_limit() {
      return this.call("Vault", "depositLimit", []);
    },
    vault_total_assets() {
      return this.call("Vault", "totalAssets", []);
    },
    vault_available_limit() {
      if (
        this.config.VAULT_STATUS == "active" ||
        this.config.VAULT_STATUS == ""
      ) {
        return this.call("Vault", "availableDepositLimit", []);
      } else {
        return BN_ZERO;
      }
    },
    vault_total_aum() {
      try {
        if (this.want_price > 0 && this.vault_total_assets) {
          // Convert vault_total_assets to a number, then divide by 10^16
          const assetsFloat = parseFloat(ethers.formatUnits(this.vault_total_assets, 16));
          return (assetsFloat / 100) * this.want_price;
        } else {
          return 0;
        }
      } catch (error) {
        console.error("Error calculating vault_total_aum:", error);
        return 0;
      }
    },
    vault_price_per_share() {
      return this.call("Vault", "pricePerShare", []);
    },
    vault_net_deposited_num() {
      let currVaultShares = this.$options.filters.fromWeiToFloat(
        this.yvtoken_balance
      );
      let curPricePerShare = this.$options.filters.fromWeiToFloat(
        this.vault_price_per_share
      );
      return currVaultShares * curPricePerShare;
    },
    lpSupply() {
      return this.call("wantPair", "totalSupply", []);
    },
    reserves() {
      return this.call("wantPair", "getReserves", [], "stringx");
    },
    token0() {
      return this.call("wantPair", "token0", [], "address");
    },
    token1() {
      return this.call("wantPair", "token1", [], "address");
    },
    get_vault_lpAssets() {
      let reserveInfo = {
        token0Symbol: this.symbols[0],
        token1Symbol: this.symbols[1],
        token0InVault: this.reserveData[0] * this.multiplierRatio,
        token1InVault: this.reserveData[1] * this.multiplierRatio,
      };
      return reserveInfo;
    },
    vault_net_deposited() {
      return this.vault_net_deposited_num.toLocaleString();
    },
    vault_decimals() {
      return this.call("Vault", "decimals", []);
    },
    yvtoken_balance() {
      return this.call("Vault", "balanceOf", [this.activeAccount]);
    },
    want_balance() {
      return this.call("WANT", "balanceOf", [this.activeAccount]);
    },
    coin_balance() {
      return this.activeBalance;
    },
    progress_limit() {
      try {
        if (!this.vault_deposit_limit || this.vault_deposit_limit.isZero?.()) {
          return 0;
        }
        if (!this.vault_available_limit) {
          return 0;
        }
        const limit = parseFloat(ethers.formatUnits(this.vault_deposit_limit, 0));
        const available = parseFloat(ethers.formatUnits(this.vault_available_limit, 0));
        if (limit === 0) return 0;
        return ((limit - available) / limit) * 100;
      } catch (error) {
        console.error("Error calculating progress_limit:", error);
        return 0;
      }
    },
    yfi_needed() {
      try {
        if (!this.entrance_cost || !this.total_yfi) return 0;
        // eslint-disable-next-line no-undef
        const cost = BigInt(this.entrance_cost.toString());
        // eslint-disable-next-line no-undef
        const total = BigInt(this.total_yfi.toString());
        return Number(cost - total);
      } catch (error) {
        console.error("Error calculating yfi_needed:", error);
        return 0;
      }
    },
    has_allowance_bribe() {
      try {
        const allowance = this.call("YFI", "allowance", [
          this.activeAccount,
          this.vault,
        ]);
        return allowance && allowance > 0;
      } catch (error) {
        console.error("Error checking bribe allowance:", error);
        return false;
      }
    },
    get_daily_apy() {
      return this.roi != undefined ? (this.roi / 7).toFixed(3) : 0;
    },
    get_weekly_apy() {
      return this.roi != undefined ? this.roi.toFixed(3) : 0;
    },
    get_yearly_apy() {
      return this.roi_year != undefined ? this.roi_year.toFixed(3) : 0;
    },
    has_allowance_vault() {
      try {
        const allowance = this.call("WANT", "allowance", [
          this.activeAccount,
          this.vault,
        ]);
        return allowance && allowance > 0;
      } catch (error) {
        console.error("Error checking vault allowance:", error);
        return false;
      }
    },
    has_want_balance() {
      return this.want_balance > 0;
    },
    has_yvtoken_balance() {
      return this.yvtoken_balance > 0;
    },
  },
  async created() {
    if (this.chainId && this.config.CHAIN_ID !== this.chainId) {
      window.location.href = "/";
    }
    if (this.isDrizzleInitialized) {
      this.primeVaultMetrics();
    }
    if (this.config.COINGECKO_SYMBOL != "")
      axios
        .get(
          "https://api.coingecko.com/api/v3/simple/price?ids=" +
            this.config.COINGECKO_SYMBOL.toLowerCase() +
            "&vs_currencies=usd"
        )
        .then((response) => {
          this.want_price =
            response.data[this.config.COINGECKO_SYMBOL.toLowerCase()].usd;
        });

    //Active account is defined?
    if (this.activeAccount !== undefined) this.load_reverse_ens();

    let Vault = new web3.eth.Contract(yVaultV2, this.vault);
    this.get_strategies(Vault);
    this.is_guest = true;

    // Get blocknumber and calc APY
    Vault.methods
      .pricePerShare()
      .call()
      .then((currentPrice) => {
        const seconds_in_a_year = 3.154e7;
        const now = Math.round(Date.now() / 1000);
        Vault.methods
          .activation()
          .call()
          .then((activationTime) => {
            // 1 week ago
            const one_week_ago = now - 60 * 60 * 24 * 7;
            const ts_past =
              one_week_ago < activationTime ? activationTime : one_week_ago;

            const ts_diff = now - ts_past;

            console.log("TS Past: " + one_week_ago);
            console.log("TS Activation: " + activationTime);
            //TODO reference central api instead for apy
            let pastPrice = this.config.WANT_SYMBOL == "KUS" ? 10 * 1e18 : 1e18;
            if (currentPrice > pastPrice) {
              console.log(`Pas price = ${pastPrice}`);
              let roi = (currentPrice / pastPrice - 1) * 100;
              console.log("Current Price: " + currentPrice);
              console.log("Past Price: " + pastPrice);
              this.roi = roi;
              this.roi_year = (roi / ts_diff) * seconds_in_a_year;
              console.log("ROI week: " + roi);
              console.log("ROI year: " + this.roi_year);
            } else {
              this.roi = 0;
              this.roi_year = 0;
            }
          });
      });
    // Iterate through strats
  },
  watch: {
    isDrizzleInitialized(newVal) {
      if (newVal) {
        this.primeVaultMetrics();
      }
    },
  },
};
</script>
<style scoped>
.vault-layout {
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
  background: rgba(148, 163, 184, 0.12);
}

.hero-card__metrics {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 12px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.hero-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-metric__label {
  font-size: 13px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
}

.hero-metric__value {
  font-size: 28px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.15;
}

.hero-metric--progress {
  gap: 0;
}

.metrics-row {
  row-gap: 24px;
}

.metric-card {
  border-radius: 18px;
  background: rgb(var(--v-theme-surface-container));
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
}

.metric-card__title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
}

.metric-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.metric-row:last-child {
  margin-bottom: 0;
}

.metric-row__label {
  font-size: 13px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
}

.metric-row__value {
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.metric-row--progress {
  gap: 0;
}

.section-card {
  border-radius: 18px;
  background: rgb(var(--v-theme-surface-container));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.section-card__title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
}

.wallet-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.wallet-metric {
  border-radius: 14px;
  padding: 12px;
  background: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgba(148, 163, 184, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.wallet-metric:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.wallet-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.wallet-value {
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.action-toggle {
  display: flex;
  justify-content: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strategies-section {
  margin-top: 44px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.strategy-card {
  border-radius: 18px;
  background: rgb(var(--v-theme-surface-container));
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.strategy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.strategy-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.contract-section {
  margin-top: 48px;
}

.contract-card {
  border-radius: 18px;
  background: rgb(var(--v-theme-surface-container));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.contract-card__content {
  padding: 16px 20px;
}

.contract-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
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
    margin-top: 14px;
  }
}

@media (max-width: 960px) {
  .vault-layout {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .hero-metric__value {
    font-size: 24px;
  }

  .wallet-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .strategies-section {
    margin-top: 32px;
  }
}

@media (max-width: 600px) {
  .hero-card__metrics {
    padding: 12px;
    gap: 16px;
  }

  .hero-metric__value {
    font-size: 22px;
  }

  .metric-row__value,
  .wallet-value {
    font-size: 18px;
  }

  .strategies-section,
  .contract-section {
    margin-top: 32px;
  }
}
</style>
