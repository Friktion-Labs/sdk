export type VoltIDL = {
  version: "0.1.0";
  name: "volt";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "adminKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "seed";
          isMut: true;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "premiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "underlyingAssetMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "quoteAssetMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelistTokenMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelistTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "transferWindow";
          type: "u64";
        },
        {
          name: "bump";
          type: "u8";
        },
        {
          name: "bumpAuthority";
          type: "u8";
        },
        {
          name: "serumOrderSizeOptions";
          type: "u64";
        },
        {
          name: "serumOrderType";
          type: {
            defined: "OrderType";
          };
        },
        {
          name: "serumSelfTradeBehavior";
          type: {
            defined: "SelfTradeBehavior";
          };
        },
        {
          name: "expirationInterval";
          type: "u64";
        },
        {
          name: "upperBoundOtmStrikeFactor";
          type: "u64";
        },
        {
          name: "underlyingAmountPerContract";
          type: "u64";
        },
        {
          name: "vaultCapacity";
          type: "u64";
        },
        {
          name: "individualCapacity";
          type: "u64";
        }
      ];
    },
    {
      name: "changeCapacity";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "capacity";
          type: "u64";
        },
        {
          name: "individualCapacity";
          type: "u64";
        }
      ];
    },
    {
      name: "changeHedging";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "shouldHedge";
          type: "bool";
        }
      ];
    },
    {
      name: "setStrategyParams";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "targetLeverageRatio";
          type: "f64";
        },
        {
          name: "targetLeverageLenience";
          type: "f64";
        },
        {
          name: "targetHedgeRatio";
          type: "f64";
        },
        {
          name: "targetHedgeLenience";
          type: "f64";
        }
      ];
    },
    {
      name: "startRound";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "underlyingAssetMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "endRound";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "feeAcct";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "takePendingWithdrawalFees";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "feeAcct";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "claimPending";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userVaultTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositRoundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositRoundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "claimPendingWithdrawal";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "underlyingTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingWithdrawalRoundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingWithdrawalInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "cancelPendingWithdrawal";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingWithdrawalInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "cancelPendingDeposit";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "underlyingTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "deposit";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "daoAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authorityCheck";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelist";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenPool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingTokenSource";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyGroup";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyCache";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "depositAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "depositWithTransfer";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "daoAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "solTransferAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "authorityCheck";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelist";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenPool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingTokenSource";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "depositAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "depositWithClaim";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "daoAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "solTransferAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authorityCheck";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelist";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenPool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingTokenSource";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositRoundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositRoundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "depositAmount";
          type: "u64";
        },
        {
          name: "doTransfer";
          type: "bool";
        }
      ];
    },
    {
      name: "withdraw";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "daoAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authorityCheck";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelist";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultTokenSource";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingWithdrawalInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "feeAcct";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "withdrawAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "rebalanceSettle";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "soloptionsProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "inertiaProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "premiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rawOptionMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "writerTokenMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingAssetMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "quoteAssetMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "quoteAssetPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingAssetPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "feeOwner";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "setNextOption";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "optionPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rawOptionMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "optionMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "writerTokenMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "openOrdersBump";
          type: "u8";
        },
        {
          name: "openOrdersInitBump";
          type: "u8";
        }
      ];
    },
    {
      name: "resetOptionMarket";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "inertiaProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rawOptionMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "underlyingAssetPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "backupOptionPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "backupWriterTokenPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "rebalancePrepare";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "inertiaProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "soloptionsProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rawOptionMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "underlyingAssetPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingAssetMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "optionMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "quoteAssetMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerTokenMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionProtocolFeeDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "rebalanceSwapPremium";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tradingPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "market";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pcReferrerWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "srmReferralAcct";
          isMut: false;
          isSigner: false;
        },
        {
          name: "serumVaultSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "openOrders";
          isMut: true;
          isSigner: false;
        },
        {
          name: "openOrdersMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "marketBids";
          isMut: true;
          isSigner: false;
        },
        {
          name: "marketAsks";
          isMut: true;
          isSigner: false;
        },
        {
          name: "requestQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "eventQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "coinVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pcVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "clientOrderPrice";
          type: "u64";
        },
        {
          name: "clientOrderSize";
          type: "u64";
        },
        {
          name: "ulOpenOrdersBump";
          type: "u8";
        }
      ];
    },
    {
      name: "rebalanceEnter";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "middlewareProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rawOptionMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pcReferrerWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "serumVaultSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "srmReferralAcct";
          isMut: false;
          isSigner: false;
        },
        {
          name: "openOrders";
          isMut: true;
          isSigner: false;
        },
        {
          name: "market";
          isMut: true;
          isSigner: false;
        },
        {
          name: "serumMarketAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "requestQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "eventQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "marketBids";
          isMut: true;
          isSigner: false;
        },
        {
          name: "marketAsks";
          isMut: true;
          isSigner: false;
        },
        {
          name: "coinVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pcVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "whitelistTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "clientOrderPrice";
          type: "u64";
        },
        {
          name: "clientOrderSize";
          type: "u64";
        },
        {
          name: "clientOpenOrdersBump";
          type: "u8";
        },
        {
          name: "clientOpenOrdersInitBump";
          type: "u8";
        }
      ];
    },
    {
      name: "settleEnterFunds";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "middlewareProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "premiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pcReferrerWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "serumVaultSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "openOrders";
          isMut: true;
          isSigner: false;
        },
        {
          name: "market";
          isMut: true;
          isSigner: false;
        },
        {
          name: "serumMarketAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "coinVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pcVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "settlePermissionedMarketPremiumFunds";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "premiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rawOptionMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "writerTokenMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "settleSwapPremiumFunds";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tradingPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pcReferrerWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "serumVaultSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "openOrders";
          isMut: true;
          isSigner: false;
        },
        {
          name: "market";
          isMut: true;
          isSigner: false;
        },
        {
          name: "coinVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pcVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initWhitelist";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "seed";
          isMut: true;
          isSigner: false;
        },
        {
          name: "whitelist";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "addWhitelist";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "whitelist";
          isMut: true;
          isSigner: false;
        },
        {
          name: "accountToAdd";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "removeWhitelist";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "whitelist";
          isMut: true;
          isSigner: false;
        },
        {
          name: "accountToRemove";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "attachWhitelist";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelist";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "attachDao";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "daoProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "daoAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "detachDao";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initializeEntropy";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "adminKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyGroup";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyCache";
          isMut: false;
          isSigner: false;
        },
        {
          name: "powerPerpMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "spotPerpMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "vaultName";
          type: "string";
        },
        {
          name: "bumpAuthority";
          type: "u8";
        },
        {
          name: "targetLeverageRatio";
          type: "f64";
        },
        {
          name: "targetLeverageLenience";
          type: "f64";
        },
        {
          name: "targetHedgeLenience";
          type: "f64";
        },
        {
          name: "exitEarlyRatio";
          type: "f64";
        },
        {
          name: "vaultCapacity";
          type: "u64";
        },
        {
          name: "individualCapacity";
          type: "u64";
        },
        {
          name: "shouldHedge";
          type: "bool";
        }
      ];
    },
    {
      name: "takePerformanceFeesEntropy";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyRound";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyGroup";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyCache";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rootBank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nodeBank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: false;
          isSigner: false;
        },
        {
          name: "feeAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "startRoundEntropy";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "underlyingAssetMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals";
          isMut: true;
          isSigner: false;
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyRound";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyGroup";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyCache";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "endRoundEntropy";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyRound";
          isMut: true;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyGroup";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyCache";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rootBank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nodeBank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "setupRebalanceEntropy";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundVoltTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyRound";
          isMut: true;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyGroup";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyCache";
          isMut: true;
          isSigner: false;
        },
        {
          name: "powerPerpMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "spotPerpMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rootBank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nodeBank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "expectedOraclePx";
          type: "f64";
        }
      ];
    },
    {
      name: "rebalanceEntropy";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "extraVoltData";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyRound";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyGroup";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyCache";
          isMut: true;
          isSigner: false;
        },
        {
          name: "powerPerpMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rootBank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nodeBank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "eventQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "powerPerpEventQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bids";
          isMut: true;
          isSigner: false;
        },
        {
          name: "asks";
          isMut: true;
          isSigner: false;
        },
        {
          name: "spotPerpMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "clock";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "clientBidPrice";
          type: "u64";
        },
        {
          name: "clientAskPrice";
          type: "u64";
        }
      ];
    },
    {
      name: "initSerumMarket";
      accounts: [
        {
          name: "userAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "whitelist";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "serumMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pcMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "optionMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "requestQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "eventQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bids";
          isMut: true;
          isSigner: false;
        },
        {
          name: "asks";
          isMut: true;
          isSigner: false;
        },
        {
          name: "coinVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pcVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "marketAuthority";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "marketSpace";
          type: "u64";
        },
        {
          name: "vaultSignerNonce";
          type: "u64";
        },
        {
          name: "coinLotSize";
          type: "u64";
        },
        {
          name: "pcLotSize";
          type: "u64";
        },
        {
          name: "pcDustThreshold";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "Whitelist";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "publicKey";
          },
          {
            name: "addresses";
            type: {
              vec: "publicKey";
            };
          }
        ];
      };
    },
    {
      name: "PendingDeposit";
      type: {
        kind: "struct";
        fields: [
          {
            name: "initialized";
            type: "bool";
          },
          {
            name: "roundNumber";
            type: "u64";
          },
          {
            name: "numUnderlyingDeposited";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "PendingWithdrawal";
      type: {
        kind: "struct";
        fields: [
          {
            name: "initialized";
            type: "bool";
          },
          {
            name: "roundNumber";
            type: "u64";
          },
          {
            name: "numVoltRedeemed";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "UlOpenOrdersMetadata";
      type: {
        kind: "struct";
        fields: [
          {
            name: "initialized";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "EntropyRound";
      type: {
        kind: "struct";
        fields: [
          {
            name: "instantDepositsNative";
            type: "u64";
          },
          {
            name: "prevEntropyAccountDeposits";
            type: "u64";
          },
          {
            name: "initialEquity";
            type: "f64";
          },
          {
            name: "newEquityPostDeposit";
            type: "f64";
          },
          {
            name: "depositAmt";
            type: "f64";
          },
          {
            name: "withdrawCompFromDeposit";
            type: "u64";
          },
          {
            name: "netDeposits";
            type: "f64";
          },
          {
            name: "depositAmtNative";
            type: "u64";
          },
          {
            name: "withdrawAmtNative";
            type: "u64";
          },
          {
            name: "totalVoltSupply";
            type: "u64";
          },
          {
            name: "oraclePrice";
            type: "f64";
          },
          {
            name: "acctEquityStart";
            type: "f64";
          },
          {
            name: "acctEquityBeforeNextRebalance";
            type: "f64";
          },
          {
            name: "pnlQuote";
            type: "f64";
          },
          {
            name: "performanceFeesQuote";
            type: "f64";
          },
          {
            name: "temp1";
            type: "publicKey";
          },
          {
            name: "temp2";
            type: "publicKey";
          },
          {
            name: "temp3";
            type: "publicKey";
          },
          {
            name: "extraKey11";
            type: "publicKey";
          },
          {
            name: "extraKey12";
            type: "publicKey";
          },
          {
            name: "unusedUintFour";
            type: "u64";
          },
          {
            name: "unusedUintFive";
            type: "u64";
          },
          {
            name: "unusedUintSix";
            type: "u64";
          },
          {
            name: "unusedUint12";
            type: "u64";
          },
          {
            name: "unusedFloat1";
            type: "f64";
          },
          {
            name: "unusedFloat2";
            type: "f64";
          },
          {
            name: "unusedFloat3";
            type: "f64";
          },
          {
            name: "unusedFloat4";
            type: "f64";
          },
          {
            name: "unusedBoolOne";
            type: "bool";
          },
          {
            name: "unusedBoolTwo";
            type: "bool";
          },
          {
            name: "unusedBoolThree";
            type: "bool";
          },
          {
            name: "unusedBoolFour";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "Round";
      type: {
        kind: "struct";
        fields: [
          {
            name: "number";
            type: "u64";
          },
          {
            name: "underlyingFromPendingDeposits";
            type: "u64";
          },
          {
            name: "voltTokensFromPendingWithdrawals";
            type: "u64";
          },
          {
            name: "underlyingPreEnter";
            type: "u64";
          },
          {
            name: "underlyingPostSettle";
            type: "u64";
          },
          {
            name: "premiumFarmed";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "FriktionEpochInfo";
      type: {
        kind: "struct";
        fields: [
          {
            name: "vaultTokenPrice";
            type: "f64";
          },
          {
            name: "pctPnl";
            type: "f64";
          },
          {
            name: "number";
            type: "u64";
          },
          {
            name: "underlyingPreEnter";
            type: "u64";
          },
          {
            name: "underlyingPostSettle";
            type: "u64";
          },
          {
            name: "voltTokenSupply";
            type: "u64";
          },
          {
            name: "pnl";
            type: "i64";
          },
          {
            name: "performanceFees";
            type: "u64";
          },
          {
            name: "withdrawalFees";
            type: "u64";
          },
          {
            name: "pendingDeposits";
            type: "u64";
          },
          {
            name: "pendingWithdrawalsVoltTokens";
            type: "u64";
          },
          {
            name: "pendingWithdrawals";
            type: "u64";
          },
          {
            name: "canceledWithdrawals";
            type: "u64";
          },
          {
            name: "canceledDeposits";
            type: "u64";
          },
          {
            name: "totalWithdrawals";
            type: "u64";
          },
          {
            name: "totalDeposits";
            type: "u64";
          },
          {
            name: "instantDeposits";
            type: "u64";
          },
          {
            name: "instantWithdrawals";
            type: "u64";
          },
          {
            name: "daoDeposits";
            type: "u64";
          },
          {
            name: "mintedOptions";
            type: "u64";
          },
          {
            name: "enterNumTimesCalled";
            type: "u64";
          },
          {
            name: "swapPremiumNumTimesCalled";
            type: "u64";
          },
          {
            name: "optionKey";
            type: "publicKey";
          },
          {
            name: "extraKeyFour";
            type: "publicKey";
          },
          {
            name: "extraKey5";
            type: "publicKey";
          },
          {
            name: "extraKey6";
            type: "publicKey";
          },
          {
            name: "extraKey7";
            type: "publicKey";
          },
          {
            name: "extraKey8";
            type: "publicKey";
          },
          {
            name: "extraKey9";
            type: "publicKey";
          },
          {
            name: "extraKey10";
            type: "publicKey";
          },
          {
            name: "extraKey11";
            type: "publicKey";
          },
          {
            name: "extraKey12";
            type: "publicKey";
          },
          {
            name: "unusedUintFour";
            type: "u64";
          },
          {
            name: "unusedUintFive";
            type: "u64";
          },
          {
            name: "unusedUintSix";
            type: "u64";
          },
          {
            name: "unusedUint7";
            type: "u64";
          },
          {
            name: "unusedUint8";
            type: "u64";
          },
          {
            name: "unusedUint9";
            type: "u64";
          },
          {
            name: "unusedUint10";
            type: "u64";
          },
          {
            name: "unusedUint11";
            type: "u64";
          },
          {
            name: "unusedUint12";
            type: "u64";
          },
          {
            name: "unusedBoolOne";
            type: "bool";
          },
          {
            name: "unusedBoolTwo";
            type: "bool";
          },
          {
            name: "unusedBoolThree";
            type: "bool";
          },
          {
            name: "unusedBoolFour";
            type: "bool";
          },
          {
            name: "unusedBoolFive";
            type: "bool";
          },
          {
            name: "unusedBoolSix";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "EntropyMetadata";
      type: {
        kind: "struct";
        fields: [
          {
            name: "targetHedgeRatio";
            type: "f64";
          },
          {
            name: "rebalancingLenience";
            type: "f64";
          },
          {
            name: "requiredBasisFromOracle";
            type: "f64";
          },
          {
            name: "extraKey3";
            type: "publicKey";
          },
          {
            name: "extraKey4";
            type: "publicKey";
          },
          {
            name: "extraKey5";
            type: "publicKey";
          },
          {
            name: "extraKey6";
            type: "publicKey";
          },
          {
            name: "extraKey7";
            type: "publicKey";
          },
          {
            name: "extraKey8";
            type: "publicKey";
          },
          {
            name: "extraKey9";
            type: "publicKey";
          },
          {
            name: "extraKey10";
            type: "publicKey";
          },
          {
            name: "extraKey11";
            type: "publicKey";
          },
          {
            name: "extraKey12";
            type: "publicKey";
          },
          {
            name: "unusedUintFour";
            type: "u64";
          },
          {
            name: "unusedUintFive";
            type: "u64";
          },
          {
            name: "unusedUintSix";
            type: "u64";
          },
          {
            name: "unusedUint12";
            type: "u64";
          },
          {
            name: "unusedUint123";
            type: "u64";
          },
          {
            name: "unusedUint456";
            type: "u64";
          },
          {
            name: "unusedUint789";
            type: "u64";
          },
          {
            name: "unusedUint102";
            type: "u64";
          },
          {
            name: "unusedFloat1";
            type: "f64";
          },
          {
            name: "unusedFloat2";
            type: "f64";
          },
          {
            name: "unusedFloat3";
            type: "f64";
          },
          {
            name: "unusedFloat4";
            type: "f64";
          },
          {
            name: "unusedFloat5";
            type: "f64";
          },
          {
            name: "unusedFloat6";
            type: "f64";
          },
          {
            name: "unusedFloat7";
            type: "f64";
          },
          {
            name: "unusedFloat8";
            type: "f64";
          },
          {
            name: "unusedFloat9";
            type: "f64";
          },
          {
            name: "unusedFloat10";
            type: "f64";
          },
          {
            name: "unusedFloat11";
            type: "f64";
          },
          {
            name: "unusedFloat12";
            type: "f64";
          },
          {
            name: "unusedBoolOne";
            type: "bool";
          },
          {
            name: "unusedBoolTwo";
            type: "bool";
          },
          {
            name: "unusedBoolThree";
            type: "bool";
          },
          {
            name: "unusedBoolFour";
            type: "bool";
          },
          {
            name: "unusedBoolFive";
            type: "bool";
          },
          {
            name: "unusedBoolSix";
            type: "bool";
          },
          {
            name: "unusedBoolSeven";
            type: "bool";
          },
          {
            name: "unusedBoolEight";
            type: "bool";
          },
          {
            name: "unusedBoolNine";
            type: "bool";
          },
          {
            name: "unusedBoolTen";
            type: "bool";
          },
          {
            name: "vaultName";
            type: "string";
          }
        ];
      };
    },
    {
      name: "ExtraVoltData";
      type: {
        kind: "struct";
        fields: [
          {
            name: "isWhitelisted";
            type: "bool";
          },
          {
            name: "whitelist";
            type: "publicKey";
          },
          {
            name: "isForDao";
            type: "bool";
          },
          {
            name: "daoProgramId";
            type: "publicKey";
          },
          {
            name: "depositMint";
            type: "publicKey";
          },
          {
            name: "targetLeverage";
            type: "f64";
          },
          {
            name: "targetLeverageLenience";
            type: "f64";
          },
          {
            name: "exitEarlyRatio";
            type: "f64";
          },
          {
            name: "entropyProgramId";
            type: "publicKey";
          },
          {
            name: "entropyGroup";
            type: "publicKey";
          },
          {
            name: "entropyAccount";
            type: "publicKey";
          },
          {
            name: "powerPerpMarket";
            type: "publicKey";
          },
          {
            name: "haveResolvedDeposits";
            type: "bool";
          },
          {
            name: "doneRebalancing";
            type: "bool";
          },
          {
            name: "daoAuthority";
            type: "publicKey";
          },
          {
            name: "serumProgramId";
            type: "publicKey";
          },
          {
            name: "entropyCache";
            type: "publicKey";
          },
          {
            name: "spotPerpMarket";
            type: "publicKey";
          },
          {
            name: "extraKey7";
            type: "publicKey";
          },
          {
            name: "extraKey8";
            type: "publicKey";
          },
          {
            name: "extraKey9";
            type: "publicKey";
          },
          {
            name: "extraKey10";
            type: "publicKey";
          },
          {
            name: "extraKey11";
            type: "publicKey";
          },
          {
            name: "extraKey12";
            type: "publicKey";
          },
          {
            name: "extraKey13";
            type: "publicKey";
          },
          {
            name: "extraKey14";
            type: "publicKey";
          },
          {
            name: "netWithdrawals";
            type: "u64";
          },
          {
            name: "maxQuotePosChange";
            type: "u64";
          },
          {
            name: "targetHedgeLenience";
            type: "f64";
          },
          {
            name: "unusedUintFour";
            type: "u64";
          },
          {
            name: "unusedUintFive";
            type: "u64";
          },
          {
            name: "unusedUintSix";
            type: "u64";
          },
          {
            name: "unusedUint7";
            type: "u64";
          },
          {
            name: "unusedUint8";
            type: "u64";
          },
          {
            name: "unusedUint9";
            type: "u64";
          },
          {
            name: "unusedUint10";
            type: "u64";
          },
          {
            name: "unusedUint11";
            type: "u64";
          },
          {
            name: "unusedUint12";
            type: "u64";
          },
          {
            name: "turnOffDepositsAndWithdrawals";
            type: "bool";
          },
          {
            name: "rebalanceIsReady";
            type: "bool";
          },
          {
            name: "unusedBool1234";
            type: "bool";
          },
          {
            name: "doneRebalancingPowerPerp";
            type: "bool";
          },
          {
            name: "isHedgingOn";
            type: "bool";
          },
          {
            name: "haveTakenPerformanceFees";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "VoltVault";
      type: {
        kind: "struct";
        fields: [
          {
            name: "adminKey";
            type: "publicKey";
          },
          {
            name: "seed";
            type: "publicKey";
          },
          {
            name: "transferWindow";
            type: "u64";
          },
          {
            name: "startTransferTime";
            type: "u64";
          },
          {
            name: "endTransferTime";
            type: "u64";
          },
          {
            name: "initialized";
            type: "bool";
          },
          {
            name: "currOptionWasSettled";
            type: "bool";
          },
          {
            name: "mustSwapPremiumToUnderlying";
            type: "bool";
          },
          {
            name: "nextOptionWasSet";
            type: "bool";
          },
          {
            name: "firstEverOptionWasSet";
            type: "bool";
          },
          {
            name: "instantTransfersEnabled";
            type: "bool";
          },
          {
            name: "prepareIsFinished";
            type: "bool";
          },
          {
            name: "enterIsFinished";
            type: "bool";
          },
          {
            name: "roundHasStarted";
            type: "bool";
          },
          {
            name: "roundNumber";
            type: "u64";
          },
          {
            name: "totalUnderlyingPreEnter";
            type: "u64";
          },
          {
            name: "totalUnderlyingPostSettle";
            type: "u64";
          },
          {
            name: "totalVoltTokensPostSettle";
            type: "u64";
          },
          {
            name: "vaultAuthority";
            type: "publicKey";
          },
          {
            name: "depositPool";
            type: "publicKey";
          },
          {
            name: "premiumPool";
            type: "publicKey";
          },
          {
            name: "optionPool";
            type: "publicKey";
          },
          {
            name: "writerTokenPool";
            type: "publicKey";
          },
          {
            name: "vaultMint";
            type: "publicKey";
          },
          {
            name: "underlyingAssetMint";
            type: "publicKey";
          },
          {
            name: "quoteAssetMint";
            type: "publicKey";
          },
          {
            name: "optionMint";
            type: "publicKey";
          },
          {
            name: "writerTokenMint";
            type: "publicKey";
          },
          {
            name: "optionMarket";
            type: "publicKey";
          },
          {
            name: "vaultType";
            type: "u64";
          },
          {
            name: "underlyingAmountPerContract";
            type: "u64";
          },
          {
            name: "quoteAmountPerContract";
            type: "u64";
          },
          {
            name: "expirationUnixTimestamp";
            type: "i64";
          },
          {
            name: "expirationInterval";
            type: "u64";
          },
          {
            name: "upperBoundOtmStrikeFactor";
            type: "u64";
          },
          {
            name: "haveTakenWithdrawalFees";
            type: "bool";
          },
          {
            name: "serumSpotMarket";
            type: "publicKey";
          },
          {
            name: "openOrdersBump";
            type: "u8";
          },
          {
            name: "openOrdersInitBump";
            type: "u8";
          },
          {
            name: "ulOpenOrdersBump";
            type: "u8";
          },
          {
            name: "ulOpenOrders";
            type: "publicKey";
          },
          {
            name: "ulOpenOrdersInitialized";
            type: "bool";
          },
          {
            name: "bumpAuthority";
            type: "u8";
          },
          {
            name: "serumOrderSizeOptions";
            type: "u64";
          },
          {
            name: "individualCapacity";
            type: "u64";
          },
          {
            name: "serumOrderType";
            type: "u64";
          },
          {
            name: "serumLimit";
            type: "u16";
          },
          {
            name: "serumSelfTradeBehavior";
            type: "u16";
          },
          {
            name: "serumClientOrderId";
            type: "u64";
          },
          {
            name: "whitelistTokenMint";
            type: "publicKey";
          },
          {
            name: "permissionedMarketPremiumMint";
            type: "publicKey";
          },
          {
            name: "permissionedMarketPremiumPool";
            type: "publicKey";
          },
          {
            name: "capacity";
            type: "u64";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "OptionsProtocol";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Soloptions";
          },
          {
            name: "Inertia";
          }
        ];
      };
    },
    {
      name: "SelfTradeBehavior";
      type: {
        kind: "enum";
        variants: [
          {
            name: "DecrementTake";
          },
          {
            name: "CancelProvide";
          },
          {
            name: "AbortTransaction";
          }
        ];
      };
    },
    {
      name: "OrderType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Limit";
          },
          {
            name: "ImmediateOrCancel";
          },
          {
            name: "PostOnly";
          }
        ];
      };
    },
    {
      name: "NewSide";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Bid";
          },
          {
            name: "Ask";
          }
        ];
      };
    },
    {
      name: "VoltType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "ShortOptions";
          },
          {
            name: "Entropy";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "ExpirationIsInThePast";
      msg: "Expiration must be in the future";
    },
    {
      code: 6001;
      name: "QuoteAndUnderlyingAssetMustDiffer";
      msg: "Same quote and underlying asset, cannot create market";
    },
    {
      code: 6002;
      name: "QuoteOrUnderlyingAmountCannotBe0";
      msg: "Quote amount and underlying amount per contract must be > 0";
    },
    {
      code: 6003;
      name: "OptionMarketMustBeMintAuthority";
      msg: "OptionMarket must be the mint authority";
    },
    {
      code: 6004;
      name: "OptionMarketMustOwnUnderlyingAssetPool";
      msg: "OptionMarket must own the underlying asset pool";
    },
    {
      code: 6005;
      name: "OptionMarketMustOwnQuoteAssetPool";
      msg: "OptionMarket must own the quote asset pool";
    },
    {
      code: 6006;
      name: "ExpectedSPLTokenProgramId";
      msg: "Stop trying to spoof the SPL Token program! Shame on you";
    },
    {
      code: 6007;
      name: "MintFeeMustBeOwnedByFeeOwner";
      msg: "Mint fee account must be owned by the FEE_OWNER";
    },
    {
      code: 6008;
      name: "ExerciseFeeMustBeOwnedByFeeOwner";
      msg: "Exercise fee account must be owned by the FEE_OWNER";
    },
    {
      code: 6009;
      name: "MintFeeTokenMustMatchUnderlyingAsset";
      msg: "Mint fee token must be the same as the underlying asset";
    },
    {
      code: 6010;
      name: "ExerciseFeeTokenMustMatchQuoteAsset";
      msg: "Exercise fee token must be the same as the quote asset";
    },
    {
      code: 6011;
      name: "OptionMarketExpiredCantMint";
      msg: "OptionMarket is expired, can't mint";
    },
    {
      code: 6012;
      name: "UnderlyingPoolAccountDoesNotMatchMarket";
      msg: "Underlying pool account does not match the value on the OptionMarket";
    },
    {
      code: 6013;
      name: "OptionTokenMintDoesNotMatchMarket";
      msg: "OptionToken mint does not match the value on the OptionMarket";
    },
    {
      code: 6014;
      name: "WriterTokenMintDoesNotMatchMarket";
      msg: "WriterToken mint does not match the value on the OptionMarket";
    },
    {
      code: 6015;
      name: "MintFeeKeyDoesNotMatchOptionMarket";
      msg: "MintFee key does not match the value on the OptionMarket";
    },
    {
      code: 6016;
      name: "SizeCantBeLessThanEqZero";
      msg: "The size argument must be > 0";
    },
    {
      code: 6017;
      name: "ExerciseFeeKeyDoesNotMatchOptionMarket";
      msg: "exerciseFee key does not match the value on the OptionMarket";
    },
    {
      code: 6018;
      name: "QuotePoolAccountDoesNotMatchMarket";
      msg: "Quote pool account does not match the value on the OptionMarket";
    },
    {
      code: 6019;
      name: "UnderlyingDestMintDoesNotMatchUnderlyingAsset";
      msg: "Underlying destination mint must match underlying asset mint address";
    },
    {
      code: 6020;
      name: "FeeOwnerDoesNotMatchProgram";
      msg: "Fee owner does not match the program's fee owner";
    },
    {
      code: 6021;
      name: "OptionMarketExpiredCantExercise";
      msg: "OptionMarket is expired, can't exercise";
    },
    {
      code: 6022;
      name: "OptionMarketNotExpiredCantClose";
      msg: "OptionMarket has not expired, can't close";
    },
    {
      code: 6023;
      name: "NotEnoughQuoteAssetsInPool";
      msg: "Not enough assets in the quote asset pool";
    },
    {
      code: 6024;
      name: "InvalidAuth";
      msg: "Invalid auth token provided";
    },
    {
      code: 6025;
      name: "CoinMintIsNotOptionMint";
      msg: "Coin mint must match option mint";
    },
    {
      code: 6026;
      name: "CannotPruneActiveMarket";
      msg: "Cannot prune the market while it's still active";
    },
    {
      code: 6027;
      name: "NumberOverflow";
      msg: "Numerical overflow";
    },
    {
      code: 6028;
      name: "InvalidOrderType";
      msg: "Invalid order type";
    },
    {
      code: 6029;
      name: "InvalidSelfTradeBehavior";
      msg: "Invalid self trade behavior";
    },
    {
      code: 6030;
      name: "Unauthorized";
      msg: "Unauthorized.";
    },
    {
      code: 6031;
      name: "InsufficientCollateralForWriting";
      msg: "Insufficient collateral to write options.";
    },
    {
      code: 6032;
      name: "InsufficientVaultTokens";
      msg: "Insufficient Vault tokens to redeem.";
    },
    {
      code: 6033;
      name: "ContractExpired";
      msg: "Options contract is expired.";
    },
    {
      code: 6034;
      name: "ContractNotYetExpired";
      msg: "Cannot redeem until contract expiry.";
    },
    {
      code: 6035;
      name: "InvalidMintAmount";
      msg: "mint amount was 0, skipping mint_helper()...";
    },
    {
      code: 6036;
      name: "InvalidRebalanceExitTime";
      msg: "invalid time to exit position rebalanceExit()";
    },
    {
      code: 6037;
      name: "InvalidRebalanceEntryTime";
      msg: "invalid time to enter position rebalanceEnter()";
    },
    {
      code: 6038;
      name: "InvalidRebalancePrepareTime";
      msg: "invalid time to call rebalancePrepare()";
    },
    {
      code: 6039;
      name: "InvalidWithdrawalTime";
      msg: "invalid time to withdraw";
    },
    {
      code: 6040;
      name: "InvalidDepositTime";
      msg: "invalid time to deposit";
    },
    {
      code: 6041;
      name: "InvalidSetNextOptionTime";
      msg: "invalid time to set next option";
    },
    {
      code: 6042;
      name: "InvalidDepositAmount";
      msg: "invalid deposit amount";
    },
    {
      code: 6043;
      name: "InvalidRebalanceSettleTime";
      msg: "invalid rebalance settle time";
    },
    {
      code: 6044;
      name: "InvalidRebalanceSettleState";
      msg: "invalid rebalance settle state";
    },
    {
      code: 6045;
      name: "InvalidRebalanceEnterState";
      msg: "invalid rebalance enter state";
    },
    {
      code: 6046;
      name: "OptionsPositionNotSettled";
      msg: "options position not settled, must be before withdrawal";
    },
    {
      code: 6047;
      name: "NonUnderlyingPoolsHaveAssets";
      msg: "non underlying pools have assets when attempting withdraw";
    },
    {
      code: 6048;
      name: "VaultAuthorityMustBeVaultMintAuthority";
      msg: "volt must be vault mint authority";
    },
    {
      code: 6049;
      name: "VaultAuthorityMustOwnDepositPool";
      msg: "volt must own deposit pool";
    },
    {
      code: 6050;
      name: "VaultAuthorityMustOwnPremiumPool";
      msg: "volt must own premium pool";
    },
    {
      code: 6051;
      name: "VoltVaulttMustOwnWriterTokenPool";
      msg: "volt must own writer token pool";
    },
    {
      code: 6052;
      name: "VoltVaultMustOwnOptionPool";
      msg: "volt must own option pool";
    },
    {
      code: 6053;
      name: "DepositPoolDoesNotMatchVoltVault";
      msg: "DepositPoolDoesNotMatchVoltVault";
    },
    {
      code: 6054;
      name: "OptionPoolDoesNotMatchVoltVault";
      msg: "OptionPoolDoesNotMatchVoltVault";
    },
    {
      code: 6055;
      name: "PremiumPoolDoesNotMatchVoltVault";
      msg: "PremiumPoolDoesNotMatchVoltVault";
    },
    {
      code: 6056;
      name: "TraidngPoolDoesNotMatchVoltVault";
      msg: "TradingPoolDoesNotMatchVoltVault";
    },
    {
      code: 6057;
      name: "OptionMintDoesNotMatchOptionMarket";
      msg: "option mint does not match option market";
    },
    {
      code: 6058;
      name: "NoOrdersInOptionOrderBook";
      msg: "NoBidsInOptionOrderBook";
    },
    {
      code: 6059;
      name: "CpiProgramMustBeSomeInPlaceOrder";
      msg: "cpi program must be Some in place order";
    },
    {
      code: 6060;
      name: "NewOptionMustNotBeExpired";
      msg: "new option must not be expired";
    },
    {
      code: 6061;
      name: "NewOptionMustHaveExactExpiry";
      msg: "new option has roughly target expiry (within lower/upper bounds)";
    },
    {
      code: 6062;
      name: "NewOptionHasWrongUnderlyingAsset";
      msg: "new option has wrong underlying asset";
    },
    {
      code: 6063;
      name: "NewOptionHasWrongQuoteAsset";
      msg: "new option has wrong quote asset";
    },
    {
      code: 6064;
      name: "NewOptionHasWrongContractSize";
      msg: "new option has wrong contract size";
    },
    {
      code: 6065;
      name: "NewOptionHasInvalidStrike";
      msg: "new option has invalid strike";
    },
    {
      code: 6066;
      name: "RebalanceSettleHasLeftoverWriterTokens";
      msg: "rebalance settle has leftover writer tokens";
    },
    {
      code: 6067;
      name: "CurrentOptionMustNotBeExpired";
      msg: "current option must not be expired";
    },
    {
      code: 6068;
      name: "CannotReinitializeVolt";
      msg: "cannot reinitialize an (already initialized) volt";
    },
    {
      code: 6069;
      name: "OldOptionAndWriterTokenPoolsMustBeEmpty";
      msg: "cannot reinitialize an (already initialized) volt";
    },
    {
      code: 6070;
      name: "InvalidOldOptionWriterTokenPools";
      msg: "invalid old option writer token pools";
    },
    {
      code: 6071;
      name: "VaultMintDoesNotMatchUserTokenAccount";
      msg: "vault mint does not match user token account";
    },
    {
      code: 6072;
      name: "DepositPoolMintDoesNotMatchUserTokenAccount";
      msg: "deposit pool mint does not match user token account";
    },
    {
      code: 6073;
      name: "VaultAuthorityDoesNotMatch";
      msg: "vault authority does not match";
    },
    {
      code: 6074;
      name: "DexProgramIdDoesNotMatchAnchor";
      msg: "DEX program id does not match";
    },
    {
      code: 6075;
      name: "InertiaProgramIdDoesNotMatch";
      msg: "Inertia program id does not match";
    },
    {
      code: 6076;
      name: "InvalidAuthorityForPermissionedInstruction";
      msg: "Invalid authority for permissioned instruction";
    },
    {
      code: 6077;
      name: "WriterTokenMintDoesNotMatchOptionMarket";
      msg: "writer token mint does not match option market";
    },
    {
      code: 6078;
      name: "OptionMarketMustBeOwnedByProtocol";
      msg: "option market should be owned by protocol (e.g inertia)";
    },
    {
      code: 6079;
      name: "UnderlyingAssetMintDoesNotMatchVoltVault";
      msg: "underlying asset mint does not match voltvault";
    },
    {
      code: 6080;
      name: "QuoteAssetMintDoesNotMatchVoltVault";
      msg: "quote asset mint does not match voltvault";
    },
    {
      code: 6081;
      name: "VaultMintDoesNotMatchVoltVault";
      msg: "vault mint does not match volt vault";
    },
    {
      code: 6082;
      name: "OptionMarketDoesNotMatchVoltVault";
      msg: "option market does not match volt vault";
    },
    {
      code: 6083;
      name: "WriterTokenPoolDoesNotMatchVoltVault";
      msg: "writer token pool does not match volt vault";
    },
    {
      code: 6084;
      name: "InvalidRebalanceSwapPremiumState";
      msg: "invalid rebalance swap premium state";
    },
    {
      code: 6085;
      name: "ShouldBeUnreachable";
      msg: "should be unreachable code";
    },
    {
      code: 6086;
      name: "CantHaveMultiplePendingDeposits";
      msg: "shouldn't have multiple pending deposits";
    },
    {
      code: 6087;
      name: "InvalidStartRoundState";
      msg: "invalid start round state";
    },
    {
      code: 6088;
      name: "InvalidSetNextOptionState";
      msg: "invalid set next option state";
    },
    {
      code: 6089;
      name: "InvalidClaimPendingState";
      msg: "invalid claim pending state";
    },
    {
      code: 6090;
      name: "InvalidEndRoundState";
      msg: "invalid end round state";
    },
    {
      code: 6091;
      name: "CantHaveMultiplePendingWithdrawals";
      msg: "shouldn't have multiple pending deposits";
    },
    {
      code: 6092;
      name: "InvalidClaimPendingWithdrawalState";
      msg: "invalid claim pending withdrawal state";
    },
    {
      code: 6093;
      name: "InvalidNextOptionMarket";
      msg: "invalid next option market";
    },
    {
      code: 6094;
      name: "TokenNotRevoked";
      msg: "Auth token not revoked";
    },
    {
      code: 6095;
      name: "NonWhitelistedUser";
      msg: "user is not whitelisted";
    },
    {
      code: 6096;
      name: "UserIsNotSigner";
      msg: "user is not signer";
    },
    {
      code: 6097;
      name: "InvalidWhitelistAuthority";
      msg: "authority does not match whitelist admin";
    },
    {
      code: 6098;
      name: "InvalidWhitelistAndOptionMarketCombination";
      msg: "whitelist and option market do not generate correct PDA";
    },
    {
      code: 6099;
      name: "RoundVoltTokensMintDoesNotMatchVoltVault";
      msg: "round volt tokens mint does not match volt vault";
    },
    {
      code: 6100;
      name: "RoundUnderlyingTokensMintDoesNotMatchVoltVault";
      msg: "round underlying tokens mint does not match volt vault";
    },
    {
      code: 6101;
      name: "UnderlyingAssetPoolDoesNotMatchOptionMarket";
      msg: "UnderlyingAssetPoolDoesNotMatchOptionMarket";
    },
    {
      code: 6102;
      name: "NoOppositeOrderOnSerumMarket";
      msg: "no opposite order on serum market";
    },
    {
      code: 6103;
      name: "BidPriceOnSerumMarketTooLow";
      msg: "bid price on serum market too low";
    },
    {
      code: 6104;
      name: "OfferPriceOnSerumMarketTooHigh";
      msg: "offer price on serum market too high";
    },
    {
      code: 6105;
      name: "UnderlyingOpenOrdersDoesNotMatchVoltVault";
      msg: "underlying open orders does not match volt vault";
    },
    {
      code: 6106;
      name: "MustHaveAtLeastOneMarketMakerAccessToken";
      msg: "must have at least one market maker access token";
    },
    {
      code: 6107;
      name: "MiddlewareProgramIdDoesNotMatch";
      msg: "middleware program id does not match expected";
    },
    {
      code: 6108;
      name: "FeeAccountOwnerDoesNotMatch";
      msg: "fee account owner does not match expected";
    },
    {
      code: 6109;
      name: "FeeAccountMintDoesNotMatchDepositPool";
      msg: "fee account mint does not match deposit pool";
    },
    {
      code: 6110;
      name: "VaultCapacityWouldBeExceeded";
      msg: "vault capacity would be exceeded";
    },
    {
      code: 6111;
      name: "IndividualDepositCapacityWouldBeExceeded";
      msg: "individual deposit capacity would be exceeded";
    },
    {
      code: 6112;
      name: "UnsupportedOptionMarketProgramId";
      msg: "unsupported option market program ID";
    },
    {
      code: 6113;
      name: "InvalidEndDcaRoundState";
      msg: "invalid end dca round state";
    },
    {
      code: 6114;
      name: "RoundHasNotStarted";
      msg: "round has not started";
    },
    {
      code: 6115;
      name: "PermissionedMarketPremiumPoolDoesNotMatchVoltVault";
      msg: "permissioned makret premium pool does not match volt";
    },
    {
      code: 6116;
      name: "TokenAccountOwnersDoNotMatch";
      msg: "token account owners do not match";
    },
    {
      code: 6117;
      name: "InvalidPermissionedMarketPremiumMint";
      msg: "invalid permissioned market premium mint";
    },
    {
      code: 6118;
      name: "PremiumPoolAmountMustBeGreaterThanZero";
      msg: "premium pool amount must be greater than zero";
    },
    {
      code: 6119;
      name: "CantCloseNonEmptyTokenAccount";
      msg: "can't close non empty token account";
    },
    {
      code: 6120;
      name: "MustFinishEnteringBeforeSettlingPermissionedMarketPremium";
      msg: "must finish entering before settling permissioned market premium funds";
    },
    {
      code: 6121;
      name: "PendingWithdrawalInfoNotInitialized";
      msg: "pending withdrawal info must be initialized";
    },
    {
      code: 6122;
      name: "PendingWithdrawalDoesNotExist";
      msg: "pending withdrawal does not exist";
    },
    {
      code: 6123;
      name: "CannotCancelPendingWithdrawalFromOldRound";
      msg: "cannot cancel pending withdrawal from old round";
    },
    {
      code: 6124;
      name: "InvalidTakePendingWithdrawalFeesState";
      msg: "invalid take pending withdrawal fees state";
    },
    {
      code: 6125;
      name: "PendingDepositInfoNotInitialized";
      msg: "pending deposit info not initialized";
    },
    {
      code: 6126;
      name: "PendingDepositDoesNotExist";
      msg: "pending deposits does not exist";
    },
    {
      code: 6127;
      name: "CannotCancelPendingDepositFromOldRound";
      msg: "cannot cancel pending deposit from old round";
    },
    {
      code: 6128;
      name: "VaultDestinationDoesNotMatchVoltVault";
      msg: "vault destination does not match volt vault";
    },
    {
      code: 6129;
      name: "MustTakeWithdrawalFeesBeforeStartingRound";
      msg: "must take withdrawal fees before starting round";
    },
    {
      code: 6130;
      name: "RoundMustBeEnded";
      msg: "round must be ended";
    },
    {
      code: 6131;
      name: "MustNotHaveSoldOptionTokens";
      msg: "must not have sold option tokens to reset";
    },
    {
      code: 6132;
      name: "CantCloseAccountUnlessEmpty";
      msg: "cannot close account unless empty";
    },
    {
      code: 6133;
      name: "OpenOrderMustBeEmptyToClose";
      msg: "open orders must be empty to close";
    },
    {
      code: 6134;
      name: "InvalidWhitelistAccountVector";
      msg: "invalid whitelist account (vector)";
    },
    {
      code: 6135;
      name: "InvalidDaoProgramId";
      msg: "invalid dao program ID";
    },
    {
      code: 6136;
      name: "VoltMustBeForDao";
      msg: "volt must be for dao";
    },
    {
      code: 6137;
      name: "InvalidDaoAuthority";
      msg: "invalid dao authority";
    },
    {
      code: 6138;
      name: "DaoAuthorityMustSign";
      msg: "dao authority must sign";
    },
    {
      code: 6139;
      name: "InvalidPendingDepositKey";
      msg: "invalid pending deposit key";
    },
    {
      code: 6140;
      name: "InvalidAuthorityCheck";
      msg: "invalid authority check";
    },
    {
      code: 6141;
      name: "InvalidEndEntropyRoundState";
      msg: "entropy: invalid end entropy round state";
    },
    {
      code: 6142;
      name: "InvalidVoltType";
      msg: "invalid volt type";
    },
    {
      code: 6143;
      name: "CantFindPerpMarketIndex";
      msg: "can't find perp market index";
    },
    {
      code: 6144;
      name: "AccountEquityLessThanZero";
      msg: "account equity less than zero";
    },
    {
      code: 6145;
      name: "QuotePositionChangedTooMuch";
      msg: "quote position changed too much";
    },
    {
      code: 6146;
      name: "MustMoveCloserToTargetCollateralization";
      msg: "must move closer to target collateralization";
    },
    {
      code: 6147;
      name: "CollateralNotWithinLenience";
      msg: "collateral not within lenience";
    },
    {
      code: 6148;
      name: "InvalidRebalanceEntropyState";
      msg: "invalid rebalance entropy state";
    },
    {
      code: 6149;
      name: "BasePositionMustBeNegative";
      msg: "volt must have negative base position (be short)";
    },
    {
      code: 6150;
      name: "QuotePositionMustBePositive";
      msg: "volt must have positive quote position (be short)";
    },
    {
      code: 6151;
      name: "TargetCollateralRatioMustBeNegative";
      msg: "target collateral ratio must be neggat";
    },
    {
      code: 6152;
      name: "NewEquityMustBeHigherThanDepositAmount";
      msg: "new equity must be higher than deposit amt";
    },
    {
      code: 6153;
      name: "InstantTransfersMustBeDisabled";
      msg: "instant transfers must be enabled";
    },
    {
      code: 6154;
      name: "RebalanceMustBeReady";
      msg: "rebalance must be ready";
    },
    {
      code: 6155;
      name: "IncorrectHedge";
      msg: "spot hedge unbalanced";
    },
    {
      code: 6156;
      name: "VaultNameMustBeNonZeroLength";
      msg: "vault name must be zero length";
    },
    {
      code: 6157;
      name: "VaultDoesNotSupportOverLeveragedStrategies";
      msg: "vault does not support over leveraged strategies";
    },
    {
      code: 6158;
      name: "LenienceMustBeGreaterThanZero";
      msg: "lenience must be greater than zero";
    },
    {
      code: 6159;
      name: "LenienceShouldNotBeGreaterThanLeverage";
      msg: "lenience should not be greater than leverage";
    },
    {
      code: 6160;
      name: "HedgeLenienceMustBeGreaterThanZero";
      msg: "hedge lenience should be greater than leverage";
    },
    {
      code: 6161;
      name: "VaultDoesNotSupportExitEarlyOverLeveragedStrategies";
      msg: "exit early ratio must be < 1.0";
    },
    {
      code: 6162;
      name: "RoundNumberMustNotOverflow";
      msg: "round number must not overflow";
    },
    {
      code: 6163;
      name: "InvalidWhitelistTokenAccountMint";
      msg: "invalid whitelist token account mint";
    },
    {
      code: 6164;
      name: "SoloptionsProgramIdDoesNotMatch";
      msg: "soloptions program id does not matchf";
    },
    {
      code: 6165;
      name: "WhitelistTokenAccountOwnerIsNotUser";
      msg: "whitelist token account owner is not user";
    },
    {
      code: 6166;
      name: "SolTransferAuthorityMustNotBeOwnedByVoltProgram";
      msg: "sol transfer authority must be owned by volt program";
    },
    {
      code: 6167;
      name: "InsufficientCollateralForDeposit";
      msg: "Insufficient collateral to deposit.";
    },
    {
      code: 6168;
      name: "SolTransferAuthorityMustBeWritableAndSigner";
      msg: "sol transfer authority must be writable/signer";
    },
    {
      code: 6169;
      name: "VoltMustBeOfEntropyType";
      msg: "volt must be entropy type";
    },
    {
      code: 6170;
      name: "VoltMustBeofShortOptionsType";
      msg: "volt must be of short options type";
    },
    {
      code: 6171;
      name: "DepositsAndWithdrawalsAreTurnedOff";
      msg: "deposits and withdrawals are turned off";
    },
    {
      code: 6172;
      name: "UnrecognizedEntropyProgramId";
      msg: "unrecognized entropy program id";
    },
    {
      code: 6173;
      name: "InvalidTakePerformanceFeesState";
      msg: "invalid take performance fees state";
    },
    {
      code: 6174;
      name: "DiscriminatorDoesNotMatch";
      msg: "discriminator does not match";
    },
    {
      code: 6175;
      name: "RealizedOraclePriceTooFarOffClientProvided";
      msg: "realized oracle price too far off client provided";
    },
    {
      code: 6176;
      name: "VaultMintSupplyMustBeZeroIfEquityIsZero";
      msg: "vault mint supply must be zero if equity is zero";
    },
    {
      code: 6177;
      name: "InvalidSetupRebalanceEntropyState";
      msg: "invalid setup rebalance entropy state";
    }
  ];
};
export const VoltIDLJsonRaw = {
  version: "0.1.0",
  name: "volt",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "adminKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "seed",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "premiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "underlyingAssetMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "quoteAssetMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelistTokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelistTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "transferWindow",
          type: "u64",
        },
        {
          name: "bump",
          type: "u8",
        },
        {
          name: "bumpAuthority",
          type: "u8",
        },
        {
          name: "serumOrderSizeOptions",
          type: "u64",
        },
        {
          name: "serumOrderType",
          type: {
            defined: "OrderType",
          },
        },
        {
          name: "serumSelfTradeBehavior",
          type: {
            defined: "SelfTradeBehavior",
          },
        },
        {
          name: "expirationInterval",
          type: "u64",
        },
        {
          name: "upperBoundOtmStrikeFactor",
          type: "u64",
        },
        {
          name: "underlyingAmountPerContract",
          type: "u64",
        },
        {
          name: "vaultCapacity",
          type: "u64",
        },
        {
          name: "individualCapacity",
          type: "u64",
        },
      ],
    },
    {
      name: "changeCapacity",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "capacity",
          type: "u64",
        },
        {
          name: "individualCapacity",
          type: "u64",
        },
      ],
    },
    {
      name: "changeHedging",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "shouldHedge",
          type: "bool",
        },
      ],
    },
    {
      name: "setStrategyParams",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "targetLeverageRatio",
          type: "f64",
        },
        {
          name: "targetLeverageLenience",
          type: "f64",
        },
        {
          name: "targetHedgeRatio",
          type: "f64",
        },
        {
          name: "targetHedgeLenience",
          type: "f64",
        },
      ],
    },
    {
      name: "startRound",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "underlyingAssetMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "endRound",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeAcct",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "takePendingWithdrawalFees",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeAcct",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "claimPending",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userVaultTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositRoundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositRoundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "claimPendingWithdrawal",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "underlyingTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingWithdrawalRoundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingWithdrawalInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "cancelPendingWithdrawal",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingWithdrawalInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "cancelPendingDeposit",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "underlyingTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "deposit",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "daoAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authorityCheck",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelist",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenPool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingTokenSource",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyGroup",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyCache",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "depositAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "depositWithTransfer",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "daoAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "solTransferAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authorityCheck",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelist",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenPool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingTokenSource",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "depositAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "depositWithClaim",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "daoAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "solTransferAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authorityCheck",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelist",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenPool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingTokenSource",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositRoundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositRoundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "depositAmount",
          type: "u64",
        },
        {
          name: "doTransfer",
          type: "bool",
        },
      ],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "daoAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authorityCheck",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelist",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultTokenSource",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingWithdrawalInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeAcct",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "withdrawAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "rebalanceSettle",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "soloptionsProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "inertiaProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "premiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rawOptionMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "writerTokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingAssetMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "quoteAssetMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "quoteAssetPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingAssetPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeOwner",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "setNextOption",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "optionPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rawOptionMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "optionMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "writerTokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "openOrdersBump",
          type: "u8",
        },
        {
          name: "openOrdersInitBump",
          type: "u8",
        },
      ],
    },
    {
      name: "resetOptionMarket",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "inertiaProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rawOptionMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "underlyingAssetPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "backupOptionPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "backupWriterTokenPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "rebalancePrepare",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "inertiaProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "soloptionsProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rawOptionMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "underlyingAssetPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingAssetMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "optionMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "quoteAssetMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerTokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionProtocolFeeDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "rebalanceSwapPremium",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "market",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pcReferrerWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "srmReferralAcct",
          isMut: false,
          isSigner: false,
        },
        {
          name: "serumVaultSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "openOrders",
          isMut: true,
          isSigner: false,
        },
        {
          name: "openOrdersMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "marketBids",
          isMut: true,
          isSigner: false,
        },
        {
          name: "marketAsks",
          isMut: true,
          isSigner: false,
        },
        {
          name: "requestQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "eventQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "coinVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pcVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "clientOrderPrice",
          type: "u64",
        },
        {
          name: "clientOrderSize",
          type: "u64",
        },
        {
          name: "ulOpenOrdersBump",
          type: "u8",
        },
      ],
    },
    {
      name: "rebalanceEnter",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "middlewareProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rawOptionMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pcReferrerWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "serumVaultSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "srmReferralAcct",
          isMut: false,
          isSigner: false,
        },
        {
          name: "openOrders",
          isMut: true,
          isSigner: false,
        },
        {
          name: "market",
          isMut: true,
          isSigner: false,
        },
        {
          name: "serumMarketAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "requestQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "eventQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "marketBids",
          isMut: true,
          isSigner: false,
        },
        {
          name: "marketAsks",
          isMut: true,
          isSigner: false,
        },
        {
          name: "coinVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pcVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "whitelistTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "clientOrderPrice",
          type: "u64",
        },
        {
          name: "clientOrderSize",
          type: "u64",
        },
        {
          name: "clientOpenOrdersBump",
          type: "u8",
        },
        {
          name: "clientOpenOrdersInitBump",
          type: "u8",
        },
      ],
    },
    {
      name: "settleEnterFunds",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "middlewareProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "premiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pcReferrerWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "serumVaultSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "openOrders",
          isMut: true,
          isSigner: false,
        },
        {
          name: "market",
          isMut: true,
          isSigner: false,
        },
        {
          name: "serumMarketAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "coinVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pcVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "settlePermissionedMarketPremiumFunds",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "premiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rawOptionMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "writerTokenMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "settleSwapPremiumFunds",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tradingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pcReferrerWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "serumVaultSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "openOrders",
          isMut: true,
          isSigner: false,
        },
        {
          name: "market",
          isMut: true,
          isSigner: false,
        },
        {
          name: "coinVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pcVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initWhitelist",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "seed",
          isMut: true,
          isSigner: false,
        },
        {
          name: "whitelist",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "addWhitelist",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "whitelist",
          isMut: true,
          isSigner: false,
        },
        {
          name: "accountToAdd",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "removeWhitelist",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "whitelist",
          isMut: true,
          isSigner: false,
        },
        {
          name: "accountToRemove",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "attachWhitelist",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelist",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "attachDao",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "daoProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "daoAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "detachDao",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initializeEntropy",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "adminKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyGroup",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyCache",
          isMut: false,
          isSigner: false,
        },
        {
          name: "powerPerpMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "spotPerpMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "vaultName",
          type: "string",
        },
        {
          name: "bumpAuthority",
          type: "u8",
        },
        {
          name: "targetLeverageRatio",
          type: "f64",
        },
        {
          name: "targetLeverageLenience",
          type: "f64",
        },
        {
          name: "targetHedgeLenience",
          type: "f64",
        },
        {
          name: "exitEarlyRatio",
          type: "f64",
        },
        {
          name: "vaultCapacity",
          type: "u64",
        },
        {
          name: "individualCapacity",
          type: "u64",
        },
        {
          name: "shouldHedge",
          type: "bool",
        },
      ],
    },
    {
      name: "takePerformanceFeesEntropy",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyRound",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyGroup",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyCache",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rootBank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeBank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: false,
          isSigner: false,
        },
        {
          name: "feeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "startRoundEntropy",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "underlyingAssetMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals",
          isMut: true,
          isSigner: false,
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyRound",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyGroup",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyCache",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "endRoundEntropy",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyRound",
          isMut: true,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyGroup",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyCache",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rootBank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeBank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "setupRebalanceEntropy",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundVoltTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundUnderlyingTokensForPendingWithdrawals",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyRound",
          isMut: true,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyGroup",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyCache",
          isMut: true,
          isSigner: false,
        },
        {
          name: "powerPerpMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "spotPerpMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rootBank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeBank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "expectedOraclePx",
          type: "f64",
        },
      ],
    },
    {
      name: "rebalanceEntropy",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "extraVoltData",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyRound",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyGroup",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyCache",
          isMut: true,
          isSigner: false,
        },
        {
          name: "powerPerpMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rootBank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nodeBank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "eventQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "powerPerpEventQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bids",
          isMut: true,
          isSigner: false,
        },
        {
          name: "asks",
          isMut: true,
          isSigner: false,
        },
        {
          name: "spotPerpMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "clientBidPrice",
          type: "u64",
        },
        {
          name: "clientAskPrice",
          type: "u64",
        },
      ],
    },
    {
      name: "initSerumMarket",
      accounts: [
        {
          name: "userAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "whitelist",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "serumMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pcMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "optionMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "requestQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "eventQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bids",
          isMut: true,
          isSigner: false,
        },
        {
          name: "asks",
          isMut: true,
          isSigner: false,
        },
        {
          name: "coinVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pcVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "marketAuthority",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "marketSpace",
          type: "u64",
        },
        {
          name: "vaultSignerNonce",
          type: "u64",
        },
        {
          name: "coinLotSize",
          type: "u64",
        },
        {
          name: "pcLotSize",
          type: "u64",
        },
        {
          name: "pcDustThreshold",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "Whitelist",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "addresses",
            type: {
              vec: "publicKey",
            },
          },
        ],
      },
    },
    {
      name: "PendingDeposit",
      type: {
        kind: "struct",
        fields: [
          {
            name: "initialized",
            type: "bool",
          },
          {
            name: "roundNumber",
            type: "u64",
          },
          {
            name: "numUnderlyingDeposited",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "PendingWithdrawal",
      type: {
        kind: "struct",
        fields: [
          {
            name: "initialized",
            type: "bool",
          },
          {
            name: "roundNumber",
            type: "u64",
          },
          {
            name: "numVoltRedeemed",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UlOpenOrdersMetadata",
      type: {
        kind: "struct",
        fields: [
          {
            name: "initialized",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "EntropyRound",
      type: {
        kind: "struct",
        fields: [
          {
            name: "instantDepositsNative",
            type: "u64",
          },
          {
            name: "prevEntropyAccountDeposits",
            type: "u64",
          },
          {
            name: "initialEquity",
            type: "f64",
          },
          {
            name: "newEquityPostDeposit",
            type: "f64",
          },
          {
            name: "depositAmt",
            type: "f64",
          },
          {
            name: "withdrawCompFromDeposit",
            type: "u64",
          },
          {
            name: "netDeposits",
            type: "f64",
          },
          {
            name: "depositAmtNative",
            type: "u64",
          },
          {
            name: "withdrawAmtNative",
            type: "u64",
          },
          {
            name: "totalVoltSupply",
            type: "u64",
          },
          {
            name: "oraclePrice",
            type: "f64",
          },
          {
            name: "acctEquityStart",
            type: "f64",
          },
          {
            name: "acctEquityBeforeNextRebalance",
            type: "f64",
          },
          {
            name: "pnlQuote",
            type: "f64",
          },
          {
            name: "performanceFeesQuote",
            type: "f64",
          },
          {
            name: "temp1",
            type: "publicKey",
          },
          {
            name: "temp2",
            type: "publicKey",
          },
          {
            name: "temp3",
            type: "publicKey",
          },
          {
            name: "extraKey11",
            type: "publicKey",
          },
          {
            name: "extraKey12",
            type: "publicKey",
          },
          {
            name: "unusedUintFour",
            type: "u64",
          },
          {
            name: "unusedUintFive",
            type: "u64",
          },
          {
            name: "unusedUintSix",
            type: "u64",
          },
          {
            name: "unusedUint12",
            type: "u64",
          },
          {
            name: "unusedFloat1",
            type: "f64",
          },
          {
            name: "unusedFloat2",
            type: "f64",
          },
          {
            name: "unusedFloat3",
            type: "f64",
          },
          {
            name: "unusedFloat4",
            type: "f64",
          },
          {
            name: "unusedBoolOne",
            type: "bool",
          },
          {
            name: "unusedBoolTwo",
            type: "bool",
          },
          {
            name: "unusedBoolThree",
            type: "bool",
          },
          {
            name: "unusedBoolFour",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "Round",
      type: {
        kind: "struct",
        fields: [
          {
            name: "number",
            type: "u64",
          },
          {
            name: "underlyingFromPendingDeposits",
            type: "u64",
          },
          {
            name: "voltTokensFromPendingWithdrawals",
            type: "u64",
          },
          {
            name: "underlyingPreEnter",
            type: "u64",
          },
          {
            name: "underlyingPostSettle",
            type: "u64",
          },
          {
            name: "premiumFarmed",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FriktionEpochInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "vaultTokenPrice",
            type: "f64",
          },
          {
            name: "pctPnl",
            type: "f64",
          },
          {
            name: "number",
            type: "u64",
          },
          {
            name: "underlyingPreEnter",
            type: "u64",
          },
          {
            name: "underlyingPostSettle",
            type: "u64",
          },
          {
            name: "voltTokenSupply",
            type: "u64",
          },
          {
            name: "pnl",
            type: "i64",
          },
          {
            name: "performanceFees",
            type: "u64",
          },
          {
            name: "withdrawalFees",
            type: "u64",
          },
          {
            name: "pendingDeposits",
            type: "u64",
          },
          {
            name: "pendingWithdrawalsVoltTokens",
            type: "u64",
          },
          {
            name: "pendingWithdrawals",
            type: "u64",
          },
          {
            name: "canceledWithdrawals",
            type: "u64",
          },
          {
            name: "canceledDeposits",
            type: "u64",
          },
          {
            name: "totalWithdrawals",
            type: "u64",
          },
          {
            name: "totalDeposits",
            type: "u64",
          },
          {
            name: "instantDeposits",
            type: "u64",
          },
          {
            name: "instantWithdrawals",
            type: "u64",
          },
          {
            name: "daoDeposits",
            type: "u64",
          },
          {
            name: "mintedOptions",
            type: "u64",
          },
          {
            name: "enterNumTimesCalled",
            type: "u64",
          },
          {
            name: "swapPremiumNumTimesCalled",
            type: "u64",
          },
          {
            name: "optionKey",
            type: "publicKey",
          },
          {
            name: "extraKeyFour",
            type: "publicKey",
          },
          {
            name: "extraKey5",
            type: "publicKey",
          },
          {
            name: "extraKey6",
            type: "publicKey",
          },
          {
            name: "extraKey7",
            type: "publicKey",
          },
          {
            name: "extraKey8",
            type: "publicKey",
          },
          {
            name: "extraKey9",
            type: "publicKey",
          },
          {
            name: "extraKey10",
            type: "publicKey",
          },
          {
            name: "extraKey11",
            type: "publicKey",
          },
          {
            name: "extraKey12",
            type: "publicKey",
          },
          {
            name: "unusedUintFour",
            type: "u64",
          },
          {
            name: "unusedUintFive",
            type: "u64",
          },
          {
            name: "unusedUintSix",
            type: "u64",
          },
          {
            name: "unusedUint7",
            type: "u64",
          },
          {
            name: "unusedUint8",
            type: "u64",
          },
          {
            name: "unusedUint9",
            type: "u64",
          },
          {
            name: "unusedUint10",
            type: "u64",
          },
          {
            name: "unusedUint11",
            type: "u64",
          },
          {
            name: "unusedUint12",
            type: "u64",
          },
          {
            name: "unusedBoolOne",
            type: "bool",
          },
          {
            name: "unusedBoolTwo",
            type: "bool",
          },
          {
            name: "unusedBoolThree",
            type: "bool",
          },
          {
            name: "unusedBoolFour",
            type: "bool",
          },
          {
            name: "unusedBoolFive",
            type: "bool",
          },
          {
            name: "unusedBoolSix",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "EntropyMetadata",
      type: {
        kind: "struct",
        fields: [
          {
            name: "targetHedgeRatio",
            type: "f64",
          },
          {
            name: "rebalancingLenience",
            type: "f64",
          },
          {
            name: "requiredBasisFromOracle",
            type: "f64",
          },
          {
            name: "extraKey3",
            type: "publicKey",
          },
          {
            name: "extraKey4",
            type: "publicKey",
          },
          {
            name: "extraKey5",
            type: "publicKey",
          },
          {
            name: "extraKey6",
            type: "publicKey",
          },
          {
            name: "extraKey7",
            type: "publicKey",
          },
          {
            name: "extraKey8",
            type: "publicKey",
          },
          {
            name: "extraKey9",
            type: "publicKey",
          },
          {
            name: "extraKey10",
            type: "publicKey",
          },
          {
            name: "extraKey11",
            type: "publicKey",
          },
          {
            name: "extraKey12",
            type: "publicKey",
          },
          {
            name: "unusedUintFour",
            type: "u64",
          },
          {
            name: "unusedUintFive",
            type: "u64",
          },
          {
            name: "unusedUintSix",
            type: "u64",
          },
          {
            name: "unusedUint12",
            type: "u64",
          },
          {
            name: "unusedUint123",
            type: "u64",
          },
          {
            name: "unusedUint456",
            type: "u64",
          },
          {
            name: "unusedUint789",
            type: "u64",
          },
          {
            name: "unusedUint102",
            type: "u64",
          },
          {
            name: "unusedFloat1",
            type: "f64",
          },
          {
            name: "unusedFloat2",
            type: "f64",
          },
          {
            name: "unusedFloat3",
            type: "f64",
          },
          {
            name: "unusedFloat4",
            type: "f64",
          },
          {
            name: "unusedFloat5",
            type: "f64",
          },
          {
            name: "unusedFloat6",
            type: "f64",
          },
          {
            name: "unusedFloat7",
            type: "f64",
          },
          {
            name: "unusedFloat8",
            type: "f64",
          },
          {
            name: "unusedFloat9",
            type: "f64",
          },
          {
            name: "unusedFloat10",
            type: "f64",
          },
          {
            name: "unusedFloat11",
            type: "f64",
          },
          {
            name: "unusedFloat12",
            type: "f64",
          },
          {
            name: "unusedBoolOne",
            type: "bool",
          },
          {
            name: "unusedBoolTwo",
            type: "bool",
          },
          {
            name: "unusedBoolThree",
            type: "bool",
          },
          {
            name: "unusedBoolFour",
            type: "bool",
          },
          {
            name: "unusedBoolFive",
            type: "bool",
          },
          {
            name: "unusedBoolSix",
            type: "bool",
          },
          {
            name: "unusedBoolSeven",
            type: "bool",
          },
          {
            name: "unusedBoolEight",
            type: "bool",
          },
          {
            name: "unusedBoolNine",
            type: "bool",
          },
          {
            name: "unusedBoolTen",
            type: "bool",
          },
          {
            name: "vaultName",
            type: "string",
          },
        ],
      },
    },
    {
      name: "ExtraVoltData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isWhitelisted",
            type: "bool",
          },
          {
            name: "whitelist",
            type: "publicKey",
          },
          {
            name: "isForDao",
            type: "bool",
          },
          {
            name: "daoProgramId",
            type: "publicKey",
          },
          {
            name: "depositMint",
            type: "publicKey",
          },
          {
            name: "targetLeverage",
            type: "f64",
          },
          {
            name: "targetLeverageLenience",
            type: "f64",
          },
          {
            name: "exitEarlyRatio",
            type: "f64",
          },
          {
            name: "entropyProgramId",
            type: "publicKey",
          },
          {
            name: "entropyGroup",
            type: "publicKey",
          },
          {
            name: "entropyAccount",
            type: "publicKey",
          },
          {
            name: "powerPerpMarket",
            type: "publicKey",
          },
          {
            name: "haveResolvedDeposits",
            type: "bool",
          },
          {
            name: "doneRebalancing",
            type: "bool",
          },
          {
            name: "daoAuthority",
            type: "publicKey",
          },
          {
            name: "serumProgramId",
            type: "publicKey",
          },
          {
            name: "entropyCache",
            type: "publicKey",
          },
          {
            name: "spotPerpMarket",
            type: "publicKey",
          },
          {
            name: "extraKey7",
            type: "publicKey",
          },
          {
            name: "extraKey8",
            type: "publicKey",
          },
          {
            name: "extraKey9",
            type: "publicKey",
          },
          {
            name: "extraKey10",
            type: "publicKey",
          },
          {
            name: "extraKey11",
            type: "publicKey",
          },
          {
            name: "extraKey12",
            type: "publicKey",
          },
          {
            name: "extraKey13",
            type: "publicKey",
          },
          {
            name: "extraKey14",
            type: "publicKey",
          },
          {
            name: "netWithdrawals",
            type: "u64",
          },
          {
            name: "maxQuotePosChange",
            type: "u64",
          },
          {
            name: "targetHedgeLenience",
            type: "f64",
          },
          {
            name: "unusedUintFour",
            type: "u64",
          },
          {
            name: "unusedUintFive",
            type: "u64",
          },
          {
            name: "unusedUintSix",
            type: "u64",
          },
          {
            name: "unusedUint7",
            type: "u64",
          },
          {
            name: "unusedUint8",
            type: "u64",
          },
          {
            name: "unusedUint9",
            type: "u64",
          },
          {
            name: "unusedUint10",
            type: "u64",
          },
          {
            name: "unusedUint11",
            type: "u64",
          },
          {
            name: "unusedUint12",
            type: "u64",
          },
          {
            name: "turnOffDepositsAndWithdrawals",
            type: "bool",
          },
          {
            name: "rebalanceIsReady",
            type: "bool",
          },
          {
            name: "unusedBool1234",
            type: "bool",
          },
          {
            name: "doneRebalancingPowerPerp",
            type: "bool",
          },
          {
            name: "isHedgingOn",
            type: "bool",
          },
          {
            name: "haveTakenPerformanceFees",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "VoltVault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "adminKey",
            type: "publicKey",
          },
          {
            name: "seed",
            type: "publicKey",
          },
          {
            name: "transferWindow",
            type: "u64",
          },
          {
            name: "startTransferTime",
            type: "u64",
          },
          {
            name: "endTransferTime",
            type: "u64",
          },
          {
            name: "initialized",
            type: "bool",
          },
          {
            name: "currOptionWasSettled",
            type: "bool",
          },
          {
            name: "mustSwapPremiumToUnderlying",
            type: "bool",
          },
          {
            name: "nextOptionWasSet",
            type: "bool",
          },
          {
            name: "firstEverOptionWasSet",
            type: "bool",
          },
          {
            name: "instantTransfersEnabled",
            type: "bool",
          },
          {
            name: "prepareIsFinished",
            type: "bool",
          },
          {
            name: "enterIsFinished",
            type: "bool",
          },
          {
            name: "roundHasStarted",
            type: "bool",
          },
          {
            name: "roundNumber",
            type: "u64",
          },
          {
            name: "totalUnderlyingPreEnter",
            type: "u64",
          },
          {
            name: "totalUnderlyingPostSettle",
            type: "u64",
          },
          {
            name: "totalVoltTokensPostSettle",
            type: "u64",
          },
          {
            name: "vaultAuthority",
            type: "publicKey",
          },
          {
            name: "depositPool",
            type: "publicKey",
          },
          {
            name: "premiumPool",
            type: "publicKey",
          },
          {
            name: "optionPool",
            type: "publicKey",
          },
          {
            name: "writerTokenPool",
            type: "publicKey",
          },
          {
            name: "vaultMint",
            type: "publicKey",
          },
          {
            name: "underlyingAssetMint",
            type: "publicKey",
          },
          {
            name: "quoteAssetMint",
            type: "publicKey",
          },
          {
            name: "optionMint",
            type: "publicKey",
          },
          {
            name: "writerTokenMint",
            type: "publicKey",
          },
          {
            name: "optionMarket",
            type: "publicKey",
          },
          {
            name: "vaultType",
            type: "u64",
          },
          {
            name: "underlyingAmountPerContract",
            type: "u64",
          },
          {
            name: "quoteAmountPerContract",
            type: "u64",
          },
          {
            name: "expirationUnixTimestamp",
            type: "i64",
          },
          {
            name: "expirationInterval",
            type: "u64",
          },
          {
            name: "upperBoundOtmStrikeFactor",
            type: "u64",
          },
          {
            name: "haveTakenWithdrawalFees",
            type: "bool",
          },
          {
            name: "serumSpotMarket",
            type: "publicKey",
          },
          {
            name: "openOrdersBump",
            type: "u8",
          },
          {
            name: "openOrdersInitBump",
            type: "u8",
          },
          {
            name: "ulOpenOrdersBump",
            type: "u8",
          },
          {
            name: "ulOpenOrders",
            type: "publicKey",
          },
          {
            name: "ulOpenOrdersInitialized",
            type: "bool",
          },
          {
            name: "bumpAuthority",
            type: "u8",
          },
          {
            name: "serumOrderSizeOptions",
            type: "u64",
          },
          {
            name: "individualCapacity",
            type: "u64",
          },
          {
            name: "serumOrderType",
            type: "u64",
          },
          {
            name: "serumLimit",
            type: "u16",
          },
          {
            name: "serumSelfTradeBehavior",
            type: "u16",
          },
          {
            name: "serumClientOrderId",
            type: "u64",
          },
          {
            name: "whitelistTokenMint",
            type: "publicKey",
          },
          {
            name: "permissionedMarketPremiumMint",
            type: "publicKey",
          },
          {
            name: "permissionedMarketPremiumPool",
            type: "publicKey",
          },
          {
            name: "capacity",
            type: "u64",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "OptionsProtocol",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Soloptions",
          },
          {
            name: "Inertia",
          },
        ],
      },
    },
    {
      name: "SelfTradeBehavior",
      type: {
        kind: "enum",
        variants: [
          {
            name: "DecrementTake",
          },
          {
            name: "CancelProvide",
          },
          {
            name: "AbortTransaction",
          },
        ],
      },
    },
    {
      name: "OrderType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Limit",
          },
          {
            name: "ImmediateOrCancel",
          },
          {
            name: "PostOnly",
          },
        ],
      },
    },
    {
      name: "NewSide",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Bid",
          },
          {
            name: "Ask",
          },
        ],
      },
    },
    {
      name: "VoltType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "ShortOptions",
          },
          {
            name: "Entropy",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "ExpirationIsInThePast",
      msg: "Expiration must be in the future",
    },
    {
      code: 6001,
      name: "QuoteAndUnderlyingAssetMustDiffer",
      msg: "Same quote and underlying asset, cannot create market",
    },
    {
      code: 6002,
      name: "QuoteOrUnderlyingAmountCannotBe0",
      msg: "Quote amount and underlying amount per contract must be > 0",
    },
    {
      code: 6003,
      name: "OptionMarketMustBeMintAuthority",
      msg: "OptionMarket must be the mint authority",
    },
    {
      code: 6004,
      name: "OptionMarketMustOwnUnderlyingAssetPool",
      msg: "OptionMarket must own the underlying asset pool",
    },
    {
      code: 6005,
      name: "OptionMarketMustOwnQuoteAssetPool",
      msg: "OptionMarket must own the quote asset pool",
    },
    {
      code: 6006,
      name: "ExpectedSPLTokenProgramId",
      msg: "Stop trying to spoof the SPL Token program! Shame on you",
    },
    {
      code: 6007,
      name: "MintFeeMustBeOwnedByFeeOwner",
      msg: "Mint fee account must be owned by the FEE_OWNER",
    },
    {
      code: 6008,
      name: "ExerciseFeeMustBeOwnedByFeeOwner",
      msg: "Exercise fee account must be owned by the FEE_OWNER",
    },
    {
      code: 6009,
      name: "MintFeeTokenMustMatchUnderlyingAsset",
      msg: "Mint fee token must be the same as the underlying asset",
    },
    {
      code: 6010,
      name: "ExerciseFeeTokenMustMatchQuoteAsset",
      msg: "Exercise fee token must be the same as the quote asset",
    },
    {
      code: 6011,
      name: "OptionMarketExpiredCantMint",
      msg: "OptionMarket is expired, can't mint",
    },
    {
      code: 6012,
      name: "UnderlyingPoolAccountDoesNotMatchMarket",
      msg: "Underlying pool account does not match the value on the OptionMarket",
    },
    {
      code: 6013,
      name: "OptionTokenMintDoesNotMatchMarket",
      msg: "OptionToken mint does not match the value on the OptionMarket",
    },
    {
      code: 6014,
      name: "WriterTokenMintDoesNotMatchMarket",
      msg: "WriterToken mint does not match the value on the OptionMarket",
    },
    {
      code: 6015,
      name: "MintFeeKeyDoesNotMatchOptionMarket",
      msg: "MintFee key does not match the value on the OptionMarket",
    },
    {
      code: 6016,
      name: "SizeCantBeLessThanEqZero",
      msg: "The size argument must be > 0",
    },
    {
      code: 6017,
      name: "ExerciseFeeKeyDoesNotMatchOptionMarket",
      msg: "exerciseFee key does not match the value on the OptionMarket",
    },
    {
      code: 6018,
      name: "QuotePoolAccountDoesNotMatchMarket",
      msg: "Quote pool account does not match the value on the OptionMarket",
    },
    {
      code: 6019,
      name: "UnderlyingDestMintDoesNotMatchUnderlyingAsset",
      msg: "Underlying destination mint must match underlying asset mint address",
    },
    {
      code: 6020,
      name: "FeeOwnerDoesNotMatchProgram",
      msg: "Fee owner does not match the program's fee owner",
    },
    {
      code: 6021,
      name: "OptionMarketExpiredCantExercise",
      msg: "OptionMarket is expired, can't exercise",
    },
    {
      code: 6022,
      name: "OptionMarketNotExpiredCantClose",
      msg: "OptionMarket has not expired, can't close",
    },
    {
      code: 6023,
      name: "NotEnoughQuoteAssetsInPool",
      msg: "Not enough assets in the quote asset pool",
    },
    {
      code: 6024,
      name: "InvalidAuth",
      msg: "Invalid auth token provided",
    },
    {
      code: 6025,
      name: "CoinMintIsNotOptionMint",
      msg: "Coin mint must match option mint",
    },
    {
      code: 6026,
      name: "CannotPruneActiveMarket",
      msg: "Cannot prune the market while it's still active",
    },
    {
      code: 6027,
      name: "NumberOverflow",
      msg: "Numerical overflow",
    },
    {
      code: 6028,
      name: "InvalidOrderType",
      msg: "Invalid order type",
    },
    {
      code: 6029,
      name: "InvalidSelfTradeBehavior",
      msg: "Invalid self trade behavior",
    },
    {
      code: 6030,
      name: "Unauthorized",
      msg: "Unauthorized.",
    },
    {
      code: 6031,
      name: "InsufficientCollateralForWriting",
      msg: "Insufficient collateral to write options.",
    },
    {
      code: 6032,
      name: "InsufficientVaultTokens",
      msg: "Insufficient Vault tokens to redeem.",
    },
    {
      code: 6033,
      name: "ContractExpired",
      msg: "Options contract is expired.",
    },
    {
      code: 6034,
      name: "ContractNotYetExpired",
      msg: "Cannot redeem until contract expiry.",
    },
    {
      code: 6035,
      name: "InvalidMintAmount",
      msg: "mint amount was 0, skipping mint_helper()...",
    },
    {
      code: 6036,
      name: "InvalidRebalanceExitTime",
      msg: "invalid time to exit position rebalanceExit()",
    },
    {
      code: 6037,
      name: "InvalidRebalanceEntryTime",
      msg: "invalid time to enter position rebalanceEnter()",
    },
    {
      code: 6038,
      name: "InvalidRebalancePrepareTime",
      msg: "invalid time to call rebalancePrepare()",
    },
    {
      code: 6039,
      name: "InvalidWithdrawalTime",
      msg: "invalid time to withdraw",
    },
    {
      code: 6040,
      name: "InvalidDepositTime",
      msg: "invalid time to deposit",
    },
    {
      code: 6041,
      name: "InvalidSetNextOptionTime",
      msg: "invalid time to set next option",
    },
    {
      code: 6042,
      name: "InvalidDepositAmount",
      msg: "invalid deposit amount",
    },
    {
      code: 6043,
      name: "InvalidRebalanceSettleTime",
      msg: "invalid rebalance settle time",
    },
    {
      code: 6044,
      name: "InvalidRebalanceSettleState",
      msg: "invalid rebalance settle state",
    },
    {
      code: 6045,
      name: "InvalidRebalanceEnterState",
      msg: "invalid rebalance enter state",
    },
    {
      code: 6046,
      name: "OptionsPositionNotSettled",
      msg: "options position not settled, must be before withdrawal",
    },
    {
      code: 6047,
      name: "NonUnderlyingPoolsHaveAssets",
      msg: "non underlying pools have assets when attempting withdraw",
    },
    {
      code: 6048,
      name: "VaultAuthorityMustBeVaultMintAuthority",
      msg: "volt must be vault mint authority",
    },
    {
      code: 6049,
      name: "VaultAuthorityMustOwnDepositPool",
      msg: "volt must own deposit pool",
    },
    {
      code: 6050,
      name: "VaultAuthorityMustOwnPremiumPool",
      msg: "volt must own premium pool",
    },
    {
      code: 6051,
      name: "VoltVaulttMustOwnWriterTokenPool",
      msg: "volt must own writer token pool",
    },
    {
      code: 6052,
      name: "VoltVaultMustOwnOptionPool",
      msg: "volt must own option pool",
    },
    {
      code: 6053,
      name: "DepositPoolDoesNotMatchVoltVault",
      msg: "DepositPoolDoesNotMatchVoltVault",
    },
    {
      code: 6054,
      name: "OptionPoolDoesNotMatchVoltVault",
      msg: "OptionPoolDoesNotMatchVoltVault",
    },
    {
      code: 6055,
      name: "PremiumPoolDoesNotMatchVoltVault",
      msg: "PremiumPoolDoesNotMatchVoltVault",
    },
    {
      code: 6056,
      name: "TraidngPoolDoesNotMatchVoltVault",
      msg: "TradingPoolDoesNotMatchVoltVault",
    },
    {
      code: 6057,
      name: "OptionMintDoesNotMatchOptionMarket",
      msg: "option mint does not match option market",
    },
    {
      code: 6058,
      name: "NoOrdersInOptionOrderBook",
      msg: "NoBidsInOptionOrderBook",
    },
    {
      code: 6059,
      name: "CpiProgramMustBeSomeInPlaceOrder",
      msg: "cpi program must be Some in place order",
    },
    {
      code: 6060,
      name: "NewOptionMustNotBeExpired",
      msg: "new option must not be expired",
    },
    {
      code: 6061,
      name: "NewOptionMustHaveExactExpiry",
      msg: "new option has roughly target expiry (within lower/upper bounds)",
    },
    {
      code: 6062,
      name: "NewOptionHasWrongUnderlyingAsset",
      msg: "new option has wrong underlying asset",
    },
    {
      code: 6063,
      name: "NewOptionHasWrongQuoteAsset",
      msg: "new option has wrong quote asset",
    },
    {
      code: 6064,
      name: "NewOptionHasWrongContractSize",
      msg: "new option has wrong contract size",
    },
    {
      code: 6065,
      name: "NewOptionHasInvalidStrike",
      msg: "new option has invalid strike",
    },
    {
      code: 6066,
      name: "RebalanceSettleHasLeftoverWriterTokens",
      msg: "rebalance settle has leftover writer tokens",
    },
    {
      code: 6067,
      name: "CurrentOptionMustNotBeExpired",
      msg: "current option must not be expired",
    },
    {
      code: 6068,
      name: "CannotReinitializeVolt",
      msg: "cannot reinitialize an (already initialized) volt",
    },
    {
      code: 6069,
      name: "OldOptionAndWriterTokenPoolsMustBeEmpty",
      msg: "cannot reinitialize an (already initialized) volt",
    },
    {
      code: 6070,
      name: "InvalidOldOptionWriterTokenPools",
      msg: "invalid old option writer token pools",
    },
    {
      code: 6071,
      name: "VaultMintDoesNotMatchUserTokenAccount",
      msg: "vault mint does not match user token account",
    },
    {
      code: 6072,
      name: "DepositPoolMintDoesNotMatchUserTokenAccount",
      msg: "deposit pool mint does not match user token account",
    },
    {
      code: 6073,
      name: "VaultAuthorityDoesNotMatch",
      msg: "vault authority does not match",
    },
    {
      code: 6074,
      name: "DexProgramIdDoesNotMatchAnchor",
      msg: "DEX program id does not match",
    },
    {
      code: 6075,
      name: "InertiaProgramIdDoesNotMatch",
      msg: "Inertia program id does not match",
    },
    {
      code: 6076,
      name: "InvalidAuthorityForPermissionedInstruction",
      msg: "Invalid authority for permissioned instruction",
    },
    {
      code: 6077,
      name: "WriterTokenMintDoesNotMatchOptionMarket",
      msg: "writer token mint does not match option market",
    },
    {
      code: 6078,
      name: "OptionMarketMustBeOwnedByProtocol",
      msg: "option market should be owned by protocol (e.g inertia)",
    },
    {
      code: 6079,
      name: "UnderlyingAssetMintDoesNotMatchVoltVault",
      msg: "underlying asset mint does not match voltvault",
    },
    {
      code: 6080,
      name: "QuoteAssetMintDoesNotMatchVoltVault",
      msg: "quote asset mint does not match voltvault",
    },
    {
      code: 6081,
      name: "VaultMintDoesNotMatchVoltVault",
      msg: "vault mint does not match volt vault",
    },
    {
      code: 6082,
      name: "OptionMarketDoesNotMatchVoltVault",
      msg: "option market does not match volt vault",
    },
    {
      code: 6083,
      name: "WriterTokenPoolDoesNotMatchVoltVault",
      msg: "writer token pool does not match volt vault",
    },
    {
      code: 6084,
      name: "InvalidRebalanceSwapPremiumState",
      msg: "invalid rebalance swap premium state",
    },
    {
      code: 6085,
      name: "ShouldBeUnreachable",
      msg: "should be unreachable code",
    },
    {
      code: 6086,
      name: "CantHaveMultiplePendingDeposits",
      msg: "shouldn't have multiple pending deposits",
    },
    {
      code: 6087,
      name: "InvalidStartRoundState",
      msg: "invalid start round state",
    },
    {
      code: 6088,
      name: "InvalidSetNextOptionState",
      msg: "invalid set next option state",
    },
    {
      code: 6089,
      name: "InvalidClaimPendingState",
      msg: "invalid claim pending state",
    },
    {
      code: 6090,
      name: "InvalidEndRoundState",
      msg: "invalid end round state",
    },
    {
      code: 6091,
      name: "CantHaveMultiplePendingWithdrawals",
      msg: "shouldn't have multiple pending deposits",
    },
    {
      code: 6092,
      name: "InvalidClaimPendingWithdrawalState",
      msg: "invalid claim pending withdrawal state",
    },
    {
      code: 6093,
      name: "InvalidNextOptionMarket",
      msg: "invalid next option market",
    },
    {
      code: 6094,
      name: "TokenNotRevoked",
      msg: "Auth token not revoked",
    },
    {
      code: 6095,
      name: "NonWhitelistedUser",
      msg: "user is not whitelisted",
    },
    {
      code: 6096,
      name: "UserIsNotSigner",
      msg: "user is not signer",
    },
    {
      code: 6097,
      name: "InvalidWhitelistAuthority",
      msg: "authority does not match whitelist admin",
    },
    {
      code: 6098,
      name: "InvalidWhitelistAndOptionMarketCombination",
      msg: "whitelist and option market do not generate correct PDA",
    },
    {
      code: 6099,
      name: "RoundVoltTokensMintDoesNotMatchVoltVault",
      msg: "round volt tokens mint does not match volt vault",
    },
    {
      code: 6100,
      name: "RoundUnderlyingTokensMintDoesNotMatchVoltVault",
      msg: "round underlying tokens mint does not match volt vault",
    },
    {
      code: 6101,
      name: "UnderlyingAssetPoolDoesNotMatchOptionMarket",
      msg: "UnderlyingAssetPoolDoesNotMatchOptionMarket",
    },
    {
      code: 6102,
      name: "NoOppositeOrderOnSerumMarket",
      msg: "no opposite order on serum market",
    },
    {
      code: 6103,
      name: "BidPriceOnSerumMarketTooLow",
      msg: "bid price on serum market too low",
    },
    {
      code: 6104,
      name: "OfferPriceOnSerumMarketTooHigh",
      msg: "offer price on serum market too high",
    },
    {
      code: 6105,
      name: "UnderlyingOpenOrdersDoesNotMatchVoltVault",
      msg: "underlying open orders does not match volt vault",
    },
    {
      code: 6106,
      name: "MustHaveAtLeastOneMarketMakerAccessToken",
      msg: "must have at least one market maker access token",
    },
    {
      code: 6107,
      name: "MiddlewareProgramIdDoesNotMatch",
      msg: "middleware program id does not match expected",
    },
    {
      code: 6108,
      name: "FeeAccountOwnerDoesNotMatch",
      msg: "fee account owner does not match expected",
    },
    {
      code: 6109,
      name: "FeeAccountMintDoesNotMatchDepositPool",
      msg: "fee account mint does not match deposit pool",
    },
    {
      code: 6110,
      name: "VaultCapacityWouldBeExceeded",
      msg: "vault capacity would be exceeded",
    },
    {
      code: 6111,
      name: "IndividualDepositCapacityWouldBeExceeded",
      msg: "individual deposit capacity would be exceeded",
    },
    {
      code: 6112,
      name: "UnsupportedOptionMarketProgramId",
      msg: "unsupported option market program ID",
    },
    {
      code: 6113,
      name: "InvalidEndDcaRoundState",
      msg: "invalid end dca round state",
    },
    {
      code: 6114,
      name: "RoundHasNotStarted",
      msg: "round has not started",
    },
    {
      code: 6115,
      name: "PermissionedMarketPremiumPoolDoesNotMatchVoltVault",
      msg: "permissioned makret premium pool does not match volt",
    },
    {
      code: 6116,
      name: "TokenAccountOwnersDoNotMatch",
      msg: "token account owners do not match",
    },
    {
      code: 6117,
      name: "InvalidPermissionedMarketPremiumMint",
      msg: "invalid permissioned market premium mint",
    },
    {
      code: 6118,
      name: "PremiumPoolAmountMustBeGreaterThanZero",
      msg: "premium pool amount must be greater than zero",
    },
    {
      code: 6119,
      name: "CantCloseNonEmptyTokenAccount",
      msg: "can't close non empty token account",
    },
    {
      code: 6120,
      name: "MustFinishEnteringBeforeSettlingPermissionedMarketPremium",
      msg: "must finish entering before settling permissioned market premium funds",
    },
    {
      code: 6121,
      name: "PendingWithdrawalInfoNotInitialized",
      msg: "pending withdrawal info must be initialized",
    },
    {
      code: 6122,
      name: "PendingWithdrawalDoesNotExist",
      msg: "pending withdrawal does not exist",
    },
    {
      code: 6123,
      name: "CannotCancelPendingWithdrawalFromOldRound",
      msg: "cannot cancel pending withdrawal from old round",
    },
    {
      code: 6124,
      name: "InvalidTakePendingWithdrawalFeesState",
      msg: "invalid take pending withdrawal fees state",
    },
    {
      code: 6125,
      name: "PendingDepositInfoNotInitialized",
      msg: "pending deposit info not initialized",
    },
    {
      code: 6126,
      name: "PendingDepositDoesNotExist",
      msg: "pending deposits does not exist",
    },
    {
      code: 6127,
      name: "CannotCancelPendingDepositFromOldRound",
      msg: "cannot cancel pending deposit from old round",
    },
    {
      code: 6128,
      name: "VaultDestinationDoesNotMatchVoltVault",
      msg: "vault destination does not match volt vault",
    },
    {
      code: 6129,
      name: "MustTakeWithdrawalFeesBeforeStartingRound",
      msg: "must take withdrawal fees before starting round",
    },
    {
      code: 6130,
      name: "RoundMustBeEnded",
      msg: "round must be ended",
    },
    {
      code: 6131,
      name: "MustNotHaveSoldOptionTokens",
      msg: "must not have sold option tokens to reset",
    },
    {
      code: 6132,
      name: "CantCloseAccountUnlessEmpty",
      msg: "cannot close account unless empty",
    },
    {
      code: 6133,
      name: "OpenOrderMustBeEmptyToClose",
      msg: "open orders must be empty to close",
    },
    {
      code: 6134,
      name: "InvalidWhitelistAccountVector",
      msg: "invalid whitelist account (vector)",
    },
    {
      code: 6135,
      name: "InvalidDaoProgramId",
      msg: "invalid dao program ID",
    },
    {
      code: 6136,
      name: "VoltMustBeForDao",
      msg: "volt must be for dao",
    },
    {
      code: 6137,
      name: "InvalidDaoAuthority",
      msg: "invalid dao authority",
    },
    {
      code: 6138,
      name: "DaoAuthorityMustSign",
      msg: "dao authority must sign",
    },
    {
      code: 6139,
      name: "InvalidPendingDepositKey",
      msg: "invalid pending deposit key",
    },
    {
      code: 6140,
      name: "InvalidAuthorityCheck",
      msg: "invalid authority check",
    },
    {
      code: 6141,
      name: "InvalidEndEntropyRoundState",
      msg: "entropy: invalid end entropy round state",
    },
    {
      code: 6142,
      name: "InvalidVoltType",
      msg: "invalid volt type",
    },
    {
      code: 6143,
      name: "CantFindPerpMarketIndex",
      msg: "can't find perp market index",
    },
    {
      code: 6144,
      name: "AccountEquityLessThanZero",
      msg: "account equity less than zero",
    },
    {
      code: 6145,
      name: "QuotePositionChangedTooMuch",
      msg: "quote position changed too much",
    },
    {
      code: 6146,
      name: "MustMoveCloserToTargetCollateralization",
      msg: "must move closer to target collateralization",
    },
    {
      code: 6147,
      name: "CollateralNotWithinLenience",
      msg: "collateral not within lenience",
    },
    {
      code: 6148,
      name: "InvalidRebalanceEntropyState",
      msg: "invalid rebalance entropy state",
    },
    {
      code: 6149,
      name: "BasePositionMustBeNegative",
      msg: "volt must have negative base position (be short)",
    },
    {
      code: 6150,
      name: "QuotePositionMustBePositive",
      msg: "volt must have positive quote position (be short)",
    },
    {
      code: 6151,
      name: "TargetCollateralRatioMustBeNegative",
      msg: "target collateral ratio must be neggat",
    },
    {
      code: 6152,
      name: "NewEquityMustBeHigherThanDepositAmount",
      msg: "new equity must be higher than deposit amt",
    },
    {
      code: 6153,
      name: "InstantTransfersMustBeDisabled",
      msg: "instant transfers must be enabled",
    },
    {
      code: 6154,
      name: "RebalanceMustBeReady",
      msg: "rebalance must be ready",
    },
    {
      code: 6155,
      name: "IncorrectHedge",
      msg: "spot hedge unbalanced",
    },
    {
      code: 6156,
      name: "VaultNameMustBeNonZeroLength",
      msg: "vault name must be zero length",
    },
    {
      code: 6157,
      name: "VaultDoesNotSupportOverLeveragedStrategies",
      msg: "vault does not support over leveraged strategies",
    },
    {
      code: 6158,
      name: "LenienceMustBeGreaterThanZero",
      msg: "lenience must be greater than zero",
    },
    {
      code: 6159,
      name: "LenienceShouldNotBeGreaterThanLeverage",
      msg: "lenience should not be greater than leverage",
    },
    {
      code: 6160,
      name: "HedgeLenienceMustBeGreaterThanZero",
      msg: "hedge lenience should be greater than leverage",
    },
    {
      code: 6161,
      name: "VaultDoesNotSupportExitEarlyOverLeveragedStrategies",
      msg: "exit early ratio must be < 1.0",
    },
    {
      code: 6162,
      name: "RoundNumberMustNotOverflow",
      msg: "round number must not overflow",
    },
    {
      code: 6163,
      name: "InvalidWhitelistTokenAccountMint",
      msg: "invalid whitelist token account mint",
    },
    {
      code: 6164,
      name: "SoloptionsProgramIdDoesNotMatch",
      msg: "soloptions program id does not matchf",
    },
    {
      code: 6165,
      name: "WhitelistTokenAccountOwnerIsNotUser",
      msg: "whitelist token account owner is not user",
    },
    {
      code: 6166,
      name: "SolTransferAuthorityMustNotBeOwnedByVoltProgram",
      msg: "sol transfer authority must be owned by volt program",
    },
    {
      code: 6167,
      name: "InsufficientCollateralForDeposit",
      msg: "Insufficient collateral to deposit.",
    },
    {
      code: 6168,
      name: "SolTransferAuthorityMustBeWritableAndSigner",
      msg: "sol transfer authority must be writable/signer",
    },
    {
      code: 6169,
      name: "VoltMustBeOfEntropyType",
      msg: "volt must be entropy type",
    },
    {
      code: 6170,
      name: "VoltMustBeofShortOptionsType",
      msg: "volt must be of short options type",
    },
    {
      code: 6171,
      name: "DepositsAndWithdrawalsAreTurnedOff",
      msg: "deposits and withdrawals are turned off",
    },
    {
      code: 6172,
      name: "UnrecognizedEntropyProgramId",
      msg: "unrecognized entropy program id",
    },
    {
      code: 6173,
      name: "InvalidTakePerformanceFeesState",
      msg: "invalid take performance fees state",
    },
    {
      code: 6174,
      name: "DiscriminatorDoesNotMatch",
      msg: "discriminator does not match",
    },
    {
      code: 6175,
      name: "RealizedOraclePriceTooFarOffClientProvided",
      msg: "realized oracle price too far off client provided",
    },
    {
      code: 6176,
      name: "VaultMintSupplyMustBeZeroIfEquityIsZero",
      msg: "vault mint supply must be zero if equity is zero",
    },
    {
      code: 6177,
      name: "InvalidSetupRebalanceEntropyState",
      msg: "invalid setup rebalance entropy state",
    },
  ],
};
