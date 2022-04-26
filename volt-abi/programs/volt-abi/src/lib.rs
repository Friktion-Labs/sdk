use anchor_lang::prelude::*;
declare_id!("VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp");

pub mod contexts;

use contexts::*;

#[program]
mod volt_abi {
    #![allow(dead_code)]
    #![allow(unused_variables)]
    #![allow(clippy::too_many_arguments)]

    use super::*;

    pub(crate) fn deposit(cx: Context<Deposit>, amount: u64) -> Result<()> {
        Ok(())
    }

    pub(crate) fn withdraw(cx: Context<Withdraw>, amount: u64) -> Result<()> {
        Ok(())
    }

    pub(crate) fn deposit_with_claim(cx: Context<DepositWithClaim>, amount: u64) -> Result<()> {
        Ok(())
    }

    pub(crate) fn withdraw_with_claim(cx: Context<WithdrawWithClaim>, amount: u64) -> Result<()> {
        Ok(())
    }

    pub(crate) fn claim_pending_deposit(cx: Context<ClaimPendingDeposit>) -> Result<()> {
        Ok(())
    }
    pub(crate) fn claim_pending_withdrawal(cx: Context<ClaimPendingWithdrawal>) -> Result<()> {
        Ok(())
    }

    pub(crate) fn cancel_pending_deposit(cx: Context<CancelPendingDeposit>) -> Result<()> {
        Ok(())
    }
    pub(crate) fn cancel_pending_withdrawal(cx: Context<CancelPendingWithdrawal>) -> Result<()> {
        Ok(())
    }
    // ========== TRADING ==========
}

#[account]
#[derive(Default)]
pub struct Whitelist {
    pub admin: Pubkey,

    /// The storage for information on reserves in the market
    pub addresses: Vec<Pubkey>,
}

#[account]
#[derive(Default)]
/**
 * User-specific PDA. Tracks information about their pending deposits.
 *  NOTES:
 *  1. There may only be one pending deposit (across all rounds) at any point in time
 *  2. However, pending deposits will accumulate if made in same round.
 *  3. Pending deposits from previous rounds may be claimed with the instruction "claim_pending"
 */
pub struct PendingDeposit {
    // unnecessary variable. indicates whether account exists
    pub initialized: bool,

    // round number this pending deposit is for.
    // #NOTE: round_number == 0 implies "no existing pending deposit"
    pub round_number: u64,

    // total amount that is or was pending to be deposited.
    // this number is used to calculate the # of volt tokens user should expect to receive after calling claim_pending.
    // this is incremented with new deposits, and decremented after calling claim_pending
    pub num_underlying_deposited: u64,
}

impl PendingDeposit {
    pub const LEN: usize = 17;
}

#[account]
#[derive(Default)]
/**
 * User-specific PDA. Tracks information about their pending withdrawals.
 *  NOTES:
 *  1. There may only be one pending withdrawal (across all rounds) at any point in time
 *  2. However, pending withdrawals will accumulate if made in same round.
 *  3. Pending withdrawals from previous rounds may be claimed with the instruction "claim_pending_withdrawal"
 */
pub struct PendingWithdrawal {
    // unnecessary variable. indicates whether account exists
    pub initialized: bool,

    // round number this pending withdrawal is for.
    // #NOTE: round_number == 0 implies "no existing pending withdrawal"
    pub round_number: u64,

    // total amount that is or was pending to be deposited.
    // this number is used to calculate the # of volt tokens user should expect to receive after calling claim_pending.
    // this is incremented with new deposits, and decremented after calling claim_pending
    pub num_volt_redeemed: u64,
}

impl PendingWithdrawal {
    pub const LEN: usize = 17;
}

#[account]
#[derive(Default)]
pub struct UlOpenOrdersMetadata {
    initialized: bool, // 1
}

impl UlOpenOrdersMetadata {
    pub const LEN: usize = 1;
}

#[account]
#[derive(Default, PartialEq, Debug)]
pub struct EntropyRound {
    pub instant_deposits_native: u64,
    pub prev_entropy_account_deposits: u64,
    pub initial_equity: f64,             //
    pub new_equity_post_deposit: f64,    // 16
    pub deposit_amt: f64,                // 24
    pub withdraw_comp_from_deposit: u64, // 32
    pub net_deposits: f64,               // 40
    pub deposit_amt_native: u64,         // 48
    pub withdraw_amt_native: u64,        // 56
    pub total_volt_supply: u64,
    pub oracle_price: f64,

    pub acct_equity_start: f64,
    pub acct_equity_before_next_rebalance: f64,
    pub pnl_quote: f64,
    pub performance_fees_quote: f64,

