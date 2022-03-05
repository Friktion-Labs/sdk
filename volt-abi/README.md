# Friktion (volt) ABI

## Overview

Provides contexts and instruction functions to interact with Friktion Program via CPI calls

Friktion program ID: ```VoLT1mJz1sbnxwq5Fv2SXjdVDgPXrb9tJyC8WpMDkSp```

## Examples:

The following is an example of a CPI call into the Friktion program calling the deposit instruction. Anchor provides [docs](https://project-serum.github.io/anchor/tutorials/tutorial-3.html) on the syntax used.


```rust
use anchor_lang::prelude::Context;
use anchor_lang::prelude::*;
use anchor_lang::{declare_id, require};
use anchor_spl::token::{Mint, Token, TokenAccount};
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
        )
        .unwrap();
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("invalid deposit program id")]
    InvalidDepositProgramId,
}

```

Keep in mind, the CPI feature must be enabled on "volt-abi" as the following demonstrates:

```rust
volt-abi = { path = "../volt-abi", features = ["cpi"]}
```


## Practical Notes:

- vault_token_destination && underlying_token_source accounts must be initialized prior to calling the Deposit instruction. The authorities on those token accounts must be the dao_authority, which practically is a PDA of the invoking program.