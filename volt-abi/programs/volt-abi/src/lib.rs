use anchor_lang::prelude::*;
declare_id!("VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp");

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

    pub(crate) fn claim_pending_deposit(cx: Context<ClaimPendingDeposit>) -> Result<()> {
        Ok(())
    }
    pub(crate) fn claim_pending_withdrawal(cx: Context<ClaimPendingWithdrawal>) -> Result<()> {
        Ok(())
    }
    // ========== TRADING ==========
}

#[account]
#[derive(Default)]
pub struct FriktionEpochInfo {
    pub number: u64,
    pub volt_token_supply: u64,
    pub pnl: u64,
    pub performance_fees: u64,
    pub withdrawal_fees: u64,
    pub pending_withdrawals: u64,
    pub pending_deposits: u64,
    // in volt tokens
    pub canceled_withdrawals: u64,
    pub canceled_deposits: u64,
    pub total_withdrawals: u64,
    pub total_deposits: u64,
    pub instant_deposits: u64,
    pub instant_withdrawals: u64,
    pub dao_deposits: u64,
    pub minted_options: u64,

    pub enter_num_times_called: u64,
    pub swap_premium_num_times_called: u64,

    pub option_key: Pubkey,

    pub extra_key_four: Pubkey,
    pub extra_key_5: Pubkey,
    pub extra_key_6: Pubkey,
    pub extra_key_7: Pubkey,
    pub extra_key_8: Pubkey,
    pub extra_key_9: Pubkey,
    pub extra_key_10: Pubkey,
    pub extra_key_11: Pubkey,
    pub extra_key_12: Pubkey,

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

#[derive(Accounts)]
#[instruction(
    deposit_amount: u64,
)]
pub struct Deposit<'info> {
    #[account(mut, signer)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    /// CHECK: skip
    #[account(signer)]
    pub dao_authority: AccountInfo<'info>,

    /// CHECK: skip
    pub authority_check: AccountInfo<'info>,

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

    /// CHECK: skip
    pub whitelist: AccountInfo<'info>,

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
    pub pending_deposit_info: Box<Account<'info, PendingDeposit>>,

    #[account(mut)]
    /// CHECK: skip
    pub epoch_info: AccountInfo<'info>,

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
    #[account(mut)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip
    pub dao_authority: AccountInfo<'info>,

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

    /// CHECK: skip
    pub whitelist: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub deposit_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip
    pub underlying_token_destination: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip
    pub vault_token_source: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_underlying_tokens: AccountInfo<'info>,

    #[account(init_if_needed, payer=authority)]
    /// CHECK: skip
    pub pending_withdrawal_info: Box<Account<'info, PendingDeposit>>,

    #[account(mut)]
    /// CHECK: skip
    pub epoch_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimPendingDeposit<'info> {
    /// CHECK: skip
    #[account(mut, signer)]
    pub authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip
    pub user_vault_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_volt_tokens: AccountInfo<'info>,

    /// CHECK: skip
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub epoch_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimPendingWithdrawal<'info> {
    #[account(mut, signer)]
    /// CHECK: skip
    pub authority: AccountInfo<'info>,

    /// CHECK: skip
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    /// CHECK: skip
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip
    pub underlying_token_destination: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_info: AccountInfo<'info>,

    /// CHECK: skip
    #[account(mut)]
    pub pending_withdrawal_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub round_underlying_tokens_for_pending_withdrawals: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip
    pub epoch_info: AccountInfo<'info>,

    /// CHECK: skip
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip
    pub token_program: AccountInfo<'info>,
}