    pub temp1: Pubkey,        // 368
    pub temp2: Pubkey,        // 400
    pub temp3: Pubkey,        // 432
    pub extra_key_11: Pubkey, // 464
    pub extra_key_12: Pubkey, // 496

    pub unused_uint_four: u64, // 504
    pub unused_uint_five: u64, // 512
    pub unused_uint_six: u64,  // 520
    pub unused_uint_12: u64,   // 568

    pub unused_float1: f64, // 504
    pub unused_float2: f64, // 512
    pub unused_float3: f64, // 520
    pub unused_float4: f64, // 568

    pub unused_bool_one: bool,   // 569
    pub unused_bool_two: bool,   // 570
    pub unused_bool_three: bool, // 571
    pub unused_bool_four: bool,
}

impl EntropyRound {
    pub const LEN: usize = 348;
}

#[account]
#[derive(Default)]
/**
 * Epoch-specific PDA. Stores all information specific to that epoch.
 * New rounds are initialized in start_round.
 * Modified in deposit, withdraw, claim_pending, claim_pending_withdrawal
 */
pub struct Round {
    // numerical ranking of this round. round numbers start at 1, and are incremented
    // following each successful call of start_round
    pub number: u64,

    // total # of underlying from pending deposits created during this round.
    // NOTE: this has to be stored in the Round account in order to calculate correct
    // proportion of vault tokens for each user in claim_pending
    pub underlying_from_pending_deposits: u64,

    // total # of volt tokens from pending withdrawals created during this round.
    // NOTE: this has to be stored in the Round account in order to calculate correct
    // proportion of underlying tokens for each user in claim_pending_withdrawal
    pub volt_tokens_from_pending_withdrawals: u64,

    pub underlying_pre_enter: u64,

    pub underlying_post_settle: u64,

    pub premium_farmed: u64,
    // pub unused_space: [u64; 7],
}

impl Round {
    pub const LEN: usize = 48;
}

#[account]
#[derive(Default)]
pub struct FriktionEpochInfo {
    pub vault_token_price: f64,      // 8
    pub pct_pnl: f64,                // 16
    pub number: u64,                 // 24
    pub underlying_pre_enter: u64,   // 32
    pub underlying_post_settle: u64, // 40
    pub volt_token_supply: u64,      // 48
    pub pnl: i64,                    // 56

    pub performance_fees: u64, // 64
    pub withdrawal_fees: u64,  // 72

    pub pending_deposits: u64, // 80

    pub pending_withdrawals_volt_tokens: u64, // 88
    pub pending_withdrawals: u64,             // 96
    // in volt tokens
    pub canceled_withdrawals: u64, // 104
    pub canceled_deposits: u64,    // 112
    pub total_withdrawals: u64,    // 120
    pub total_deposits: u64,       // 128
    pub instant_deposits: u64,     // 136
    pub instant_withdrawals: u64,  // 144
    pub dao_deposits: u64,         // 152
    pub minted_options: u64,       // 160

    pub enter_num_times_called: u64,        // 168
    pub swap_premium_num_times_called: u64, // 176

    pub option_key: Pubkey, // 208

    pub extra_key_four: Pubkey, // 240
    pub extra_key_5: Pubkey,    // 272
    pub extra_key_6: Pubkey,    // 304
    pub extra_key_7: Pubkey,    // 336
    pub extra_key_8: Pubkey,    // 368
    pub extra_key_9: Pubkey,    // 400
    pub extra_key_10: Pubkey,   // 432
    pub extra_key_11: Pubkey,   // 464
    pub extra_key_12: Pubkey,   // 496

    pub unused_uint_four: u64, // 504
    pub unused_uint_five: u64, // 512
    pub unused_uint_six: u64,  // 520
    pub unused_uint_7: u64,    // 528
    pub unused_uint_8: u64,    // 536
    pub unused_uint_9: u64,    // 544
    pub unused_uint_10: u64,   // 552
    pub unused_uint_11: u64,   // 560
    pub unused_uint_12: u64,   // 568

    pub unused_bool_one: bool,   // 569
    pub unused_bool_two: bool,   // 570
    pub unused_bool_three: bool, // 571
    pub unused_bool_four: bool,  // 572
    pub unused_bool_five: bool,  // 573
    pub unused_bool_six: bool,   // 574
}

impl FriktionEpochInfo {
    pub const LEN: usize = 574;
}

#[account]
#[derive(Default, Debug)]
pub struct EntropyMetadata {
    // generic across all entropy vaults
    pub target_hedge_ratio: f64,

    pub rebalancing_lenience: f64,

    // basis volt stuff
    pub required_basis_from_oracle: f64,

