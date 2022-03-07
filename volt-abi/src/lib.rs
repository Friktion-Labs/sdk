mod types;
use anchor_lang::prelude::*;
use solana_program::pubkey;

declare_id!("VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp");

#[program]
mod volt_abi {
    #![allow(dead_code)]
    #![allow(unused_variables)]
    #![allow(clippy::too_many_arguments)]

    use super::*;

    pub(crate) fn deposit(
        cx: Context<Deposit>,
        amount: u64,
    ) -> Result<()> {
        Ok(())
    }

    pub(crate) fn withdraw(
        cx: Context<Withdraw>,
        amount: u64,
    ) -> Result<()> {
        Ok(())
    }

    pub(crate) fn claim_pending_deposit(
        cx: Context<ClaimPendingDeposit>,
        amount: u64,
    ) -> Result<()> {
        Ok(())
    }
    pub(crate) fn claim_pending_withdrawal(
        cx: Context<ClaimPendingWithdrawal>,
        amount: u64,
    ) -> Result<()> {
        Ok(())
    }
    // ========== TRADING ==========


}

#[derive(Accounts)]
#[instruction(
    deposit_amount: u64,
)]
pub struct Deposit<'info> {
    /// CHECK: skip
    #[account(mut)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    pub authority_check: AccountInfo<'info>,

    #[account(mut, signer)]
    /// CHECK: skip
    pub payer: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub extra_volt_data: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub deposit_pool: AccountInfo<'info>,

    /// CHECK: skip
    pub writer_token_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip
    pub vault_token_destination: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip
    pub underlying_token_source: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_volt_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_underlying_tokens: AccountInfo<'info>,

    /// CHECK: skip
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
}


#[derive(Accounts)]
#[instruction(
    deposit_amount: u64,
)]
pub struct DepositDaoExample<'info> {
    /// CHECK: skip
    #[account(mut)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    #[account(mut, signer)]
    /// CHECK: skip
    pub payer: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub extra_volt_data: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub deposit_pool: AccountInfo<'info>,

    /// CHECK: skip
    pub writer_token_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip
    pub vault_token_destination: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip
    pub underlying_token_source: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_volt_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_underlying_tokens: AccountInfo<'info>,

    /// CHECK: skip
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
}


#[derive(Accounts)]
#[instruction(
    deposit_amount: u64,
)]
pub struct Deposit<'info> {
    #[account(mut, signer)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    /// CHECK: skip
    pub dao_authority: AccountInfo<'info>

    #[account()]
    /// CHECK: skip, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub extra_volt_data: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub deposit_pool: AccountInfo<'info>,

    /// CHECK: skip
    pub writer_token_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip
    pub vault_token_destination: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip
    pub underlying_token_source: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_volt_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_underlying_tokens: AccountInfo<'info>,

    /// CHECK: skip
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
}


#[derive(Accounts)]
#[instruction(
    withdraw_amount: u64,
)]
pub struct Withdraw<'info> {
    /// CHECK: skip
    #[account(mut)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    #[account(mut, signer)]
    /// CHECK: skip
    pub payer: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub extra_volt_data: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub deposit_pool: AccountInfo<'info>,

    /// CHECK: skip
    pub writer_token_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip
    pub vault_token_destination: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip
    pub underlying_token_source: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_volt_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_underlying_tokens: AccountInfo<'info>,

    /// CHECK: skip
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
}



#[derive(Accounts)]
pub struct ClaimPendingDeposit<'info> {
    /// CHECK: skip
    #[account(mut)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    #[account(mut, signer)]
    /// CHECK: skip
    pub payer: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub extra_volt_data: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub deposit_pool: AccountInfo<'info>,

    /// CHECK: skip
    pub writer_token_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip
    pub vault_token_destination: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip
    pub underlying_token_source: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_volt_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_underlying_tokens: AccountInfo<'info>,

    /// CHECK: skip
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
}



#[derive(Accounts)]
pub struct ClaimPendingWithdrawal<'info> {
    /// CHECK: skip
    #[account(mut)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    #[account(mut, signer)]
    /// CHECK: skip
    pub payer: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub extra_volt_data: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub deposit_pool: AccountInfo<'info>,

    /// CHECK: skip
    pub writer_token_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip
    pub vault_token_destination: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip
    pub underlying_token_source: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_volt_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_underlying_tokens: AccountInfo<'info>,

    /// CHECK: skip
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
}


#[account]
#[derive(Default)]
pub struct VoltVault {
    // permissioned instructions
    pub admin_key: Pubkey,

    pub seed: Pubkey,

    ///////// time windows ///////////

    // length of withdrawal window in seconds
    pub transfer_window: u64,

    // time at which withdrawals began
    pub start_transfer_time: u64,

    // minimum time at which withdrawals end
    pub end_transfer_time: u64,

    ///////// rebalance pipeline state ///////////

    // has vault been initialized?
    pub initialized: bool,

    // has the current/previous options position been settled?
    // settlement is defined as having all AUM of this volt stored in one asset (underlying)
    pub curr_option_was_settled: bool,

    // do we have to swap premium to underlying before entering position?
    pub must_swap_premium_to_underlying: bool,

    // has the next option to roll into been set?
    pub next_option_was_set: bool,

    // has set_next_option been called successfully a single time yet?
    pub first_ever_option_was_set: bool,

    // should deposit/withdraw still be validly callable?
    pub instant_transfers_enabled: bool,

    // has rebalance prepare been called this cycle?
    pub prepare_is_finished: bool,

    // are we out of options to sell in the rebalance enter stage of this cycle?
    pub enter_is_finished: bool,

    // has the current round started?
    pub round_has_started: bool,

