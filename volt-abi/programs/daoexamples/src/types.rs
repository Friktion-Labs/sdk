use anchor_lang::prelude::*;
use anchor_lang::{account, Accounts};
#[derive(Accounts)]
#[instruction(
    deposit_amount: u64,
)]
pub struct DepositDaoExampleAccounts<'info> {
    #[account(mut, signer)]
    /// CHECK: skip, checked by the volt program
    pub authority: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub dao_authority: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip, checked by the volt program, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub extra_volt_data: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub whitelist: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub deposit_pool: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub writer_token_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip, checked by the volt program
    pub vault_token_destination: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip, checked by the volt program
    pub underlying_token_source: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_volt_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_underlying_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub epoch_info: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub entropy_program: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub entropy_group: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub entropy_account: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub entropy_cache: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(
    withdraw_amount: u64,
)]
pub struct Withdraw<'info> {
    /// CHECK: skip, checked by the volt program
    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub authority: AccountInfo<'info>,

    #[account(mut, signer)]
    /// CHECK: skip, checked by the volt program
    pub payer: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip, checked by the volt program, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub extra_volt_data: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub whitelist: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub deposit_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip, checked by the volt program
    pub vault_token_source: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip, checked by the volt program
    pub underlying_token_destination: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_volt_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_underlying_tokens: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    #[account(mut)]
    pub pending_withdrawal_info: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub token_program: AccountInfo<'info>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimPendingDeposit<'info> {
    /// CHECK: skip, checked by the volt program
    #[account(mut, signer)]
    pub authority: AccountInfo<'info>,

    #[account()]
    /// CHECK: skip, checked by the volt program, will check program id in instruction
    pub volt_program_id: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    /// CHECK: skip, checked by the volt program
    pub user_vault_tokens: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_volt_tokens: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    #[account(mut)]
    pub pending_deposit_info: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimPendingWithdrawal<'info> {
    #[account(mut, signer)]
    /// CHECK: skip, checked by the volt program
    pub authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub volt_vault: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub vault_mint: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    /// CHECK: skip, checked by the volt program
    pub underlying_token_destination: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_info: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: skip, checked by the volt program
    pub round_underlying_tokens_for_pending_withdrawals: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    #[account(mut)]
    pub pending_withdrawal_info: AccountInfo<'info>,

    /// CHECK: skip, checked by the volt program
    pub system_program: AccountInfo<'info>,
    /// CHECK: skip, checked by the volt program
    pub token_program: AccountInfo<'info>,
}