    pub extra_key_3: Pubkey,  // 368
    pub extra_key_4: Pubkey,  // 400
    pub extra_key_5: Pubkey,  // 432
    pub extra_key_6: Pubkey,  // 464
    pub extra_key_7: Pubkey,  // 496
    pub extra_key_8: Pubkey,  // 368
    pub extra_key_9: Pubkey,  // 400
    pub extra_key_10: Pubkey, // 432
    pub extra_key_11: Pubkey, // 464
    pub extra_key_12: Pubkey, // 496

    pub unused_uint_four: u64, // 504
    pub unused_uint_five: u64, // 512
    pub unused_uint_six: u64,  // 520
    pub unused_uint_12: u64,   // 568
    pub unused_uint_123: u64,  // 504
    pub unused_uint_456: u64,  // 512
    pub unused_uint_789: u64,  // 520
    pub unused_uint_102: u64,  // 568

    pub unused_float1: f64,  // 504
    pub unused_float2: f64,  // 512
    pub unused_float3: f64,  // 520
    pub unused_float4: f64,  // 568
    pub unused_float5: f64,  // 504
    pub unused_float6: f64,  // 512
    pub unused_float7: f64,  // 520
    pub unused_float8: f64,  // 568
    pub unused_float9: f64,  // 504
    pub unused_float10: f64, // 512
    pub unused_float11: f64, // 520
    pub unused_float12: f64, // 568

    pub unused_bool_one: bool,   // 569
    pub unused_bool_two: bool,   // 570
    pub unused_bool_three: bool, // 571
    pub unused_bool_four: bool,
    pub unused_bool_five: bool,  // 569
    pub unused_bool_six: bool,   // 570
    pub unused_bool_seven: bool, // 571
    pub unused_bool_eight: bool,
    pub unused_bool_nine: bool, // 571
    pub unused_bool_ten: bool,

    pub vault_name: String,
}

impl EntropyMetadata {
    pub const LEN: usize = 512 + 30;
}

#[account]
#[derive(Default, Copy, Debug)]
pub struct ExtraVoltData {
    pub is_whitelisted: bool, // 1

    pub whitelist: Pubkey, // 33

    pub is_for_dao: bool, // 34

    pub dao_program_id: Pubkey, // 66

    // spl mint of deposit token
    pub deposit_mint: Pubkey, // 98

    // target leverage amount (as ratio) for the position (for each rebalance)
    pub target_leverage: f64, // 106

    // defines width of interval collateralization ratio at end of round must lie within
    pub target_leverage_lenience: f64, // 114

    // leverage threshold for calling exit_early instructoin
    pub exit_early_ratio: f64, // 130

    // is this trading on mango or entropy (or 01 :P)?
    pub entropy_program_id: Pubkey, // 194

    // group the protocol trades on
    pub entropy_group: Pubkey, // 226 186

    // account the program initializes to trade with
    pub entropy_account: Pubkey, // 258 218

    // pubkey of perp market to trade
    pub power_perp_market: Pubkey, // 322

    // true after settle_deposits was called successfully for current round
    pub have_resolved_deposits: bool, // 355

    // true after obtained target collateralization, ready to end round
    pub done_rebalancing: bool, // 356

    pub dao_authority: Pubkey,    // 388
    pub serum_program_id: Pubkey, // 420
    pub entropy_cache: Pubkey,    // 348 (actual)
    /// pubkey of perp market to hedge
    pub spot_perp_market: Pubkey, // 354 (380)
    pub extra_key_7: Pubkey,      // 516  412
    pub extra_key_8: Pubkey,      // 548 444
    pub extra_key_9: Pubkey,      // 580
    pub extra_key_10: Pubkey,     // 612
    pub extra_key_11: Pubkey,     // 644
    pub extra_key_12: Pubkey,
    pub extra_key_13: Pubkey,
    pub extra_key_14: Pubkey, // 636

    pub net_withdrawals: u64,      // 644
    pub max_quote_pos_change: u64, // 652
    // defines width of dollar delta range hedge must lie within
    pub target_hedge_lenience: f64, // 122
    pub unused_uint_four: u64,      // 676
    pub unused_uint_five: u64,      // 684
    pub unused_uint_six: u64,       // 692
    pub unused_uint_7: u64,         // 700
    pub unused_uint_8: u64,         // 708
    pub unused_uint_9: u64,         // 716
    pub unused_uint_10: u64,        // 724
    pub unused_uint_11: u64,        //
    pub unused_uint_12: u64,        // 732

    pub turn_off_deposits_and_withdrawals: bool, //
    pub rebalance_is_ready: bool,                //
    pub unused_bool1234: bool,                   //
    pub done_rebalancing_power_perp: bool,       //
    pub is_hedging_on: bool,                     //
    pub have_taken_performance_fees: bool,       // 738
}

impl ExtraVoltData {
    pub const LEN: usize = 738;
}

