use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    ExtraVoltData, FriktionEpochInfo, PendingDeposit, PendingWithdrawal, Round, VoltVault,
};

#[derive(Accounts)]
#[instruction(
    deposit_amount: u64,
)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account()]
    /// CHECK: skip
    pub dao_authority: AccountInfo<'info>,

    /// CHECK: skip
    pub authority_check: AccountInfo<'info>,

    #[account(mut, address=volt_vault.vault_mint)]
    pub vault_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub volt_vault: Box<Account<'info, VoltVault>>,
    /// CHECK: skip
    #[account(address=volt_vault.vault_authority)]
    pub vault_authority: AccountInfo<'info>,

    #[account(
        seeds = [
            &volt_vault.key().to_bytes()[..],
            b"extraVoltData" as &[u8]
        ],
        bump,
      )]
    // main data struct. stores any persistent metadata about the volt and its strategy
    pub extra_volt_data: Box<Account<'info, ExtraVoltData>>,

    #[account(address=extra_volt_data.whitelist)]
    /// CHECK: skip
    pub whitelist: AccountInfo<'info>,

    #[account(mut, address=volt_vault.deposit_pool)]
    pub deposit_pool: Box<Account<'info, TokenAccount>>,

    /// CHECK: skip
    #[account(address=volt_vault.writer_token_pool)]
    pub writer_token_pool: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    pub vault_token_destination: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    // user controlled token account w/ mint == underlying mint
    pub underlying_token_source: Box<Account<'info, TokenAccount>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), volt_vault.round_number.to_le_bytes().as_ref() ,b"roundInfo"],
        bump)]
    pub round_info: Box<Account<'info, Round>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), volt_vault.round_number.to_le_bytes().as_ref() ,b"roundVoltTokens"],
        bump)]
    pub round_volt_tokens: Box<Account<'info, TokenAccount>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), volt_vault.round_number.to_le_bytes().as_ref() ,b"roundUnderlyingTokens"],
        bump)]
    pub round_underlying_tokens: Box<Account<'info, TokenAccount>>,

    #[account(init_if_needed,
        space=PendingDeposit::LEN + 8,
        seeds = [volt_vault.key().as_ref(), authority_check.key().as_ref() ,b"pendingDeposit"],
        bump,
        payer = authority)]
    pub pending_deposit_info: Box<Account<'info, PendingDeposit>>,

    #[account(init_if_needed,
        space=FriktionEpochInfo::LEN + 8,
        seeds = [&volt_vault.key().to_bytes()[..], (volt_vault.round_number).to_le_bytes().as_ref() ,b"epochInfo"],
        bump,
        payer=authority
    )]
    pub epoch_info: Box<Account<'info, FriktionEpochInfo>>,

    /// CHECK: skip
    #[account(address=extra_volt_data.entropy_program_id)]
    pub entropy_program: AccountInfo<'info>,
    /// CHECK: skip
    #[account(address=extra_volt_data.entropy_group)]
    pub entropy_group: AccountInfo<'info>,

    /// CHECK: skip
    #[account(address=extra_volt_data.entropy_account)]
    pub entropy_account: AccountInfo<'info>,

    /// CHECK: skip
    #[account(address=extra_volt_data.entropy_cache)]
    pub entropy_cache: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(
    withdraw_amount: u64
)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account()]
    /// CHECK: skip
    pub dao_authority: AccountInfo<'info>,

    /// CHECK: skip
    pub authority_check: AccountInfo<'info>,

    #[account(mut)]
    pub vault_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub volt_vault: Box<Account<'info, VoltVault>>,

    /// CHECK: skip
    #[account(address=volt_vault.vault_authority)]
    pub vault_authority: AccountInfo<'info>,

    #[account(
        seeds = [
            &volt_vault.key().to_bytes()[..],
            b"extraVoltData" as &[u8]
        ],
        bump,
      )]
    // main data struct. stores any persistent metadata about the volt and its strategy
    pub extra_volt_data: Box<Account<'info, ExtraVoltData>>,

    #[account(address=extra_volt_data.whitelist)]
    /// CHECK: skip
    pub whitelist: AccountInfo<'info>,

    #[account(mut,address=volt_vault.deposit_pool)]
    pub deposit_pool: Box<Account<'info, TokenAccount>>,

    // user token accounts
    #[account(mut)]
    pub underlying_token_destination: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub vault_token_source: Box<Account<'info, TokenAccount>>,

    // round accounts
    #[account(mut,
        seeds = [volt_vault.key().as_ref(), volt_vault.round_number.to_le_bytes().as_ref() ,b"roundInfo"],
        bump)]
    pub round_info: Box<Account<'info, Round>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), volt_vault.round_number.to_le_bytes().as_ref() ,b"roundUnderlyingTokens"],
        bump)]
    pub round_underlying_tokens: Box<Account<'info, TokenAccount>>,

    #[account(init_if_needed,
        space=PendingWithdrawal::LEN + 8,
        seeds = [volt_vault.key().as_ref(), authority_check.key().as_ref(), b"pendingWithdrawal"],
        bump,
        payer = authority)]
    pub pending_withdrawal_info: Box<Account<'info, PendingWithdrawal>>,

    #[account(mut,
        seeds = [&volt_vault.key().to_bytes()[..], (volt_vault.round_number).to_le_bytes().as_ref() ,b"epochInfo"],
        bump,
    )]
    pub epoch_info: Box<Account<'info, FriktionEpochInfo>>,

    #[account(mut)]
    pub fee_acct: Box<Account<'info, TokenAccount>>,

    // system accounts
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimPendingDeposit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub volt_vault: Box<Account<'info, VoltVault>>,

    #[account(
        seeds = [
            &volt_vault.key().to_bytes()[..],
            b"extraVoltData" as &[u8]
        ],
        bump,
      )]
    pub extra_volt_data: Box<Account<'info, ExtraVoltData>>,

    /// CHECK: skip
    #[account(address=volt_vault.vault_authority)]
    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    // user controlled token account w/ mint == vault mint
    pub user_vault_tokens: Box<Account<'info, TokenAccount>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), pending_deposit_info.round_number.to_le_bytes().as_ref() , b"roundInfo"],
        bump)]
    pub pending_deposit_round_info: Box<Account<'info, Round>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), pending_deposit_info.round_number.to_le_bytes().as_ref() , b"roundVoltTokens"],
        bump)]
    pub pending_deposit_round_volt_tokens: Box<Account<'info, TokenAccount>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), authority.key().as_ref(), b"pendingDeposit"],
        bump)]
    pub pending_deposit_info: Box<Account<'info, PendingDeposit>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimPendingWithdrawal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub volt_vault: Box<Account<'info, VoltVault>>,

    #[account(
        seeds = [
            &volt_vault.key().to_bytes()[..],
            b"extraVoltData" as &[u8]
        ],
        bump,
      )]
    pub extra_volt_data: Box<Account<'info, ExtraVoltData>>,

    /// CHECK: skip
    #[account(address=volt_vault.vault_authority)]
    pub vault_authority: AccountInfo<'info>,
    #[account(address=volt_vault.vault_mint)]
    pub vault_mint: Box<Account<'info, Mint>>,

    // user underlying token account
    #[account(mut)]
    pub underlying_token_destination: Box<Account<'info, TokenAccount>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), pending_withdrawal_info.round_number.to_le_bytes().as_ref() , b"roundInfo"],
        bump)]
    pub pending_withdrawal_round_info: Box<Account<'info, Round>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), authority.key().as_ref(), b"pendingWithdrawal"],
        bump,
    )]
    pub pending_withdrawal_info: Box<Account<'info, PendingWithdrawal>>,

    #[account(mut,
        seeds = [volt_vault.key().as_ref(), (pending_withdrawal_info.round_number).to_le_bytes().as_ref() ,b"roundUlPending"],
        bump,
    )]
    pub round_underlying_tokens_for_pending_withdrawals: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelPendingDeposit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub vault_mint: Account<'info, Mint>,

    #[account(mut)]
    pub volt_vault: Box<Account<'info, VoltVault>>,

    #[account(
        seeds = [
            &volt_vault.key().to_bytes()[..],
            b"extraVoltData" as &[u8]
        ],
        bump,
      )]
    pub extra_volt_data: Box<Account<'info, ExtraVoltData>>,

    /// CHECK: vault authority pubkey, doesn't have special property
    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    // user token accounts
    #[account(mut)]
    pub underlying_token_destination: Account<'info, TokenAccount>,

    // round accounts
    #[account(mut,
        seeds = [volt_vault.key().as_ref(), volt_vault.round_number.to_le_bytes().as_ref() ,b"roundInfo"],
        bump)]
    pub round_info: Box<Account<'info, Round>>,

    #[account(mut,
      seeds = [volt_vault.key().as_ref(), volt_vault.round_number.to_le_bytes().as_ref() ,b"roundUnderlyingTokens"],
      bump)]
    pub round_underlying_tokens: Box<Account<'info, TokenAccount>>,

    #[account(init_if_needed,
        space=PendingDeposit::LEN + 8,
        seeds = [volt_vault.key().as_ref(), authority.key().as_ref(), b"pendingDeposit"],
        bump,
        payer=authority)]
    pub pending_deposit_info: Box<Account<'info, PendingDeposit>>,

    #[account(mut,
        seeds = [&volt_vault.key().to_bytes()[..], (volt_vault.round_number).to_le_bytes().as_ref() ,b"epochInfo"],
        bump,
    )]
    pub epoch_info: Box<Account<'info, FriktionEpochInfo>>,

    // system accounts
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CancelPendingWithdrawal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub vault_mint: Account<'info, Mint>,

    #[account(mut)]
    pub volt_vault: Box<Account<'info, VoltVault>>,

    #[account(
        seeds = [
            &volt_vault.key().to_bytes()[..],
            b"extraVoltData" as &[u8]
        ],
        bump,
      )]
    pub extra_volt_data: Box<Account<'info, ExtraVoltData>>,

    /// CHECK: skip
    pub vault_authority: AccountInfo<'info>,

    // user token accounts
    #[account(mut)]
    pub vault_token_destination: Account<'info, TokenAccount>,

    // round accounts
    #[account(mut,
        seeds = [volt_vault.key().as_ref(), volt_vault.round_number.to_le_bytes().as_ref() ,b"roundInfo"],
        bump)]
    pub round_info: Box<Account<'info, Round>>,

    #[account(init_if_needed,
        space=PendingWithdrawal::LEN + 8,
        seeds = [volt_vault.key().as_ref(), authority.key().as_ref(), b"pendingWithdrawal"],
        bump,
        payer = authority)]
    pub pending_withdrawal_info: Box<Account<'info, PendingWithdrawal>>,

    #[account(mut,
        seeds = [&volt_vault.key().to_bytes()[..], (volt_vault.round_number).to_le_bytes().as_ref() ,b"epochInfo"],
        bump,
    )]
    pub epoch_info: Box<Account<'info, FriktionEpochInfo>>,

    // system accounts
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}