    // round number of roll. increments post-settlement (maybe set next option)
    pub round_number: u64,

    ////// Rewards Tracking //////

    // total amount in vault when set next option was last called
    pub total_underlying_pre_enter: u64,

    // total amount in vault immediately following full settlement
    pub total_underlying_post_settle: u64,

    // total number of volt tokens in supply post settlement
    // used for calculating share of pnl
    pub total_volt_tokens_post_settle: u64,

    ///////// accounts to save here so others can read. additionally for account_validators.rs ///////////
    pub vault_authority: Pubkey,

    // pools
    pub deposit_pool: Pubkey,

    pub premium_pool: Pubkey,

    pub option_pool: Pubkey,

    pub writer_token_pool: Pubkey,

    // mints
    pub vault_mint: Pubkey,

    pub underlying_asset_mint: Pubkey,

    pub quote_asset_mint: Pubkey,

    pub option_mint: Pubkey,

    pub writer_token_mint: Pubkey,

    pub option_market: Pubkey,

    ///////// vault strategy params ///////////

    // integer describing the vault strategy
    pub vault_type: u64,

    /// The amount of the **underlying asset** that derives a single option
    pub underlying_amount_per_contract: u64,

    // strike * underlying per contract
    pub quote_amount_per_contract: u64,

    /// The Unix timestamp at which the contracts in this market expire
    pub expiration_unix_timestamp: i64,

    // exact expiry length the target option should have, except for the initial option
    pub expiration_interval: u64,

    // option is assumed to be OTM. this limits how high the strike can be relative to current underlying price.
    // i.e, new strike must be less than or equal to (underlying price * upper_bound_otm_strike_factor)
    // NOTE: value should be given from client as (desired factor) * 10, so need to divide by 10 to get actual normalization
    pub upper_bound_otm_strike_factor: u64,

    /// A flag to set and use to when running a memcmp query.
    /// This will be set when Serum markets are closed and expiration is validated
    pub have_taken_withdrawal_fees: bool,

    ///////// serum ///////////
    pub serum_spot_market: Pubkey,

    // bump for program address of open orders account (serum)
    pub open_orders_bump: u8,

    // bump for serum (unknown)
    pub open_orders_init_bump: u8,

    // bump for open orders for underlying serum market
    pub ul_open_orders_bump: u8,

    // open orders account for underlying spot market
    pub ul_open_orders: Pubkey,

    // was the ul open orders acct already initialized?
    pub ul_open_orders_initialized: bool,

    // bump for vault authority, used to generate signer seeds for CPI calls
    pub bump_authority: u8,

    // order size in # contracts to sell options
    pub serum_order_size_options: u64,

    // order size in # contracts to sell options
    pub individual_capacity: u64,

    // type of order to submit (limit, postonly, IOC)
    pub serum_order_type: u64,

    // unknown usage, set to 65535 works
    pub serum_limit: u16,

    // specifies what serum should do if the order is matched w/ an order from the same account
    pub serum_self_trade_behavior: u16,

    // order ID to use when sending a serum order. should be incremented following each succesful order
    pub serum_client_order_id: u64,
    // pub whitelist: Pubkey,
    // pub unused_space:
    // pub unused_space: [u64; 30],
    pub whitelist_token_mint: Pubkey,

    pub permissioned_market_premium_mint: Pubkey,
    pub permissioned_market_premium_pool: Pubkey,
    // pub extra_key_two:   ,
    pub capacity: u64,
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

#[account]
#[derive(Default)]
pub struct ExtraVoltData {
    pub is_whitelisted: bool,

    pub whitelist: Pubkey,

    pub is_for_dao: bool,

    pub dao_program_id: Pubkey,

    pub deposit_mint: Pubkey,

    // target leverage amount (as ratio) for the position (for each rebalance)
    pub target_collat_ratio: f64,

    // defines width of interval collateralization ratio at end of round must lie within
    pub target_collat_lenience: f64,

    // leverage threshold for calling exit_early instructoin
    pub exit_early_ratio: f64,

    // is this trading on mango or entropy (or 01 :P)?
    pub target_program_id: Pubkey,

    // group the protocol trades on
    pub entropy_group: Pubkey,

    // account the program initializes to trade with
    pub entropy_account: Pubkey,

    // pubkey of perp market to trade
    pub target_perp_market: Pubkey,

    pub have_resolved_deposits: bool,

    pub have_rebalanced: bool,

    pub dao_authority: Pubkey,
    pub extra_key_two: Pubkey,
    pub extra_key_three: Pubkey,
    pub extra_key_four: Pubkey,
    pub extra_key_5: Pubkey,
    pub extra_key_6: Pubkey,
    pub extra_key_7: Pubkey,
    pub extra_key_8: Pubkey,
    pub extra_key_9: Pubkey,
    pub extra_key_10: Pubkey,
    pub extra_key_11: Pubkey,
    pub extra_key_12: Pubkey,

    pub unused_uint_one: u64,
    pub unused_uint_two: u64,
    pub unused_uint_three: u64,
    pub unused_uint_four: u64,
    pub unused_uint_five: u64,
    pub unused_uint_six: u64,
    pub unused_uint_7: u64,
    pub unused_uint_8: u64,
    pub unused_uint_9: u64,
    pub unused_uint_10: u64,
    pub unused_uint_11: u64,
    pub unused_uint_12: u64,

    pub unused_bool_one: bool,
    pub unused_bool_two: bool,
    pub unused_bool_three: bool,
    pub unused_bool_four: bool,
    pub unused_bool_five: bool,
    pub unused_bool_six: bool,
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

#[account]
#[derive(Default)]
pub struct UlOpenOrdersMetadata {
    initialized: bool,
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