#[account]
#[derive(Default, Copy, Debug)]
pub struct VoltVault {
    // permissioned instructions
    pub admin_key: Pubkey, // 32

    pub seed: Pubkey, // 64

    ///////// time windows ///////////

    // length of withdrawal window in seconds
    pub transfer_window: u64, // 72

    // time at which withdrawals began
    pub start_transfer_time: u64, // 80

    // minimum time at which withdrawals end
    pub end_transfer_time: u64, // 88

    ///////// rebalance pipeline state ///////////

    // has vault been initialized?
    pub initialized: bool, // 89

    // has the current/previous options position been settled?
    // settlement is defined as having all AUM of this volt stored in one asset (underlying)
    pub curr_option_was_settled: bool, // 90

    // do we have to swap premium to underlying before entering position?
    pub must_swap_premium_to_underlying: bool, // 91

    // has the next option to roll into been set?
    pub next_option_was_set: bool, // 92

    // has set_next_option been called successfully a single time yet?
    pub first_ever_option_was_set: bool, // 93

    // should deposit/withdraw still be validly callable?
    pub instant_transfers_enabled: bool, // 94

    // has rebalance prepare been called this cycle?
    pub prepare_is_finished: bool, // 95

    // are we out of options to sell in the rebalance enter stage of this cycle?
    pub enter_is_finished: bool, // 96

    // has the current round started?
    pub round_has_started: bool, // 97

    // round number of roll. increments post-settlement (maybe set next option)
    pub round_number: u64, // 105

    ////// Rewards Tracking //////

    // total amount in vault when set next option was last called
    pub total_underlying_pre_enter: u64, // 113

    // total amount in vault immediately following full settlement
    pub total_underlying_post_settle: u64, // 121

    // total number of volt tokens in supply post settlement
    // used for calculating share of pnl
    pub total_volt_tokens_post_settle: u64, // 129

    ///////// accounts to save here so others can read. additionally for account_validators.rs ///////////
    pub vault_authority: Pubkey, // 161

    // pools
    pub deposit_pool: Pubkey, // 193

    pub premium_pool: Pubkey, // 225

    pub option_pool: Pubkey, // 257

    pub writer_token_pool: Pubkey, // 289

    // mints
    pub vault_mint: Pubkey, // 321

    pub underlying_asset_mint: Pubkey, // 353

    pub quote_asset_mint: Pubkey, // 385

    pub option_mint: Pubkey, // 417

    pub writer_token_mint: Pubkey, // 449

    pub option_market: Pubkey, // 481

    ///////// vault strategy params ///////////

    // integer describing the vault strategy
    pub vault_type: u64, // 489

    /// The amount of the **underlying asset** that derives a single option
    pub underlying_amount_per_contract: u64, // 497

    // strike * underlying per contract
    pub quote_amount_per_contract: u64, // 505

    /// The Unix timestamp at which the contracts in this market expire
    pub expiration_unix_timestamp: i64, // 513

    // exact expiry length the target option should have, except for the initial option
    pub expiration_interval: u64, // 521

    // option is assumed to be OTM. this limits how high the strike can be relative to current underlying price.
    // i.e, new strike must be less than or equal to (underlying price * upper_bound_otm_strike_factor)
    // NOTE: value should be given from client as (desired factor) * 10, so need to divide by 10 to get actual normalization
    pub upper_bound_otm_strike_factor: u64, // 529

    /// A flag to set and use to when running a memcmp query.
    /// This will be set when Serum markets are closed and expiration is validated
    pub have_taken_withdrawal_fees: bool, // 530

    ///////// serum ///////////
    pub serum_spot_market: Pubkey, // 562

    // bump for program address of open orders account (serum)
    pub open_orders_bump: u8, // 563

    // bump for serum (unknown)
    pub open_orders_init_bump: u8, // 564

    // bump for open orders for underlying serum market
    pub ul_open_orders_bump: u8, // 565

    // open orders account for underlying spot market
    pub ul_open_orders: Pubkey, // 597

    // was the ul open orders acct already initialized?
    pub ul_open_orders_initialized: bool, // 598

    // bump for vault authority, used to generate signer seeds for CPI calls
    pub bump_authority: u8, // 599

    // order size in # contracts to sell options
    pub serum_order_size_options: u64, // 607

    // order size in # contracts to sell options
    pub individual_capacity: u64, // 615

    // type of order to submit (limit, postonly, IOC)
    pub serum_order_type: u64, // 623

    // unknown usage, set to 65535 works
    pub serum_limit: u16, // 625

    // specifies what serum should do if the order is matched w/ an order from the same account
    pub serum_self_trade_behavior: u16, // 627

