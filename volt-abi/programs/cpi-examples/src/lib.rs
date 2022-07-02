use anchor_lang::prelude::*;
use anchor_lang::{declare_id, require};
mod types;
use crate::types::*;

declare_id!("DAo2pDtpiBFDu4TTiv2WggP6PfQ6FnKqwSRYxpMjyuV2");
#[macro_export]
macro_rules! gen_dao_signer_seeds {
    ($bump:expr) => {
        &[&[b"daoProgramAuthority", &[$bump]]]
    };
}

#[program]
pub mod daoexamples {

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
        let base_seeds = &[&b"daoProgramAuthority"[..], &[bump]];
        let seeds = &[base_seeds.as_ref()];
        // let seeds = &[b"daoProgramAuthority", &[bump]];
        let mut cpi_ctx = CpiContext::new_with_signer(
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
                entropy_program: ctx.accounts.entropy_program.to_account_info(),
                entropy_group: ctx.accounts.entropy_group.to_account_info(),
                entropy_cache: ctx.accounts.entropy_cache.to_account_info(),
                entropy_account: ctx.accounts.entropy_account.to_account_info(),
                epoch_info: ctx.accounts.epoch_info.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
            seeds,
        );

        cpi_ctx.accounts.dao_authority.is_signer = true;
        volt_abi::cpi::deposit(cpi_ctx, deposit_amount).unwrap();
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("invalid deposit program id")]
    InvalidDepositProgramId,
}
