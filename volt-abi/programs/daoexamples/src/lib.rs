use anchor_lang::{declare_id, require};
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_lang::prelude::*;
use anchor_lang::prelude::Context;
mod types;
use crate::types::*;

// #[cfg(feature = "mainnet")]
declare_id!("DAo2pDtpiBFDu4TTiv2WggP6PfQ6FnKqwSRYxpMjyuV2");
#[macro_export]
macro_rules! gen_dao_signer_seeds {
    ($bump:expr) => {
        &[&[b"daoProgramAuthority", &[$bump]]]
    };
}

#[program]
pub mod daoexamples {


    use anchor_lang::prelude::CpiContext;
    use solana_program::msg;

    use super::*;
    pub fn deposit_dao_example<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, DepositDaoExampleAccounts<'info>>,
        deposit_amount: u64,
        bump: u8,
    ) -> Result<()> {
        require!(
            ctx.accounts.volt_program_id.key() == volt_abi::id(),
            InvalidDepositProgramId
        );

        msg!("calling deposit dao");
        msg!("account owner: {:?}", ctx.accounts.vault_mint.owner);
        volt_abi::cpi::deposit(
            CpiContext::new_with_signer(
                ctx.accounts.volt_program_id.clone(),
                volt_abi::cpi::accounts::Deposit {
                    authority: ctx.accounts.authority.to_account_info(),
                    dao_authority: ctx.accounts.dao_authority.to_account_info(),
                    authority_check: ctx.accounts.dao_authority.to_account_info(),
                    vault_mint: ctx.accounts.vault_mint.to_account_info(),

                    volt_vault: ctx.accounts.volt_vault.to_account_info(),
                    vault_authority: ctx.accounts.vault_authority.to_account_info(),
                    extra_volt_data: ctx.accounts.extra_volt_data.to_account_info(),
                    whitelist: ctx.accounts.whitelist.to_account_info(),

                    deposit_pool: ctx.accounts.deposit_pool.to_account_info(),
                    writer_token_pool: ctx.accounts.writer_token_pool.to_account_info(),
                    vault_token_destination: ctx.accounts.vault_token_destination.to_account_info(),
                    underlying_token_source: ctx.accounts.underlying_token_source.to_account_info(),
                    round_info: ctx.accounts.round_info.to_account_info(),
                    round_volt_tokens: ctx.accounts.round_volt_tokens.to_account_info(),
                    round_underlying_tokens: ctx.accounts.round_underlying_tokens.to_account_info(),
                    pending_deposit_info: ctx.accounts.pending_deposit_info.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                },
                gen_dao_signer_seeds!(bump),
            ),
            deposit_amount,
        ).unwrap();
        Ok(())
    }
}

// #[derive(Accounts)]
// #[instruction(
//     deposit_amount: u64,
// )]
// pub struct DepositDaoExample<'info> {
//     /// CHECK: skip
//     #[account(mut)]
//     /// CHECK: skip
//     pub authority: AccountInfo<'info>,

//     #[account(mut, signer)]
//     /// CHECK: skip
//     pub payer: AccountInfo<'info>,

//     #[account()]
//     /// CHECK: skip, will check program id in instruction
//     pub volt_program_id: AccountInfo<'info>,

//     #[account(mut)]
//     /// CHECK: skip
//     pub vault_mint: AccountInfo<'info>,

//     #[account(mut)]
//     /// CHECK: skip
//     pub volt_vault: AccountInfo<'info>,
//     /// CHECK: skip
//     pub vault_authority: AccountInfo<'info>,

//     #[account(mut)]
//     /// CHECK: skip
//     pub extra_volt_data: AccountInfo<'info>,

//     #[account(mut)]
//     /// CHECK: skip
//     pub deposit_pool: AccountInfo<'info>,

//     /// CHECK: skip
//     pub writer_token_pool: AccountInfo<'info>,

//     #[account(mut)]
//     // user controlled token account w/ mint == vault mint
//     /// CHECK: skip
//     pub vault_token_destination: AccountInfo<'info>,

//     #[account(mut)]
//     // user controlled token account w/ mint == underlying mint
//     /// CHECK: skip
//     pub underlying_token_source: AccountInfo<'info>,

//     #[account(mut)]
//     /// CHECK: skip
//     pub round_info: AccountInfo<'info>,

//     #[account(mut)]
//     /// CHECK: skip
//     pub round_volt_tokens: AccountInfo<'info>,

//     #[account(mut)]
//     /// CHECK: skip
//     pub round_underlying_tokens: AccountInfo<'info>,

//     /// CHECK: skip
//     #[account(mut)]
//     pub pending_deposit_info: AccountInfo<'info>,

//     /// CHECK: skip
//     pub system_program: AccountInfo<'info>,
//     /// CHECK: skip
//     pub token_program: AccountInfo<'info>,
// }

#[error_code]
pub enum ErrorCode {
    #[msg("invalid deposit program id")]
    InvalidDepositProgramId,
}