    // order ID to use when sending a serum order. should be incremented following each succesful order
    pub serum_client_order_id: u64, // 635
    // pub whitelist: Pubkey,
    // pub unused_space:
    // pub unused_space: [u64; 30],
    pub whitelist_token_mint: Pubkey, // 667

    pub permissioned_market_premium_mint: Pubkey, // 699
    pub permissioned_market_premium_pool: Pubkey, // 731
    // pub extra_key_two:   ,
    pub capacity: u64, // 739
                       // pub unused_uint_two: u64,
                       // pub extra_key_three: Pubkey,
                       // pub extra_key_four: Pubkey,

                       // pub unused_uint_one: u64,
                       // pub unused_uint_two: u64,
                       // pub unused_uint_three: u64,
                       // pub unused_uint_four: u64,
                       // pub unused_uint_five: u64,
                       // pub unused_uint_six: u64,
}

impl VoltVault {
    pub const LEN: usize = 739;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Expiration must be in the future")]
    ExpirationIsInThePast,
    #[msg("Same quote and underlying asset, cannot create market")]
    QuoteAndUnderlyingAssetMustDiffer,
    #[msg("Quote amount and underlying amount per contract must be > 0")]
    QuoteOrUnderlyingAmountCannotBe0,
    #[msg("OptionMarket must be the mint authority")]
    OptionMarketMustBeMintAuthority,
    #[msg("OptionMarket must own the underlying asset pool")]
    OptionMarketMustOwnUnderlyingAssetPool,
    #[msg("OptionMarket must own the quote asset pool")]
    OptionMarketMustOwnQuoteAssetPool,
    #[msg("Stop trying to spoof the SPL Token program! Shame on you")]
    ExpectedSPLTokenProgramId,
    #[msg("Mint fee account must be owned by the FEE_OWNER")]
    MintFeeMustBeOwnedByFeeOwner,
    #[msg("Exercise fee account must be owned by the FEE_OWNER")]
    ExerciseFeeMustBeOwnedByFeeOwner,
    #[msg("Mint fee token must be the same as the underlying asset")]
    MintFeeTokenMustMatchUnderlyingAsset,
    #[msg("Exercise fee token must be the same as the quote asset")]
    ExerciseFeeTokenMustMatchQuoteAsset,
    #[msg("OptionMarket is expired, can't mint")]
    OptionMarketExpiredCantMint,
    #[msg("Underlying pool account does not match the value on the OptionMarket")]
    UnderlyingPoolAccountDoesNotMatchMarket,
    #[msg("OptionToken mint does not match the value on the OptionMarket")]
    OptionTokenMintDoesNotMatchMarket,
    #[msg("WriterToken mint does not match the value on the OptionMarket")]
    WriterTokenMintDoesNotMatchMarket,
    #[msg("MintFee key does not match the value on the OptionMarket")]
    MintFeeKeyDoesNotMatchOptionMarket,
    #[msg("The size argument must be > 0")]
    SizeCantBeLessThanEqZero,
    #[msg("exerciseFee key does not match the value on the OptionMarket")]
    ExerciseFeeKeyDoesNotMatchOptionMarket,
    #[msg("Quote pool account does not match the value on the OptionMarket")]
    QuotePoolAccountDoesNotMatchMarket,
    #[msg("Underlying destination mint must match underlying asset mint address")]
    UnderlyingDestMintDoesNotMatchUnderlyingAsset,
    #[msg("Fee owner does not match the program's fee owner")]
    FeeOwnerDoesNotMatchProgram,
    #[msg("OptionMarket is expired, can't exercise")]
    OptionMarketExpiredCantExercise,
    #[msg("OptionMarket has not expired, can't close")]
    OptionMarketNotExpiredCantClose,
    #[msg("Not enough assets in the quote asset pool")]
    NotEnoughQuoteAssetsInPool,
    #[msg("Invalid auth token provided")]
    InvalidAuth,
    #[msg("Coin mint must match option mint")]
    CoinMintIsNotOptionMint,
    #[msg("Cannot prune the market while it's still active")]
    CannotPruneActiveMarket,
    #[msg("Numerical overflow")]
    NumberOverflow,
    #[msg("Invalid order type")]
    InvalidOrderType,
    #[msg("Invalid self trade behavior")]
    InvalidSelfTradeBehavior,
    #[msg("Unauthorized.")]
    Unauthorized,
    #[msg("Insufficient collateral to write options.")]
    InsufficientCollateralForWriting,
    #[msg("Insufficient Vault tokens to redeem.")]
    InsufficientVaultTokens,
    #[msg("Options contract is expired.")]
    ContractExpired,
    #[msg("Cannot redeem until contract expiry.")]
    ContractNotYetExpired,
    #[msg("mint amount was 0, skipping mint_helper()...")]
    InvalidMintAmount,
    #[msg("invalid time to exit position rebalanceExit()")]
    InvalidRebalanceExitTime,
    #[msg("invalid time to enter position rebalanceEnter()")]
    InvalidRebalanceEntryTime,
    #[msg("invalid time to call rebalancePrepare()")]
    InvalidRebalancePrepareTime,
    #[msg("invalid time to withdraw")]
    InvalidWithdrawalTime,
    #[msg("invalid time to deposit")]
    InvalidDepositTime,
    #[msg("invalid time to set next option")]
    InvalidSetNextOptionTime,
    #[msg("invalid deposit amount")]
    InvalidDepositAmount,
    #[msg("invalid rebalance settle time")]
    InvalidRebalanceSettleTime,
    #[msg("invalid rebalance settle state")]
    InvalidRebalanceSettleState,
    #[msg("invalid rebalance enter state")]
    InvalidRebalanceEnterState,
    #[msg("options position not settled, must be before withdrawal")]
    OptionsPositionNotSettled,
    #[msg("non underlying pools have assets when attempting withdraw")]
    NonUnderlyingPoolsHaveAssets,

