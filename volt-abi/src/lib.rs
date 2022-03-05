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