    #[msg("volt must be vault mint authority")]
    VaultAuthorityMustBeVaultMintAuthority,
    #[msg("volt must own deposit pool")]
    VaultAuthorityMustOwnDepositPool,
    #[msg("volt must own premium pool")]
    VaultAuthorityMustOwnPremiumPool,
    #[msg("volt must own writer token pool")]
    VoltVaulttMustOwnWriterTokenPool,
    #[msg("volt must own option pool")]
    VoltVaultMustOwnOptionPool,

    #[msg("DepositPoolDoesNotMatchVoltVault")]
    DepositPoolDoesNotMatchVoltVault,
    #[msg("OptionPoolDoesNotMatchVoltVault")]
    OptionPoolDoesNotMatchVoltVault,
    #[msg("PremiumPoolDoesNotMatchVoltVault")]
    PremiumPoolDoesNotMatchVoltVault,
    #[msg("TradingPoolDoesNotMatchVoltVault")]
    TraidngPoolDoesNotMatchVoltVault,
    #[msg("option mint does not match option market")]
    OptionMintDoesNotMatchOptionMarket,

    #[msg("NoBidsInOptionOrderBook")]
    NoOrdersInOptionOrderBook,

    #[msg("cpi program must be Some in place order")]
    CpiProgramMustBeSomeInPlaceOrder,

    #[msg("new option must not be expired")]
    NewOptionMustNotBeExpired,
    #[msg("new option has roughly target expiry (within lower/upper bounds)")]
    NewOptionMustHaveExactExpiry,
    #[msg("new option has wrong underlying asset")]
    NewOptionHasWrongUnderlyingAsset,
    #[msg("new option has wrong quote asset")]
    NewOptionHasWrongQuoteAsset,
    #[msg("new option has wrong contract size")]
    NewOptionHasWrongContractSize,
    #[msg("new option has invalid strike")]
    NewOptionHasInvalidStrike,
    #[msg("rebalance settle has leftover writer tokens")]
    RebalanceSettleHasLeftoverWriterTokens,
    #[msg("current option must not be expired")]
    CurrentOptionMustNotBeExpired,
    #[msg("cannot reinitialize an (already initialized) volt")]
    CannotReinitializeVolt,
    #[msg("cannot reinitialize an (already initialized) volt")]
    OldOptionAndWriterTokenPoolsMustBeEmpty,
    #[msg("invalid old option writer token pools")]
    InvalidOldOptionWriterTokenPools,

    #[msg("vault mint does not match user token account")]
    VaultMintDoesNotMatchUserTokenAccount,
    #[msg("deposit pool mint does not match user token account")]
    DepositPoolMintDoesNotMatchUserTokenAccount,
    #[msg("vault authority does not match")]
    VaultAuthorityDoesNotMatch,
    #[msg("DEX program id does not match")]
    DexProgramIdDoesNotMatchAnchor,
    #[msg("Inertia program id does not match")]
    InertiaProgramIdDoesNotMatch,
    #[msg("Invalid authority for permissioned instruction")]
    InvalidAuthorityForPermissionedInstruction,
    #[msg("writer token mint does not match option market")]
    WriterTokenMintDoesNotMatchOptionMarket,
    #[msg("option market should be owned by protocol (e.g inertia)")]
    OptionMarketMustBeOwnedByProtocol,
    #[msg("underlying asset mint does not match voltvault")]
    UnderlyingAssetMintDoesNotMatchVoltVault,
    #[msg("quote asset mint does not match voltvault")]
    QuoteAssetMintDoesNotMatchVoltVault,
    #[msg("vault mint does not match volt vault")]
    VaultMintDoesNotMatchVoltVault,
    #[msg("option market does not match volt vault")]
    OptionMarketDoesNotMatchVoltVault,
    #[msg("writer token pool does not match volt vault")]
    WriterTokenPoolDoesNotMatchVoltVault,
    #[msg("invalid rebalance swap premium state")]
    InvalidRebalanceSwapPremiumState,
    #[msg("should be unreachable code")]
    ShouldBeUnreachable,
    #[msg("shouldn't have multiple pending deposits")]
    CantHaveMultiplePendingDeposits,
    #[msg("invalid start round state")]
    InvalidStartRoundState,
    #[msg("invalid set next option state")]
    InvalidSetNextOptionState,
    #[msg("invalid claim pending state")]
    InvalidClaimPendingState,
    #[msg("invalid end round state")]
    InvalidEndRoundState,
    #[msg("shouldn't have multiple pending deposits")]
    CantHaveMultiplePendingWithdrawals,
    #[msg("invalid claim pending withdrawal state")]
    InvalidClaimPendingWithdrawalState,
    #[msg("invalid next option market")]
    InvalidNextOptionMarket,
    #[msg("Auth token not revoked")]
    TokenNotRevoked,
    #[msg("user is not whitelisted")]
    NonWhitelistedUser,
    #[msg("user is not signer")]
    UserIsNotSigner,
    #[msg("authority does not match whitelist admin")]
    InvalidWhitelistAuthority,
    #[msg("whitelist and option market do not generate correct PDA")]
    InvalidWhitelistAndOptionMarketCombination,
    #[msg("round volt tokens mint does not match volt vault")]
    RoundVoltTokensMintDoesNotMatchVoltVault,
    #[msg("round underlying tokens mint does not match volt vault")]
    RoundUnderlyingTokensMintDoesNotMatchVoltVault,
    #[msg("UnderlyingAssetPoolDoesNotMatchOptionMarket")]
    UnderlyingAssetPoolDoesNotMatchOptionMarket,
    #[msg("no opposite order on serum market")]
    NoOppositeOrderOnSerumMarket,
    #[msg("bid price on serum market too low")]
    BidPriceOnSerumMarketTooLow,
    #[msg("offer price on serum market too high")]
    OfferPriceOnSerumMarketTooHigh,
    #[msg("underlying open orders does not match volt vault")]
    UnderlyingOpenOrdersDoesNotMatchVoltVault,
    #[msg("must have at least one market maker access token")]
    MustHaveAtLeastOneMarketMakerAccessToken,
    #[msg("middleware program id does not match expected")]
    MiddlewareProgramIdDoesNotMatch,
    #[msg("fee account owner does not match expected")]
    FeeAccountOwnerDoesNotMatch,
    #[msg("fee account mint does not match deposit pool")]
    FeeAccountMintDoesNotMatchDepositPool,
    #[msg("vault capacity would be exceeded")]
    VaultCapacityWouldBeExceeded,
    #[msg("individual deposit capacity would be exceeded")]
    IndividualDepositCapacityWouldBeExceeded,
    #[msg("unsupported option market program ID")]
    UnsupportedOptionMarketProgramId,
    #[msg("invalid end dca round state")]
    InvalidEndDcaRoundState,
    #[msg("round has not started")]
    RoundHasNotStarted,
    #[msg("permissioned makret premium pool does not match volt")]
    PermissionedMarketPremiumPoolDoesNotMatchVoltVault,
    #[msg("token account owners do not match")]
    TokenAccountOwnersDoNotMatch,
    #[msg("invalid permissioned market premium mint")]
    InvalidPermissionedMarketPremiumMint,
    #[msg("premium pool amount must be greater than zero")]
    PremiumPoolAmountMustBeGreaterThanZero,
    #[msg("can't close non empty token account")]
    CantCloseNonEmptyTokenAccount,
    #[msg("must finish entering before settling permissioned market premium funds")]
    MustFinishEnteringBeforeSettlingPermissionedMarketPremium,
    #[msg("pending withdrawal info must be initialized")]
    PendingWithdrawalInfoNotInitialized,
    #[msg("pending withdrawal does not exist")]
    PendingWithdrawalDoesNotExist,
    #[msg("cannot cancel pending withdrawal from old round")]
    CannotCancelPendingWithdrawalFromOldRound,
    #[msg("invalid take pending withdrawal fees state")]
    InvalidTakePendingWithdrawalFeesState,
    #[msg("pending deposit info not initialized")]
    PendingDepositInfoNotInitialized,
    #[msg("pending deposits does not exist")]
    PendingDepositDoesNotExist,
    #[msg("cannot cancel pending deposit from old round")]
    CannotCancelPendingDepositFromOldRound,
    #[msg("vault destination does not match volt vault")]
    VaultDestinationDoesNotMatchVoltVault,
    #[msg("must take withdrawal fees before starting round")]
    MustTakeWithdrawalFeesBeforeStartingRound,
    #[msg("round must be ended")]
    RoundMustBeEnded,
    #[msg("must not have sold option tokens to reset")]
    MustNotHaveSoldOptionTokens,
    #[msg("cannot close account unless empty")]
    CantCloseAccountUnlessEmpty,
    #[msg("open orders must be empty to close")]
    OpenOrderMustBeEmptyToClose,
    #[msg("invalid whitelist account (vector)")]
    InvalidWhitelistAccountVector,
    #[msg("invalid dao program ID")]
    InvalidDaoProgramId,
    #[msg("volt must be for dao")]
    VoltMustBeForDao,
    #[msg("invalid dao authority")]
    InvalidDaoAuthority,
    #[msg("dao authority must sign")]
    DaoAuthorityMustSign,
    #[msg("invalid pending deposit key")]
    InvalidPendingDepositKey,
    #[msg("invalid authority check")]
    InvalidAuthorityCheck,
    #[msg("entropy: invalid end entropy round state")]
    InvalidEndEntropyRoundState,
    #[msg("invalid volt type")]
    InvalidVoltType,
    #[msg("can't find perp market index")]
    CantFindPerpMarketIndex,
    #[msg("account equity less than zero")]
    AccountEquityLessThanZero,
    #[msg("quote position changed too much")]
    QuotePositionChangedTooMuch,
    #[msg("must move closer to target collateralization")]
    MustMoveCloserToTargetCollateralization,
    #[msg("collateral not within lenience")]
    CollateralNotWithinLenience,
    #[msg("invalid rebalance entropy state")]
    InvalidRebalanceEntropyState,
    #[msg("volt must have negative base position (be short)")]
    BasePositionMustBeNegative,
    #[msg("volt must have positive quote position (be short)")]
    QuotePositionMustBePositive,
    #[msg("target collateral ratio must be neggat")]
    TargetCollateralRatioMustBeNegative,
    #[msg("new equity must be higher than deposit amt")]
    NewEquityMustBeHigherThanDepositAmount,
    #[msg("instant transfers must be enabled")]
    InstantTransfersMustBeDisabled,
    #[msg("rebalance must be ready")]
    RebalanceMustBeReady,
    #[msg("spot hedge unbalanced")]
    IncorrectHedge,
    #[msg("vault name must be zero length")]
    VaultNameMustBeNonZeroLength,
    #[msg("vault does not support over leveraged strategies")]
    VaultDoesNotSupportOverLeveragedStrategies,
    #[msg("lenience must be greater than zero")]
    LenienceMustBeGreaterThanZero,
    #[msg("lenience should not be greater than leverage")]
    LenienceShouldNotBeGreaterThanLeverage,
    #[msg("hedge lenience should be greater than leverage")]
    HedgeLenienceMustBeGreaterThanZero,
    #[msg("exit early ratio must be < 1.0")]
    VaultDoesNotSupportExitEarlyOverLeveragedStrategies,
    #[msg("round number must not overflow")]
    RoundNumberMustNotOverflow,
    #[msg("invalid whitelist token account mint")]
    InvalidWhitelistTokenAccountMint,
    #[msg("soloptions program id does not matchf")]
    SoloptionsProgramIdDoesNotMatch,
    #[msg("whitelist token account owner is not user")]
    WhitelistTokenAccountOwnerIsNotUser,
    #[msg("sol transfer authority must be owned by volt program")]
    SolTransferAuthorityMustNotBeOwnedByVoltProgram,
    #[msg("Insufficient collateral to deposit.")]
    InsufficientCollateralForDeposit,
    #[msg("sol transfer authority must be writable/signer")]
    SolTransferAuthorityMustBeWritableAndSigner,
    #[msg("volt must be entropy type")]
    VoltMustBeOfEntropyType,
    #[msg("volt must be of short options type")]
    VoltMustBeofShortOptionsType,
    #[msg("deposits and withdrawals are turned off")]
    DepositsAndWithdrawalsAreTurnedOff,
    #[msg("unrecognized entropy program id")]
    UnrecognizedEntropyProgramId,
    #[msg("invalid take performance fees state")]
    InvalidTakePerformanceFeesState,
    #[msg("discriminator does not match")]
    DiscriminatorDoesNotMatch,
    #[msg("realized oracle price too far off client provided")]
    RealizedOraclePriceTooFarOffClientProvided,
    #[msg("vault mint supply must be zero if equity is zero")]
    VaultMintSupplyMustBeZeroIfEquityIsZero,
    #[msg("invalid setup rebalance entropy state")]
    InvalidSetupRebalanceEntropyState,
}
