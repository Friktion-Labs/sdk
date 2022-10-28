export type VoltIDL = {
  version: "0.1.0";
  name: "volt";
  instructions: [
    {
      name: "turnOffDepositsAndWithdrawals";
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
          name: "code";
          type: "u64";
        }
      ];
    },
    {
      name: "changeFees";
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
          name: "performanceFeeBps";
          type: "u64";
        },
        {
          name: "withdrawalFeeBps";
          type: "u64";
        },
        {
          name: "aumFeeBps";
          type: "u64";
        },
        {
          name: "takeFeesInUnderlying";
          type: "bool";
        },
        {
          name: "useCustomFees";
          type: "bool";
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
      name: "initializeShortOptions";
      accounts: [
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
          name: "temporaryUsdcFeePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "sharedAccounts";
          accounts: [
            {
              name: "initializeBaseAccounts";
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
                  isMut: false;
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
                  name: "vaultMint";
                  isMut: true;
                  isSigner: false;
                },
                {
                  name: "depositMint";
                  isMut: false;
                  isSigner: false;
                },
                {
                  name: "depositPool";
                  isMut: true;
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
            },
            {
              name: "quoteAssetMint";
              isMut: false;
              isSigner: false;
            },
            {
              name: "auctionMetadata";
              isMut: true;
              isSigner: false;
            },
            {
              name: "permissionedMarketPremiumPool";
              isMut: true;
              isSigner: false;
            },
            {
              name: "permissionedMarketPremiumMint";
              isMut: false;
              isSigner: false;
            },
            {
              name: "quoteAssetPool";
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
          name: "args";
          type: {
            defined: "InitializeShortOptionsArgs";
          };
        }
      ];
    },
    {
      name: "changeAuctionParams";
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
          name: "auctionMetadata";
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
          name: "isPermissionless";
          type: "u64";
        }
      ];
    },
    {
      name: "startRoundShortOptions";
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
          name: "initializeStartRoundAccounts";
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
              name: "depositMint";
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
          name: "roundInfoAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
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
            }
          ];
        },
        {
          name: "rawDerivsContract";
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
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
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
          name: "optionsProtocolAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "vaultAuthority";
              isMut: false;
              isSigner: false;
            },
            {
              name: "mintPool";
              isMut: false;
              isSigner: false;
            },
            {
              name: "optionsPrograms";
              accounts: [
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
                  name: "spreadsProgram";
                  isMut: false;
                  isSigner: false;
                }
              ];
            },
            {
              name: "rawDerivsContract";
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
              name: "underlyingAssetPool";
              isMut: true;
              isSigner: false;
            },
            {
              name: "quoteAssetPool";
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
              name: "feeDestination";
              isMut: true;
              isSigner: false;
            },
            {
              name: "tokenProgram";
              isMut: false;
              isSigner: false;
            }
          ];
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
          isMut: false;
          isSigner: true;
        },
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionsContractAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "vaultAuthority";
              isMut: false;
              isSigner: false;
            },
            {
              name: "mintPool";
              isMut: false;
              isSigner: false;
            },
            {
              name: "optionsPrograms";
              accounts: [
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
                  name: "spreadsProgram";
                  isMut: false;
                  isSigner: false;
                }
              ];
            },
            {
              name: "rawDerivsContract";
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
              name: "underlyingAssetPool";
              isMut: true;
              isSigner: false;
            },
            {
              name: "quoteAssetPool";
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
              name: "feeDestination";
              isMut: true;
              isSigner: false;
            },
            {
              name: "tokenProgram";
              isMut: false;
              isSigner: false;
            }
          ];
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
          name: "serumMarketAccounts";
          accounts: [
            {
              name: "dexProgram";
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
              name: "srmReferralAcct";
              isMut: false;
              isSigner: false;
            },
            {
              name: "market";
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
            }
          ];
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
          name: "roundInfoAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
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
            }
          ];
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
          name: "auctionMetadata";
          isMut: false;
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
          name: "writerTokenPool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rawDerivsContract";
          isMut: false;
          isSigner: false;
        },
        {
          name: "middlewareProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "serumMarketAccounts";
          accounts: [
            {
              name: "dexProgram";
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
              name: "srmReferralAcct";
              isMut: false;
              isSigner: false;
            },
            {
              name: "market";
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
            }
          ];
        },
        {
          name: "market";
          isMut: true;
          isSigner: false;
        },
        {
          name: "openOrders";
          isMut: true;
          isSigner: false;
        },
        {
          name: "serumMarketAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "whitelistTokenAccount";
          isMut: false;
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
          name: "temporaryUsdcFeePool";
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
        }
      ];
    },
    {
      name: "rebalanceEnterCreateSwap";
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
          name: "auctionMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "swapAdmin";
          isMut: false;
          isSigner: false;
        },
        {
          name: "optionPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionsContract";
          isMut: false;
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
          name: "temporaryUsdcFeePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "newSwapOrder";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userOrders";
          isMut: true;
          isSigner: false;
        },
        {
          name: "givePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "receivePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "counterparty";
          isMut: false;
          isSigner: false;
        },
        {
          name: "swapProgram";
          isMut: false;
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
          name: "params";
          type: {
            defined: "CreateSwapParams";
          };
        },
        {
          name: "shouldKeepCancelled";
          type: "u64";
        }
      ];
    },
    {
      name: "rebalanceEnterClaimSwap";
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
          isMut: false;
          isSigner: false;
        },
        {
          name: "auctionMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
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
          name: "temporaryUsdcFeePool";
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
          isMut: false;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "swapOrder";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userOrders";
          isMut: true;
          isSigner: false;
        },
        {
          name: "givePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "giveMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "receivePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receiveMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "swapProgram";
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
      args: [];
    },
    {
      name: "settleTemporaryUsdcFeesEarly";
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
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "temporaryUsdcFeePool";
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
      name: "rebalanceSettle";
      accounts: [
        {
          name: "authority";
          isMut: false;
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
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundInfoAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
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
            }
          ];
        },
        {
          name: "optionsContractAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "vaultAuthority";
              isMut: false;
              isSigner: false;
            },
            {
              name: "mintPool";
              isMut: false;
              isSigner: false;
            },
            {
              name: "optionsPrograms";
              accounts: [
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
                  name: "spreadsProgram";
                  isMut: false;
                  isSigner: false;
                }
              ];
            },
            {
              name: "rawDerivsContract";
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
              name: "underlyingAssetPool";
              isMut: true;
              isSigner: false;
            },
            {
              name: "quoteAssetPool";
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
              name: "feeDestination";
              isMut: true;
              isSigner: false;
            },
            {
              name: "tokenProgram";
              isMut: false;
              isSigner: false;
            }
          ];
        },
        {
          name: "temporaryUsdcFeePool";
          isMut: true;
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
          name: "bypassCode";
          type: "u64";
        }
      ];
    },
    {
      name: "endRoundShortOptions";
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
          name: "vaultMint";
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
          isMut: false;
          isSigner: false;
        },
        {
          name: "permissionedMarketPremiumPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "roundAccts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
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
            }
          ];
        },
        {
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "temporaryUsdcFeePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lendingAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: false;
              isSigner: false;
            },
            {
              name: "account";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "ulFeeAcct";
          isMut: true;
          isSigner: false;
        },
        {
          name: "usdcFeeAcct";
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
          name: "bypassCode";
          type: "u64";
        }
      ];
    },
    {
      name: "initializeEntropy";
      accounts: [
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "initializeBaseAccounts";
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
              isMut: false;
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
              name: "vaultMint";
              isMut: true;
              isSigner: false;
            },
            {
              name: "depositMint";
              isMut: false;
              isSigner: false;
            },
            {
              name: "depositPool";
              isMut: true;
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
        },
        {
          name: "entropyMetadata";
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
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyCache";
          isMut: false;
          isSigner: false;
        },
        {
          name: "targetPerpMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "hedgingPerpMarket";
          isMut: false;
          isSigner: false;
        },
        {
          name: "hedgingSpotMarket";
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
          name: "args";
          type: {
            defined: "InitializeEntropyArgs";
          };
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
        },
        {
          name: "entropyMetadata";
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
        },
        {
          name: "shouldHedge";
          type: "u64";
        },
        {
          name: "hedgeWithSpot";
          type: "u64";
        }
      ];
    },
    {
      name: "takePerformanceAndAumFeesEntropy";
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
        },
        {
          name: "entropyMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: false;
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
          name: "entropyBaseAccounts";
          accounts: [
            {
              name: "extraVoltData";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: true;
              isSigner: false;
            },
            {
              name: "account";
              isMut: true;
              isSigner: false;
            },
            {
              name: "cache";
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
            }
          ];
        },
        {
          name: "openOrders";
          isMut: false;
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
          name: "depositMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyBaseAccounts";
          accounts: [
            {
              name: "extraVoltData";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: true;
              isSigner: false;
            },
            {
              name: "account";
              isMut: true;
              isSigner: false;
            },
            {
              name: "cache";
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
            }
          ];
        },
        {
          name: "initializeStartRoundAccounts";
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
              name: "depositMint";
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
        },
        {
          name: "entropyRound";
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
          name: "depositPool";
          isMut: false;
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
          name: "entropyBaseAccounts";
          accounts: [
            {
              name: "extraVoltData";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: true;
              isSigner: false;
            },
            {
              name: "account";
              isMut: true;
              isSigner: false;
            },
            {
              name: "cache";
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
            }
          ];
        },
        {
          name: "lendingAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: false;
              isSigner: false;
            },
            {
              name: "account";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "openOrders";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: false;
          isSigner: false;
        },
        {
          name: "feeAcct";
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
      args: [
        {
          name: "bypassCode";
          type: "u64";
        }
      ];
    },
    {
      name: "setupRebalanceEntropy";
      accounts: [
        {
          name: "authority";
          isMut: false;
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
          name: "depositMint";
          isMut: false;
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
          name: "roundAccts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
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
            }
          ];
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
          name: "entropyBaseAccounts";
          accounts: [
            {
              name: "extraVoltData";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: true;
              isSigner: false;
            },
            {
              name: "account";
              isMut: true;
              isSigner: false;
            },
            {
              name: "cache";
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
            }
          ];
        },
        {
          name: "targetPerpMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "spotPerpMarket";
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
      name: "rebalanceIntoPerpEntropy";
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
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "entropyBaseAccounts";
          accounts: [
            {
              name: "extraVoltData";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: true;
              isSigner: false;
            },
            {
              name: "account";
              isMut: true;
              isSigner: false;
            },
            {
              name: "cache";
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
            }
          ];
        },
        {
          name: "eventQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "targetPerpEventQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "openOrders";
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
          name: "targetPerpMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "hedgingPerpMarket";
          isMut: true;
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
          name: "params";
          type: {
            defined: "EntropyPlaceOrderParams";
          };
        },
        {
          name: "forceHedgeFirst";
          type: "bool";
        }
      ];
    },
    {
      name: "rebalanceIntoSpotEntropy";
      accounts: [
        {
          name: "authority";
          isMut: false;
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
          name: "dexProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "entropyBaseAccounts";
          accounts: [
            {
              name: "extraVoltData";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: true;
              isSigner: false;
            },
            {
              name: "account";
              isMut: true;
              isSigner: false;
            },
            {
              name: "cache";
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
            }
          ];
        },
        {
          name: "targetPerpEventQueue";
          isMut: false;
          isSigner: false;
        },
        {
          name: "targetPerpMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "spotMarket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "openOrders";
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
          name: "dexRequestQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "dexEventQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "dexBase";
          isMut: true;
          isSigner: false;
        },
        {
          name: "dexQuote";
          isMut: true;
          isSigner: false;
        },
        {
          name: "quoteVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: false;
          isSigner: false;
        },
        {
          name: "dexSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "msrmOrSrmVault";
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
          name: "params";
          type: {
            defined: "EntropyPlaceOrderParams";
          };
        }
      ];
    },
    {
      name: "initSpotOpenOrdersEntropy";
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
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
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
          name: "spotMarket";
          isMut: true;
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
          name: "signer";
          isMut: false;
          isSigner: false;
        },
        {
          name: "dexSigner";
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
      name: "initializePrincipalProtection";
      accounts: [
        {
          name: "voltVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "principalProtectionVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "initializeAccounts";
          accounts: [
            {
              name: "initializeBaseAccounts";
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
                  isMut: false;
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
                  name: "vaultMint";
                  isMut: true;
                  isSigner: false;
                },
                {
                  name: "depositMint";
                  isMut: false;
                  isSigner: false;
                },
                {
                  name: "depositPool";
                  isMut: true;
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
            },
            {
              name: "quoteAssetMint";
              isMut: false;
              isSigner: false;
            },
            {
              name: "auctionMetadata";
              isMut: true;
              isSigner: false;
            },
            {
              name: "permissionedMarketPremiumPool";
              isMut: true;
              isSigner: false;
            },
            {
              name: "permissionedMarketPremiumMint";
              isMut: false;
              isSigner: false;
            },
            {
              name: "quoteAssetPool";
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
        },
        {
          name: "tulipAccounts";
          accounts: [
            {
              name: "vault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "sharesMint";
              isMut: false;
              isSigner: false;
            }
          ];
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
          name: "args";
          type: {
            defined: "InitializePrincipalProtectionArgs";
          };
        }
      ];
    },
    {
      name: "startRoundPrincipalProtection";
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
          name: "ppVault";
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
          name: "depositMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "initializeStartRoundAccounts";
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
              name: "depositMint";
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
        },
        {
          name: "ppContextAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "ppVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "depositTrackingAccount";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingSharesPool";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingVault";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingVaultProgram";
              isMut: false;
              isSigner: false;
            }
          ];
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
      name: "initTulipAccounts";
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
          name: "ppVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lendingSharesPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositIntoLendingAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tulipVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositTrackingAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTrackingQueue";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTrackingHold";
          isMut: true;
          isSigner: false;
        },
        {
          name: "sharesMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositTrackingPda";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
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
      args: [];
    },
    {
      name: "deployLending";
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
          name: "ppVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "ppContextAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "ppVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "depositTrackingAccount";
              isMut: true;
              isSigner: false;
            },
            {
              name: "depositTrackingPda";
              isMut: false;
              isSigner: false;
            },
            {
              name: "optionTokenPool";
              isMut: false;
              isSigner: false;
            },
            {
              name: "sharesMint";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingSharesPool";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingVault";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingVaultPda";
              isMut: false;
              isSigner: false;
            },
            {
              name: "lendingVaultProgram";
              isMut: false;
              isSigner: false;
            }
          ];
        },
        {
          name: "depositIntoLendingAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lendingVaultUlAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "globalTulipV2Authority";
          isMut: false;
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
      name: "endRoundPrincipalProtection";
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
          name: "ppVault";
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
          name: "depositMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "ppContextAccounts";
          accounts: [
            {
              name: "voltVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "ppVault";
              isMut: false;
              isSigner: false;
            },
            {
              name: "depositTrackingAccount";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingSharesPool";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingVault";
              isMut: true;
              isSigner: false;
            },
            {
              name: "lendingVaultProgram";
              isMut: false;
              isSigner: false;
            }
          ];
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
          name: "payerAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nonPayerAuthority";
          isMut: false;
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
          name: "userVaultTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userUlTokens";
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
          name: "payerAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nonPayerAuthority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "solTransferAuthority";
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
          name: "userVaultTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userUlTokens";
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
          name: "pendingDepositRoundUnderlyingTokens";
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
          name: "payerAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nonPayerAuthority";
          isMut: false;
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
      name: "withdrawWithClaim";
      accounts: [
        {
          name: "payerAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nonPayerAuthority";
          isMut: false;
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
          name: "pendingWithdrawalRoundInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingWithdrawalRoundUnderlyingTokensForPws";
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
      name: "cancelPendingDeposit";
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
        }
      ];
      args: [];
    },
    {
      name: "cancelPendingWithdrawal";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "vaultMint";
          isMut: true;
          isSigner: false;
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
        }
      ];
      args: [];
    },
    {
      name: "claimPendingDeposit";
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
      name: "dummyInstruction";
      accounts: [
        {
          name: "entropyBaseAccounts";
          accounts: [
            {
              name: "extraVoltData";
              isMut: false;
              isSigner: false;
            },
            {
              name: "program";
              isMut: false;
              isSigner: false;
            },
            {
              name: "group";
              isMut: false;
              isSigner: false;
            },
            {
              name: "cache";
              isMut: false;
              isSigner: false;
            },
            {
              name: "account";
              isMut: false;
              isSigner: false;
            }
          ];
        }
      ];
      args: [];
    },
    {
      name: "includeOptionsProgramsAccounts";
      accounts: [
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
          name: "spreadsProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initSerumMarket";
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
          name: "voltVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "auctionMetadata";
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
      name: "AuctionMetadata";
      type: {
        kind: "struct";
        fields: [
          {
            name: "isPermissionless";
            type: "bool";
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
            name: "userOrders";
            type: "publicKey";
          },
          {
            name: "currSwapOrder";
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
            name: "participantType";
            type: "u64";
          },
          {
            name: "optionType";
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
            name: "unusedFloatOne";
            type: "f64";
          },
          {
            name: "unusedFloatFour";
            type: "f64";
          },
          {
            name: "unusedFloatFive";
            type: "f64";
          },
          {
            name: "unusedFloatSix";
            type: "f64";
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
            name: "spotOpenOrders";
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
            name: "targetCurrBasePosition";
            type: "f64";
          },
          {
            name: "targetCurrQuotePosition";
            type: "f64";
          },
          {
            name: "hedgeLenience";
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
            name: "hedgeWithSpot";
            type: "bool";
          },
          {
            name: "otcSetupRebalanceBlock";
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
            name: "depositAmtQuote";
            type: "f64";
          },
          {
            name: "withdrawCompFromDepositNative";
            type: "u64";
          },
          {
            name: "netDepositsQuote";
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
            name: "number";
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
            name: "targetCurrBasePosition";
            type: "f64";
          },
          {
            name: "targetCurrQuotePosition";
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
            name: "aumInDepositTokenAtEpochStart";
            type: "u64";
          },
          {
            name: "aumInDepositTokenAtEpochEnd";
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
            name: "aumFees";
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
            name: "startRoundTime";
            type: "u64";
          },
          {
            name: "beginAuctionTime";
            type: "u64";
          },
          {
            name: "endAuctionTime";
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
            name: "heldAsidePerformanceFees";
            type: "u64";
          },
          {
            name: "lastSwapSize";
            type: "u64";
          },
          {
            name: "totalWithdrawalsFromRealms";
            type: "u64";
          },
          {
            name: "totalDepositsFromRealms";
            type: "u64";
          },
          {
            name: "dovPerformanceFeesInUnderlying";
            type: "bool";
          },
          {
            name: "usedOtcOrders";
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
            name: "targetPerpMarket";
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
            name: "hedgingPerpMarket";
            type: "publicKey";
          },
          {
            name: "entropyMetadata";
            type: "publicKey";
          },
          {
            name: "hedgingSpotMarket";
            type: "publicKey";
          },
          {
            name: "auctionMetadata";
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
            name: "unusedUintOne";
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
            name: "timeLastTookAumFees";
            type: "u64";
          },
          {
            name: "unusedUint1234";
            type: "u64";
          },
          {
            name: "aumFeeBps";
            type: "u64";
          },
          {
            name: "useCustomFees";
            type: "u64";
          },
          {
            name: "performanceFeeBps";
            type: "u64";
          },
          {
            name: "withdrawalFeeBps";
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
            name: "dovPerformanceFeesInUnderlying";
            type: "bool";
          },
          {
            name: "doneRebalancingTargetPerp";
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
      name: "PrincipalProtectionVaultV1";
      type: {
        kind: "struct";
        fields: [
          {
            name: "initialized";
            type: "bool";
          },
          {
            name: "vaultName";
            type: "string";
          },
          {
            name: "keys";
            type: {
              defined: "PrincipalProtectionAccountsV1";
            };
          },
          {
            name: "allocationStrategy";
            type: {
              defined: "SecondLegAllocationStrategy";
            };
          },
          {
            name: "lendingStrategy";
            type: {
              defined: "LendingStrategy";
            };
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
            name: "aumInDepositTokenAtEpochStart";
            type: "u64";
          },
          {
            name: "aumInDepositTokenAtEpochEnd";
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
            name: "currOptionWasSettledFirstTime";
            type: "bool";
          },
          {
            name: "mustSwapQuoteAssetAfterSettle";
            type: "bool";
          },
          {
            name: "nextOptionWasSet";
            type: "bool";
          },
          {
            name: "mustSwapPremiumAfterEnter";
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
            name: "aumInDepositTokenAtEpochStart";
            type: "u64";
          },
          {
            name: "aumInDepositTokenAtEpochEnd";
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
            name: "depositMint";
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
            name: "optionsContract";
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
            name: "mustSwapUsdcFeesAfterSettle";
            type: "u8";
          },
          {
            name: "finishedSettlingOption";
            type: "u8";
          },
          {
            name: "voltType";
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
            name: "vaultAuthorityBump";
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
    },
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
    }
  ];
  types: [
    {
      name: "SerumOrderPreferences";
      type: {
        kind: "struct";
        fields: [
          {
            name: "limit";
            type: "u16";
          },
          {
            name: "orderType";
            type: {
              defined: "OrderType";
            };
          },
          {
            name: "selfTradeBehavior";
            type: {
              defined: "SelfTradeBehavior";
            };
          }
        ];
      };
    },
    {
      name: "CreateSwapParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "giveSize";
            type: "u64";
          },
          {
            name: "receiveSize";
            type: "u64";
          },
          {
            name: "expiry";
            type: "u64";
          },
          {
            name: "isCounterpartyProvided";
            type: "bool";
          },
          {
            name: "isWhitelisted";
            type: "bool";
          },
          {
            name: "enforceMintMatch";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "VoltBumps";
      type: {
        kind: "struct";
        fields: [
          {
            name: "vaultAuthorityBump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "InitializeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "vaultName";
            type: "string";
          },
          {
            name: "capacity";
            type: "u64";
          },
          {
            name: "individualCapacity";
            type: "u64";
          },
          {
            name: "bumps";
            type: {
              defined: "VoltBumps";
            };
          }
        ];
      };
    },
    {
      name: "SerumArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "orderSizeOptions";
            type: "u64";
          },
          {
            name: "orderType";
            type: "u64";
          },
          {
            name: "selfTradeBehavior";
            type: "u16";
          }
        ];
      };
    },
    {
      name: "OptionsContractArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "participantType";
            type: {
              defined: "DovParticipantType";
            };
          },
          {
            name: "optionType";
            type: {
              defined: "OptionType";
            };
          },
          {
            name: "expirationInterval";
            type: "u64";
          },
          {
            name: "underlyingAmountPerContract";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "InitializeDovArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "serumArgs";
            type: {
              defined: "SerumArgs";
            };
          },
          {
            name: "optionsArgs";
            type: {
              defined: "OptionsContractArgs";
            };
          },
          {
            name: "permissionlessAuctions";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "InitializeShortOptionsArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "baseArgs";
            type: {
              defined: "InitializeArgs";
            };
          },
          {
            name: "dovArgs";
            type: {
              defined: "InitializeDovArgs";
            };
          }
        ];
      };
    },
    {
      name: "InitializePrincipalProtectionArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "baseArgs";
            type: {
              defined: "InitializeArgs";
            };
          },
          {
            name: "dovArgs";
            type: {
              defined: "InitializeDovArgs";
            };
          },
          {
            name: "allocationStrategy";
            type: {
              defined: "SecondLegAllocationStrategy";
            };
          },
          {
            name: "lendingStrategy";
            type: {
              defined: "LendingStrategy";
            };
          }
        ];
      };
    },
    {
      name: "InitializeEntropyArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "baseArgs";
            type: {
              defined: "InitializeArgs";
            };
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
            name: "shouldHedge";
            type: "bool";
          },
          {
            name: "hedgeWithSpot";
            type: "bool";
          },
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
          }
        ];
      };
    },
    {
      name: "PrincipalProtectionAccountsV1";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lendingKeys";
            type: {
              defined: "LendingKeys";
            };
          },
          {
            name: "optionsKeys";
            type: {
              defined: "OptionsContractKeys";
            };
          },
          {
            name: "lendingSharesPool";
            type: "publicKey";
          },
          {
            name: "depositIntoLendingAta";
            type: "publicKey";
          },
          {
            name: "extraKey1";
            type: "publicKey";
          },
          {
            name: "extraKey2";
            type: "publicKey";
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
          }
        ];
      };
    },
    {
      name: "OptionsContractKeys";
      type: {
        kind: "struct";
        fields: [
          {
            name: "programId";
            type: "publicKey";
          },
          {
            name: "optionsContract";
            type: "publicKey";
          },
          {
            name: "optionTokenPool";
            type: "publicKey";
          },
          {
            name: "extraKey1";
            type: "publicKey";
          },
          {
            name: "extraKey2";
            type: "publicKey";
          },
          {
            name: "extraKey3";
            type: "publicKey";
          },
          {
            name: "extraKey4";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "EntropyPlaceOrderParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "clientBidPrice";
            type: "u64";
          },
          {
            name: "clientAskPrice";
            type: "u64";
          },
          {
            name: "maxQuotePosChange";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "LendingParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bool1";
            type: "u8";
          },
          {
            name: "bool2";
            type: "u8";
          },
          {
            name: "bool3";
            type: "u8";
          },
          {
            name: "bool4";
            type: "u8";
          },
          {
            name: "maxAllowedUtilizationBps";
            type: "u64";
          },
          {
            name: "unusedUint1";
            type: "u64";
          },
          {
            name: "unusedUint2";
            type: "u64";
          },
          {
            name: "unusedUint3";
            type: "u64";
          },
          {
            name: "unusedUint4";
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
          }
        ];
      };
    },
    {
      name: "PrimaryVaultKeys";
      type: {
        kind: "struct";
        fields: [
          {
            name: "vault";
            type: "publicKey";
          },
          {
            name: "vaultPda";
            type: "publicKey";
          },
          {
            name: "underlyingDepositQueue";
            type: "publicKey";
          },
          {
            name: "underlyingWithdrawQueue";
            type: "publicKey";
          },
          {
            name: "sharesMint";
            type: "publicKey";
          },
          {
            name: "underlyingMint";
            type: "publicKey";
          },
          {
            name: "depositTrackingAccount";
            type: "publicKey";
          },
          {
            name: "depositTrackingQueueAccount";
            type: "publicKey";
          },
          {
            name: "depositTrackingHoldAccount";
            type: "publicKey";
          },
          {
            name: "depositTrackingPda";
            type: "publicKey";
          },
          {
            name: "programId";
            type: "publicKey";
          },
          {
            name: "extraKey1";
            type: "publicKey";
          },
          {
            name: "extraKey2";
            type: "publicKey";
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
          }
        ];
      };
    },
    {
      name: "LendingKeys";
      type: {
        kind: "struct";
        fields: [
          {
            name: "primaryVault";
            type: {
              defined: "PrimaryVaultKeys";
            };
          },
          {
            name: "mangoVault";
            type: "publicKey";
          },
          {
            name: "solendVault";
            type: "publicKey";
          },
          {
            name: "tulipVault";
            type: "publicKey";
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
      name: "DovParticipantType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "OptionSeller";
          },
          {
            name: "OptionBuyer";
          }
        ];
      };
    },
    {
      name: "OptionType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Call";
          },
          {
            name: "Put";
          }
        ];
      };
    },
    {
      name: "ExecutionType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Spot";
          },
          {
            name: "Perp";
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
          },
          {
            name: "PrincipalProtection";
          }
        ];
      };
    },
    {
      name: "SecondLegAllocationStrategy";
      type: {
        kind: "enum";
        variants: [
          {
            name: "MinApr";
            fields: [
              {
                name: "apr";
                type: "u64";
              }
            ];
          },
          {
            name: "ProjectedPnlFraction";
            fields: [
              {
                name: "fraction_bps";
                type: "u64";
              }
            ];
          },
          {
            name: "FixedFraction";
            fields: [
              {
                name: "fraction_bps";
                type: "u64";
              }
            ];
          },
          {
            name: "ExtraStrategy1";
            fields: [
              {
                name: "uint1";
                type: "u64";
              },
              {
                name: "uint2";
                type: "u64";
              },
              {
                name: "uint3";
                type: "u64";
              },
              {
                name: "uint4";
                type: "u64";
              },
              {
                name: "u81";
                type: "u8";
              },
              {
                name: "u82";
                type: "u8";
              },
              {
                name: "u83";
                type: "u8";
              },
              {
                name: "u84";
                type: "u8";
              }
            ];
          }
        ];
      };
    },
    {
      name: "LendingStrategy";
      type: {
        kind: "enum";
        variants: [
          {
            name: "TulipOptimizer";
            fields: [
              {
                name: "params";
                type: {
                  defined: "LendingParams";
                };
              }
            ];
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidVoltType";
      msg: "invalid volt type";
    },
    {
      code: 6001;
      name: "VaultNameMustBeNonZeroLength";
      msg: "vault name must be zero length";
    },
    {
      code: 6002;
      name: "ExpirationIsInThePast";
      msg: "Expiration must be in the future";
    },
    {
      code: 6003;
      name: "FeeOwnerDoesNotMatchProgram";
      msg: "Fee owner does not match the program's fee owner";
    },
    {
      code: 6004;
      name: "MintFeeMustBeOwnedByFeeOwner";
      msg: "Mint fee account must be owned by the FEE_OWNER";
    },
    {
      code: 6005;
      name: "ExerciseFeeMustBeOwnedByFeeOwner";
      msg: "Exercise fee account must be owned by the FEE_OWNER";
    },
    {
      code: 6006;
      name: "UnderlyingDestMintDoesNotMatchUnderlyingAsset";
      msg: "Underlying destination mint must match underlying asset mint address";
    },
    {
      code: 6007;
      name: "FeeAccountOwnerDoesNotMatch";
      msg: "fee account owner does not match expected";
    },
    {
      code: 6008;
      name: "FeeAccountMintDoesNotMatchDepositPoolOrPermissionedPremium";
      msg: "fee account mint does not match deposit pool or permissioned market premium";
    },
    {
      code: 6009;
      name: "MustHaveLastTimeTookAumFees";
      msg: "please end an epoch and get a time last took aum fees";
    },
    {
      code: 6010;
      name: "InvalidFeeAccount";
    },
    {
      code: 6011;
      name: "NumberOverflow";
      msg: "Numerical overflow";
    },
    {
      code: 6012;
      name: "InvalidOrderType";
      msg: "Invalid order type";
    },
    {
      code: 6013;
      name: "InvalidSelfTradeBehavior";
      msg: "Invalid self trade behavior";
    },
    {
      code: 6014;
      name: "Unauthorized";
      msg: "Unauthorized.";
    },
    {
      code: 6015;
      name: "InsufficientVaultTokens";
      msg: "Insufficient Vault tokens to redeem.";
    },
    {
      code: 6016;
      name: "InvalidSetNextOptionState";
      msg: "invalid time to set next option";
    },
    {
      code: 6017;
      name: "InvalidRebalancePrepareState";
      msg: "invalid time to call rebalancePrepare()";
    },
    {
      code: 6018;
      name: "InvalidRebalanceSettleState";
      msg: "invalid rebalance settle state";
    },
    {
      code: 6019;
      name: "InvalidRebalanceEnterState";
      msg: "invalid rebalance enter state";
    },
    {
      code: 6020;
      name: "InvalidSwapPremiumState";
      msg: "invalid rebalance swap premium state";
    },
    {
      code: 6021;
      name: "InvalidStartRoundState";
      msg: "invalid start round state";
    },
    {
      code: 6022;
      name: "InvalidEndRoundState";
      msg: "invalid end round state";
    },
    {
      code: 6023;
      name: "InvalidInitSerumMarketState";
      msg: "invalid init serum market state";
    },
    {
      code: 6024;
      name: "InvalidResetOptionMarketState";
      msg: "must not have sold option tokens to reset";
    },
    {
      code: 6025;
      name: "PermissionedMarketPremiumPoolAmountMustBeZero";
      msg: "permissioned market premium pool amount must be zero";
    },
    {
      code: 6026;
      name: "PremiumPoolAmountMustBeZero";
      msg: "premium pool amount must be zero";
    },
    {
      code: 6027;
      name: "PremiumPoolAmountMustBeGreaterThanZero";
      msg: "premium pool amount must be greater than zero";
    },
    {
      code: 6028;
      name: "MintOptionMustMatchSetOption";
      msg: "mint option must match set option";
    },
    {
      code: 6029;
      name: "RoundHasNotEnded";
    },
    {
      code: 6030;
      name: "MustSwapPremiumAfterEnter";
    },
    {
      code: 6031;
      name: "NoValidShortOptionsEpochStage";
      msg: "no valid short options epoch stage";
    },
    {
      code: 6032;
      name: "InvalidCallToShortOptionsEpochStage";
      msg: "invalid call to short options epoch stage";
    },
    {
      code: 6033;
      name: "InvalidSettleFeesEarly";
    },
    {
      code: 6034;
      name: "InsufficientCollateralForDeposit";
      msg: "Insufficient collateral to deposit.";
    },
    {
      code: 6035;
      name: "InstantTransfersMustBeDisabled";
      msg: "instant transfers must be enabled";
    },
    {
      code: 6036;
      name: "VaultCapacityWouldBeExceeded";
      msg: "vault capacity would be exceeded";
    },
    {
      code: 6037;
      name: "IndividualDepositCapacityWouldBeExceeded";
      msg: "individual deposit capacity would be exceeded";
    },
    {
      code: 6038;
      name: "DepositsAndWithdrawalsAreTurnedOff";
      msg: "deposits and withdrawals are turned off";
    },
    {
      code: 6039;
      name: "WithdrawalsDisabled";
      msg: "invalid time to withdraw";
    },
    {
      code: 6040;
      name: "DepositsDisabled";
      msg: "invalid time to deposit";
    },
    {
      code: 6041;
      name: "InvalidDepositAmount";
      msg: "invalid deposit amount (must be greater than zero)";
    },
    {
      code: 6042;
      name: "InvalidWithdrawAmount";
      msg: "invalid withdraw amount";
    },
    {
      code: 6043;
      name: "InvalidPendingDepositKey";
      msg: "invalid pending deposit key";
    },
    {
      code: 6044;
      name: "CantHaveMultiplePendingDeposits";
      msg: "shouldn't have multiple pending deposits";
    },
    {
      code: 6045;
      name: "InvalidClaimPendingDepositState";
      msg: "invalid claim pending state";
    },
    {
      code: 6046;
      name: "CantHaveMultiplePendingWithdrawals";
      msg: "shouldn't have multiple pending deposits";
    },
    {
      code: 6047;
      name: "InvalidClaimPendingWithdrawalState";
      msg: "invalid claim pending withdrawal state";
    },
    {
      code: 6048;
      name: "PendingWithdrawalInfoNotInitialized";
      msg: "pending withdrawal info must be initialized";
    },
    {
      code: 6049;
      name: "PendingWithdrawalDoesNotExist";
      msg: "pending withdrawal does not exist";
    },
    {
      code: 6050;
      name: "CannotCancelPendingWithdrawalFromOldRound";
      msg: "cannot cancel pending withdrawal from old round";
    },
    {
      code: 6051;
      name: "PendingDepositInfoNotInitialized";
      msg: "pending deposit info not initialized";
    },
    {
      code: 6052;
      name: "PendingDepositDoesNotExist";
      msg: "pending deposits does not exist";
    },
    {
      code: 6053;
      name: "CannotCancelPendingDepositFromOldRound";
      msg: "cannot cancel pending deposit from old round";
    },
    {
      code: 6054;
      name: "InvalidRoundForCancel";
      msg: "invalid round number for cancel pending deposit/withdrawal";
    },
    {
      code: 6055;
      name: "InvalidEpochForCancel";
      msg: "invalid epoch number for cancel pending deposit/withdrawal";
    },
    {
      code: 6056;
      name: "PendingDepositAlreadyExists";
      msg: "pending deposit already exists";
    },
    {
      code: 6057;
      name: "InvalidPendingWithdrawalKey";
      msg: "invalid pending withdrawal key";
    },
    {
      code: 6058;
      name: "InvalidPendingWithdrawalState";
    },
    {
      code: 6059;
      name: "InvalidExpiry";
      msg: "invalid expiry for contract";
    },
    {
      code: 6060;
      name: "NewOptionMustHaveExactExpiry";
      msg: "new option has roughly target expiry (within lower/upper bounds)";
    },
    {
      code: 6061;
      name: "InvalidUnderlyingAsset";
      msg: "new option has wrong underlying asset";
    },
    {
      code: 6062;
      name: "InvalidQuoteAsset";
      msg: "new option has wrong quote asset";
    },
    {
      code: 6063;
      name: "InvalidContractSize";
      msg: "new option has wrong contract size";
    },
    {
      code: 6064;
      name: "InvalidStrike";
      msg: "new option has invalid strike";
    },
    {
      code: 6065;
      name: "InvalidVaultTokenAccount";
      msg: "vault mint does not match user token account";
    },
    {
      code: 6066;
      name: "InvalidDepositTokenAccount";
      msg: "deposit pool mint does not match user token account";
    },
    {
      code: 6067;
      name: "InvalidSerumProgramId";
      msg: "DEX program id does not match";
    },
    {
      code: 6068;
      name: "InvalidOptionsProtocol";
      msg: "option market should be owned by a whitelisted protocol (e.g soloptions, spreads, inertia)";
    },
    {
      code: 6069;
      name: "InvalidDepositMint";
      msg: "underlying asset mint does not match voltvault";
    },
    {
      code: 6070;
      name: "InvalidVaultMint";
      msg: "vault mint does not match volt vault";
    },
    {
      code: 6071;
      name: "InvalidVaultAuthority";
      msg: "vault authority does not match";
    },
    {
      code: 6072;
      name: "InvalidOptionsContract";
      msg: "option market does not match volt vault";
    },
    {
      code: 6073;
      name: "InvalidWriterTokenPool";
      msg: "writer token pool does not match volt vault";
    },
    {
      code: 6074;
      name: "InvalidWriterTokenMint";
      msg: "writer token mint does not match volt vault";
    },
    {
      code: 6075;
      name: "InvalidOptionTokenMint";
      msg: "option token mint does not match volt vault";
    },
    {
      code: 6076;
      name: "InvalidPermissionedMarketPremiumMint";
      msg: "invalid permissioned market premium mint";
    },
    {
      code: 6077;
      name: "RoundVoltTokensMintDoesNotMatchVoltVault";
      msg: "round volt tokens mint does not match volt vault";
    },
    {
      code: 6078;
      name: "RoundUnderlyingTokensMintDoesNotMatchVoltVault";
      msg: "round underlying tokens mint does not match volt vault";
    },
    {
      code: 6079;
      name: "DepositPoolDoesNotMatchOptionMarket";
      msg: "UnderlyingAssetPoolDoesNotMatchOptionMarket";
    },
    {
      code: 6080;
      name: "UnderlyingOpenOrdersDoesNotMatchVoltVault";
      msg: "underlying open orders does not match volt vault";
    },
    {
      code: 6081;
      name: "DepositPoolDoesNotMatchVoltVault";
      msg: "DepositPoolDoesNotMatchVoltVault";
    },
    {
      code: 6082;
      name: "MintDoesNotMatchOptionsContract";
      msg: "option mint does not match option market";
    },
    {
      code: 6083;
      name: "VaultDestinationDoesNotMatchVoltVault";
      msg: "vault destination does not match volt vault";
    },
    {
      code: 6084;
      name: "SolTransferAuthorityMustNotBeOwnedByVoltProgram";
      msg: "sol transfer authority must be owned by volt program";
    },
    {
      code: 6085;
      name: "SolTransferAuthorityMustBeWritableAndSigner";
      msg: "sol transfer authority must be writable/signer";
    },
    {
      code: 6086;
      name: "ShouldBeUnreachable";
      msg: "should be unreachable code";
    },
    {
      code: 6087;
      name: "UserIsNotSigner";
      msg: "user is not signer";
    },
    {
      code: 6088;
      name: "CantCloseNonEmptyTokenAccount";
      msg: "can't close non empty token account";
    },
    {
      code: 6089;
      name: "CantCloseAccountUnlessEmpty";
      msg: "cannot close account unless empty";
    },
    {
      code: 6090;
      name: "DiscriminatorDoesNotMatch";
      msg: "discriminator does not match";
    },
    {
      code: 6091;
      name: "InvalidOracleType";
      msg: "invalid oracle type";
    },
    {
      code: 6092;
      name: "UnexpectedRemainingAssets";
      msg: "unexpected remaining assets";
    },
    {
      code: 6093;
      name: "AlreadyInitialized";
      msg: "cannot reinitialize an (already initialized) volt";
    },
    {
      code: 6094;
      name: "TransferAuthorityMustSign";
      msg: "transfer authority must sign";
    },
    {
      code: 6095;
      name: "InvalidRoundNumber";
    },
    {
      code: 6096;
      name: "InvalidTokenAccount";
    },
    {
      code: 6097;
      name: "InvalidPDA";
    },
    {
      code: 6098;
      name: "InvalidAccount";
    },
    {
      code: 6099;
      name: "InvalidWhitelistAuthority";
      msg: "authority does not match whitelist admin";
    },
    {
      code: 6100;
      name: "InvalidSerumMarketPda";
      msg: "whitelist and option market do not generate correct PDA";
    },
    {
      code: 6101;
      name: "InvalidMiddlewareProgramId";
      msg: "middleware program id does not match expected";
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
      name: "RequiresMakerAccessToken";
      msg: "must have at least one market maker access token";
    },
    {
      code: 6106;
      name: "OpenOrderMustBeEmptyToClose";
      msg: "open orders must be empty to close";
    },
    {
      code: 6107;
      name: "PriceTooLow";
    },
    {
      code: 6108;
      name: "PriceTooHigh";
    },
    {
      code: 6109;
      name: "OrderSizeZero";
    },
    {
      code: 6110;
      name: "UnsupportedOrderStrategy";
    },
    {
      code: 6111;
      name: "InvalidMarketType";
    },
    {
      code: 6112;
      name: "InvalidOpenOrders";
    },
    {
      code: 6113;
      name: "NoOpenOrders";
    },
    {
      code: 6114;
      name: "InsufficientFundsToBid";
    },
    {
      code: 6115;
      name: "InsufficientFundsToOffer";
    },
    {
      code: 6116;
      name: "MustTakeWithdrawalFeesBeforeStartingRound";
      msg: "must take withdrawal fees before starting round";
    },
    {
      code: 6117;
      name: "InvalidEndEntropyRoundState";
      msg: "entropy: invalid end entropy round state";
    },
    {
      code: 6118;
      name: "CantFindPerpMarketIndex";
      msg: "can't find perp market index";
    },
    {
      code: 6119;
      name: "AccountEquityLessThanZero";
      msg: "account equity less than zero";
    },
    {
      code: 6120;
      name: "QuotePositionChangedTooMuch";
      msg: "quote position changed too much";
    },
    {
      code: 6121;
      name: "MustMoveCloserToTargetCollateralization";
      msg: "must move closer to target collateralization";
    },
    {
      code: 6122;
      name: "CollateralNotWithinLenience";
      msg: "collateral not within lenience";
    },
    {
      code: 6123;
      name: "InvalidRebalanceEntropyState";
      msg: "invalid rebalance entropy state";
    },
    {
      code: 6124;
      name: "BasePositionMustBeNegative";
      msg: "volt must have negative base position (be short)";
    },
    {
      code: 6125;
      name: "QuotePositionMustBePositive";
      msg: "volt must have positive quote position (be short)";
    },
    {
      code: 6126;
      name: "TargetCollateralRatioMustBeNegative";
      msg: "target collateral ratio must be neggat";
    },
    {
      code: 6127;
      name: "NewEquityMustBeHigherThanDepositAmount";
      msg: "new equity must be higher than deposit amt";
    },
    {
      code: 6128;
      name: "RebalanceMustBeReady";
      msg: "rebalance must be ready";
    },
    {
      code: 6129;
      name: "IncorrectHedge";
      msg: "spot hedge unbalanced";
    },
    {
      code: 6130;
      name: "VaultDoesNotSupportOverLeveragedStrategies";
      msg: "vault does not support over leveraged strategies";
    },
    {
      code: 6131;
      name: "LenienceMustBeGreaterThanZero";
      msg: "lenience must be greater than zero";
    },
    {
      code: 6132;
      name: "LenienceShouldNotBeGreaterThanLeverage";
      msg: "lenience should not be greater than leverage";
    },
    {
      code: 6133;
      name: "HedgeLenienceMustBeGreaterThanZero";
      msg: "hedge lenience should be greater than leverage";
    },
    {
      code: 6134;
      name: "VaultDoesNotSupportExitEarlyOverLeveragedStrategies";
      msg: "exit early ratio must be < 1.0";
    },
    {
      code: 6135;
      name: "ShouldBeDoneRebalancing";
      msg: "should be done rebalancing";
    },
    {
      code: 6136;
      name: "UnrecognizedEntropyProgramId";
      msg: "unrecognized entropy program id";
    },
    {
      code: 6137;
      name: "InvalidTakePerformanceFeesState";
      msg: "invalid take performance fees state";
    },
    {
      code: 6138;
      name: "RealizedOraclePriceTooFarOffClientProvided";
      msg: "realized oracle price too far off client provided";
    },
    {
      code: 6139;
      name: "InvalidSetupRebalanceEntropyState";
      msg: "invalid setup rebalance entropy state";
    },
    {
      code: 6140;
      name: "HedgeWithSpotMustBeTrue";
      msg: "hedge with spot must be true";
    },
    {
      code: 6141;
      name: "PowerPerpMustBeDoneRebalancing";
      msg: "power perp must be done rebalancing";
    },
    {
      code: 6142;
      name: "HedgingMustBeOn";
      msg: "hedging must be on";
    },
    {
      code: 6143;
      name: "DepositedAmountOfHedgeAssetShouldBeZero";
      msg: "deposited amount of hedge asset should be zero";
    },
    {
      code: 6144;
      name: "BorrowedAmountOfHedgeAssetShouldBeZero";
      msg: "borrowed amount of hedge asset should be zero";
    },
    {
      code: 6145;
      name: "VaultMintSupplyMustBeZeroIfEquityIsZero";
      msg: "vault mint supply must be zero if equity is zero";
    },
    {
      code: 6146;
      name: "ShouldHedgeWithSpotNotPerp";
      msg: "should hedge with spot not perp";
    },
    {
      code: 6147;
      name: "InvalidRebalanceSpotEntropyState";
      msg: "invalid rebalane spot entropy state";
    },
    {
      code: 6148;
      name: "CompleteBasePositionDoesNotMatchNormal";
      msg: "complete base position does not match normal";
    },
    {
      code: 6149;
      name: "InvalidDepositDiscretionaryState";
      msg: "invalid deposit discretionary state";
    },
    {
      code: 6150;
      name: "QuotePositionMustMoveCloserToDesired";
      msg: "quote position must move closer to desired";
    },
    {
      code: 6151;
      name: "InvalidOtcOrderPrice";
      msg: "invalid OTC order price";
    },
    {
      code: 6152;
      name: "UnhealthyEntropyAccount";
      msg: "unhealthy entropy account";
    },
    {
      code: 6153;
      name: "InvalidHedgingStrategy";
    },
    {
      code: 6154;
      name: "InvalidTargetPerpMarket";
    },
    {
      code: 6155;
      name: "InvalidHedgingPerpMarket";
    },
    {
      code: 6156;
      name: "InvalidWhitelistAccountVector";
      msg: "invalid whitelist account (vector)";
    },
    {
      code: 6157;
      name: "InvalidDaoProgramId";
      msg: "invalid dao program ID";
    },
    {
      code: 6158;
      name: "VoltMustBeForDao";
      msg: "volt must be for dao";
    },
    {
      code: 6159;
      name: "InvalidDaoAuthority";
      msg: "invalid dao authority";
    },
    {
      code: 6160;
      name: "DaoAuthorityMustSign";
      msg: "dao authority must sign";
    },
    {
      code: 6161;
      name: "InvalidWhitelistTokenAccountMint";
      msg: "invalid whitelist token account mint";
    },
    {
      code: 6162;
      name: "WhitelistTokenAccountOwnerIsNotUser";
      msg: "whitelist token account owner is not user";
    },
    {
      code: 6163;
      name: "MustNotBeLendingUnderlyingAssetMint";
      msg: "must not be lending underlying asset mint";
    },
    {
      code: 6164;
      name: "MustNotBeLendingQuoteAssetMint";
      msg: "must not be lending quote asset mint";
    },
    {
      code: 6165;
      name: "InvalidEnterSwapClaimState";
    },
    {
      code: 6166;
      name: "InvalidCurrSwapOrder";
    }
  ];
};
export const VoltIDLJsonRaw = {
  version: "0.1.0",
  name: "volt",
  instructions: [
    {
      name: "turnOffDepositsAndWithdrawals",
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
          name: "code",
          type: "u64",
        },
      ],
    },
    {
      name: "changeFees",
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
          name: "performanceFeeBps",
          type: "u64",
        },
        {
          name: "withdrawalFeeBps",
          type: "u64",
        },
        {
          name: "aumFeeBps",
          type: "u64",
        },
        {
          name: "takeFeesInUnderlying",
          type: "bool",
        },
        {
          name: "useCustomFees",
          type: "bool",
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
      name: "initializeShortOptions",
      accounts: [
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
          name: "temporaryUsdcFeePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sharedAccounts",
          accounts: [
            {
              name: "initializeBaseAccounts",
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
                  isMut: false,
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
                  name: "vaultMint",
                  isMut: true,
                  isSigner: false,
                },
                {
                  name: "depositMint",
                  isMut: false,
                  isSigner: false,
                },
                {
                  name: "depositPool",
                  isMut: true,
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
            },
            {
              name: "quoteAssetMint",
              isMut: false,
              isSigner: false,
            },
            {
              name: "auctionMetadata",
              isMut: true,
              isSigner: false,
            },
            {
              name: "permissionedMarketPremiumPool",
              isMut: true,
              isSigner: false,
            },
            {
              name: "permissionedMarketPremiumMint",
              isMut: false,
              isSigner: false,
            },
            {
              name: "quoteAssetPool",
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
          name: "args",
          type: {
            defined: "InitializeShortOptionsArgs",
          },
        },
      ],
    },
    {
      name: "changeAuctionParams",
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
          name: "auctionMetadata",
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
          name: "isPermissionless",
          type: "u64",
        },
      ],
    },
    {
      name: "startRoundShortOptions",
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
          name: "initializeStartRoundAccounts",
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
              name: "depositMint",
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
          name: "roundInfoAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
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
          ],
        },
        {
          name: "rawDerivsContract",
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
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
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
          name: "optionsProtocolAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "vaultAuthority",
              isMut: false,
              isSigner: false,
            },
            {
              name: "mintPool",
              isMut: false,
              isSigner: false,
            },
            {
              name: "optionsPrograms",
              accounts: [
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
                  name: "spreadsProgram",
                  isMut: false,
                  isSigner: false,
                },
              ],
            },
            {
              name: "rawDerivsContract",
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
              name: "underlyingAssetPool",
              isMut: true,
              isSigner: false,
            },
            {
              name: "quoteAssetPool",
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
              name: "feeDestination",
              isMut: true,
              isSigner: false,
            },
            {
              name: "tokenProgram",
              isMut: false,
              isSigner: false,
            },
          ],
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
          isMut: false,
          isSigner: true,
        },
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionsContractAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "vaultAuthority",
              isMut: false,
              isSigner: false,
            },
            {
              name: "mintPool",
              isMut: false,
              isSigner: false,
            },
            {
              name: "optionsPrograms",
              accounts: [
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
                  name: "spreadsProgram",
                  isMut: false,
                  isSigner: false,
                },
              ],
            },
            {
              name: "rawDerivsContract",
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
              name: "underlyingAssetPool",
              isMut: true,
              isSigner: false,
            },
            {
              name: "quoteAssetPool",
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
              name: "feeDestination",
              isMut: true,
              isSigner: false,
            },
            {
              name: "tokenProgram",
              isMut: false,
              isSigner: false,
            },
          ],
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
          name: "serumMarketAccounts",
          accounts: [
            {
              name: "dexProgram",
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
              name: "srmReferralAcct",
              isMut: false,
              isSigner: false,
            },
            {
              name: "market",
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
          ],
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
          name: "roundInfoAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
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
          ],
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
          name: "auctionMetadata",
          isMut: false,
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
          name: "writerTokenPool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rawDerivsContract",
          isMut: false,
          isSigner: false,
        },
        {
          name: "middlewareProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "serumMarketAccounts",
          accounts: [
            {
              name: "dexProgram",
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
              name: "srmReferralAcct",
              isMut: false,
              isSigner: false,
            },
            {
              name: "market",
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
          ],
        },
        {
          name: "market",
          isMut: true,
          isSigner: false,
        },
        {
          name: "openOrders",
          isMut: true,
          isSigner: false,
        },
        {
          name: "serumMarketAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "whitelistTokenAccount",
          isMut: false,
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
          name: "temporaryUsdcFeePool",
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
      ],
    },
    {
      name: "rebalanceEnterCreateSwap",
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
          name: "auctionMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "swapAdmin",
          isMut: false,
          isSigner: false,
        },
        {
          name: "optionPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionsContract",
          isMut: false,
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
          name: "temporaryUsdcFeePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newSwapOrder",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userOrders",
          isMut: true,
          isSigner: false,
        },
        {
          name: "givePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "receivePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "counterparty",
          isMut: false,
          isSigner: false,
        },
        {
          name: "swapProgram",
          isMut: false,
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
          name: "params",
          type: {
            defined: "CreateSwapParams",
          },
        },
        {
          name: "shouldKeepCancelled",
          type: "u64",
        },
      ],
    },
    {
      name: "rebalanceEnterClaimSwap",
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
          isMut: false,
          isSigner: false,
        },
        {
          name: "auctionMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
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
          name: "temporaryUsdcFeePool",
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
          isMut: false,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "swapOrder",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userOrders",
          isMut: true,
          isSigner: false,
        },
        {
          name: "givePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "giveMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "receivePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receiveMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "swapProgram",
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
      args: [],
    },
    {
      name: "settleTemporaryUsdcFeesEarly",
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
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "temporaryUsdcFeePool",
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
      name: "rebalanceSettle",
      accounts: [
        {
          name: "authority",
          isMut: false,
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
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundInfoAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
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
          ],
        },
        {
          name: "optionsContractAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "vaultAuthority",
              isMut: false,
              isSigner: false,
            },
            {
              name: "mintPool",
              isMut: false,
              isSigner: false,
            },
            {
              name: "optionsPrograms",
              accounts: [
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
                  name: "spreadsProgram",
                  isMut: false,
                  isSigner: false,
                },
              ],
            },
            {
              name: "rawDerivsContract",
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
              name: "underlyingAssetPool",
              isMut: true,
              isSigner: false,
            },
            {
              name: "quoteAssetPool",
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
              name: "feeDestination",
              isMut: true,
              isSigner: false,
            },
            {
              name: "tokenProgram",
              isMut: false,
              isSigner: false,
            },
          ],
        },
        {
          name: "temporaryUsdcFeePool",
          isMut: true,
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
          name: "bypassCode",
          type: "u64",
        },
      ],
    },
    {
      name: "endRoundShortOptions",
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
          name: "vaultMint",
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
          isMut: false,
          isSigner: false,
        },
        {
          name: "permissionedMarketPremiumPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "roundAccts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
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
          ],
        },
        {
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "temporaryUsdcFeePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lendingAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: false,
              isSigner: false,
            },
            {
              name: "account",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "ulFeeAcct",
          isMut: true,
          isSigner: false,
        },
        {
          name: "usdcFeeAcct",
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
          name: "bypassCode",
          type: "u64",
        },
      ],
    },
    {
      name: "initializeEntropy",
      accounts: [
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "initializeBaseAccounts",
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
              isMut: false,
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
              name: "vaultMint",
              isMut: true,
              isSigner: false,
            },
            {
              name: "depositMint",
              isMut: false,
              isSigner: false,
            },
            {
              name: "depositPool",
              isMut: true,
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
        },
        {
          name: "entropyMetadata",
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
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyCache",
          isMut: false,
          isSigner: false,
        },
        {
          name: "targetPerpMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "hedgingPerpMarket",
          isMut: false,
          isSigner: false,
        },
        {
          name: "hedgingSpotMarket",
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
          name: "args",
          type: {
            defined: "InitializeEntropyArgs",
          },
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
        {
          name: "entropyMetadata",
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
        {
          name: "shouldHedge",
          type: "u64",
        },
        {
          name: "hedgeWithSpot",
          type: "u64",
        },
      ],
    },
    {
      name: "takePerformanceAndAumFeesEntropy",
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
        {
          name: "entropyMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: false,
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
          name: "entropyBaseAccounts",
          accounts: [
            {
              name: "extraVoltData",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: true,
              isSigner: false,
            },
            {
              name: "account",
              isMut: true,
              isSigner: false,
            },
            {
              name: "cache",
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
          ],
        },
        {
          name: "openOrders",
          isMut: false,
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
          name: "depositMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyBaseAccounts",
          accounts: [
            {
              name: "extraVoltData",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: true,
              isSigner: false,
            },
            {
              name: "account",
              isMut: true,
              isSigner: false,
            },
            {
              name: "cache",
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
          ],
        },
        {
          name: "initializeStartRoundAccounts",
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
              name: "depositMint",
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
        },
        {
          name: "entropyRound",
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
          name: "depositPool",
          isMut: false,
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
          name: "entropyBaseAccounts",
          accounts: [
            {
              name: "extraVoltData",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: true,
              isSigner: false,
            },
            {
              name: "account",
              isMut: true,
              isSigner: false,
            },
            {
              name: "cache",
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
          ],
        },
        {
          name: "lendingAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: false,
              isSigner: false,
            },
            {
              name: "account",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "openOrders",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: false,
          isSigner: false,
        },
        {
          name: "feeAcct",
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
      args: [
        {
          name: "bypassCode",
          type: "u64",
        },
      ],
    },
    {
      name: "setupRebalanceEntropy",
      accounts: [
        {
          name: "authority",
          isMut: false,
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
          name: "depositMint",
          isMut: false,
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
          name: "roundAccts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
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
          ],
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
          name: "entropyBaseAccounts",
          accounts: [
            {
              name: "extraVoltData",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: true,
              isSigner: false,
            },
            {
              name: "account",
              isMut: true,
              isSigner: false,
            },
            {
              name: "cache",
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
          ],
        },
        {
          name: "targetPerpMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "spotPerpMarket",
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
      ],
      args: [
        {
          name: "expectedOraclePx",
          type: "f64",
        },
      ],
    },
    {
      name: "rebalanceIntoPerpEntropy",
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
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "entropyBaseAccounts",
          accounts: [
            {
              name: "extraVoltData",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: true,
              isSigner: false,
            },
            {
              name: "account",
              isMut: true,
              isSigner: false,
            },
            {
              name: "cache",
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
          ],
        },
        {
          name: "eventQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "targetPerpEventQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "openOrders",
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
          name: "targetPerpMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "hedgingPerpMarket",
          isMut: true,
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
          name: "params",
          type: {
            defined: "EntropyPlaceOrderParams",
          },
        },
        {
          name: "forceHedgeFirst",
          type: "bool",
        },
      ],
    },
    {
      name: "rebalanceIntoSpotEntropy",
      accounts: [
        {
          name: "authority",
          isMut: false,
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
          name: "dexProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "entropyBaseAccounts",
          accounts: [
            {
              name: "extraVoltData",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: true,
              isSigner: false,
            },
            {
              name: "account",
              isMut: true,
              isSigner: false,
            },
            {
              name: "cache",
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
          ],
        },
        {
          name: "targetPerpEventQueue",
          isMut: false,
          isSigner: false,
        },
        {
          name: "targetPerpMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "spotMarket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "openOrders",
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
          name: "dexRequestQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "dexEventQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "dexBase",
          isMut: true,
          isSigner: false,
        },
        {
          name: "dexQuote",
          isMut: true,
          isSigner: false,
        },
        {
          name: "quoteVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: false,
          isSigner: false,
        },
        {
          name: "dexSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "msrmOrSrmVault",
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
          name: "params",
          type: {
            defined: "EntropyPlaceOrderParams",
          },
        },
      ],
    },
    {
      name: "initSpotOpenOrdersEntropy",
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
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
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
          name: "spotMarket",
          isMut: true,
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
          name: "signer",
          isMut: false,
          isSigner: false,
        },
        {
          name: "dexSigner",
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
      name: "initializePrincipalProtection",
      accounts: [
        {
          name: "voltVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "principalProtectionVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "initializeAccounts",
          accounts: [
            {
              name: "initializeBaseAccounts",
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
                  isMut: false,
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
                  name: "vaultMint",
                  isMut: true,
                  isSigner: false,
                },
                {
                  name: "depositMint",
                  isMut: false,
                  isSigner: false,
                },
                {
                  name: "depositPool",
                  isMut: true,
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
            },
            {
              name: "quoteAssetMint",
              isMut: false,
              isSigner: false,
            },
            {
              name: "auctionMetadata",
              isMut: true,
              isSigner: false,
            },
            {
              name: "permissionedMarketPremiumPool",
              isMut: true,
              isSigner: false,
            },
            {
              name: "permissionedMarketPremiumMint",
              isMut: false,
              isSigner: false,
            },
            {
              name: "quoteAssetPool",
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
        },
        {
          name: "tulipAccounts",
          accounts: [
            {
              name: "vault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "sharesMint",
              isMut: false,
              isSigner: false,
            },
          ],
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
          name: "args",
          type: {
            defined: "InitializePrincipalProtectionArgs",
          },
        },
      ],
    },
    {
      name: "startRoundPrincipalProtection",
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
          name: "ppVault",
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
          name: "depositMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "initializeStartRoundAccounts",
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
              name: "depositMint",
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
        },
        {
          name: "ppContextAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "ppVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "depositTrackingAccount",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingSharesPool",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingVault",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingVaultProgram",
              isMut: false,
              isSigner: false,
            },
          ],
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
      name: "initTulipAccounts",
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
          name: "ppVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lendingSharesPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositIntoLendingAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tulipVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositTrackingAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTrackingQueue",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTrackingHold",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sharesMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositTrackingPda",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
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
      args: [],
    },
    {
      name: "deployLending",
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
          name: "ppVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "ppContextAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "ppVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "depositTrackingAccount",
              isMut: true,
              isSigner: false,
            },
            {
              name: "depositTrackingPda",
              isMut: false,
              isSigner: false,
            },
            {
              name: "optionTokenPool",
              isMut: false,
              isSigner: false,
            },
            {
              name: "sharesMint",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingSharesPool",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingVault",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingVaultPda",
              isMut: false,
              isSigner: false,
            },
            {
              name: "lendingVaultProgram",
              isMut: false,
              isSigner: false,
            },
          ],
        },
        {
          name: "depositIntoLendingAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lendingVaultUlAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "globalTulipV2Authority",
          isMut: false,
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
      name: "endRoundPrincipalProtection",
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
          name: "ppVault",
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
          name: "depositMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "ppContextAccounts",
          accounts: [
            {
              name: "voltVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "ppVault",
              isMut: false,
              isSigner: false,
            },
            {
              name: "depositTrackingAccount",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingSharesPool",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingVault",
              isMut: true,
              isSigner: false,
            },
            {
              name: "lendingVaultProgram",
              isMut: false,
              isSigner: false,
            },
          ],
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
          name: "payerAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nonPayerAuthority",
          isMut: false,
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
          name: "userVaultTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userUlTokens",
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
          name: "payerAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nonPayerAuthority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "solTransferAuthority",
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
          name: "userVaultTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userUlTokens",
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
          name: "pendingDepositRoundUnderlyingTokens",
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
          name: "payerAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nonPayerAuthority",
          isMut: false,
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
      name: "withdrawWithClaim",
      accounts: [
        {
          name: "payerAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nonPayerAuthority",
          isMut: false,
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
          name: "pendingWithdrawalRoundInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingWithdrawalRoundUnderlyingTokensForPws",
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
      name: "cancelPendingDeposit",
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
      ],
      args: [],
    },
    {
      name: "cancelPendingWithdrawal",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "vaultMint",
          isMut: true,
          isSigner: false,
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
      ],
      args: [],
    },
    {
      name: "claimPendingDeposit",
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
      name: "dummyInstruction",
      accounts: [
        {
          name: "entropyBaseAccounts",
          accounts: [
            {
              name: "extraVoltData",
              isMut: false,
              isSigner: false,
            },
            {
              name: "program",
              isMut: false,
              isSigner: false,
            },
            {
              name: "group",
              isMut: false,
              isSigner: false,
            },
            {
              name: "cache",
              isMut: false,
              isSigner: false,
            },
            {
              name: "account",
              isMut: false,
              isSigner: false,
            },
          ],
        },
      ],
      args: [],
    },
    {
      name: "includeOptionsProgramsAccounts",
      accounts: [
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
          name: "spreadsProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initSerumMarket",
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
          name: "voltVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "auctionMetadata",
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
      name: "AuctionMetadata",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isPermissionless",
            type: "bool",
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
            name: "userOrders",
            type: "publicKey",
          },
          {
            name: "currSwapOrder",
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
            name: "participantType",
            type: "u64",
          },
          {
            name: "optionType",
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
            name: "unusedFloatOne",
            type: "f64",
          },
          {
            name: "unusedFloatFour",
            type: "f64",
          },
          {
            name: "unusedFloatFive",
            type: "f64",
          },
          {
            name: "unusedFloatSix",
            type: "f64",
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
            name: "spotOpenOrders",
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
            name: "targetCurrBasePosition",
            type: "f64",
          },
          {
            name: "targetCurrQuotePosition",
            type: "f64",
          },
          {
            name: "hedgeLenience",
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
            name: "hedgeWithSpot",
            type: "bool",
          },
          {
            name: "otcSetupRebalanceBlock",
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
            name: "depositAmtQuote",
            type: "f64",
          },
          {
            name: "withdrawCompFromDepositNative",
            type: "u64",
          },
          {
            name: "netDepositsQuote",
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
            name: "number",
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
            name: "targetCurrBasePosition",
            type: "f64",
          },
          {
            name: "targetCurrQuotePosition",
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
            name: "aumInDepositTokenAtEpochStart",
            type: "u64",
          },
          {
            name: "aumInDepositTokenAtEpochEnd",
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
            name: "aumFees",
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
            name: "startRoundTime",
            type: "u64",
          },
          {
            name: "beginAuctionTime",
            type: "u64",
          },
          {
            name: "endAuctionTime",
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
            name: "heldAsidePerformanceFees",
            type: "u64",
          },
          {
            name: "lastSwapSize",
            type: "u64",
          },
          {
            name: "totalWithdrawalsFromRealms",
            type: "u64",
          },
          {
            name: "totalDepositsFromRealms",
            type: "u64",
          },
          {
            name: "dovPerformanceFeesInUnderlying",
            type: "bool",
          },
          {
            name: "usedOtcOrders",
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
            name: "targetPerpMarket",
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
            name: "hedgingPerpMarket",
            type: "publicKey",
          },
          {
            name: "entropyMetadata",
            type: "publicKey",
          },
          {
            name: "hedgingSpotMarket",
            type: "publicKey",
          },
          {
            name: "auctionMetadata",
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
            name: "unusedUintOne",
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
            name: "timeLastTookAumFees",
            type: "u64",
          },
          {
            name: "unusedUint1234",
            type: "u64",
          },
          {
            name: "aumFeeBps",
            type: "u64",
          },
          {
            name: "useCustomFees",
            type: "u64",
          },
          {
            name: "performanceFeeBps",
            type: "u64",
          },
          {
            name: "withdrawalFeeBps",
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
            name: "dovPerformanceFeesInUnderlying",
            type: "bool",
          },
          {
            name: "doneRebalancingTargetPerp",
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
      name: "PrincipalProtectionVaultV1",
      type: {
        kind: "struct",
        fields: [
          {
            name: "initialized",
            type: "bool",
          },
          {
            name: "vaultName",
            type: "string",
          },
          {
            name: "keys",
            type: {
              defined: "PrincipalProtectionAccountsV1",
            },
          },
          {
            name: "allocationStrategy",
            type: {
              defined: "SecondLegAllocationStrategy",
            },
          },
          {
            name: "lendingStrategy",
            type: {
              defined: "LendingStrategy",
            },
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
            name: "aumInDepositTokenAtEpochStart",
            type: "u64",
          },
          {
            name: "aumInDepositTokenAtEpochEnd",
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
            name: "currOptionWasSettledFirstTime",
            type: "bool",
          },
          {
            name: "mustSwapQuoteAssetAfterSettle",
            type: "bool",
          },
          {
            name: "nextOptionWasSet",
            type: "bool",
          },
          {
            name: "mustSwapPremiumAfterEnter",
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
            name: "aumInDepositTokenAtEpochStart",
            type: "u64",
          },
          {
            name: "aumInDepositTokenAtEpochEnd",
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
            name: "depositMint",
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
            name: "optionsContract",
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
            name: "mustSwapUsdcFeesAfterSettle",
            type: "u8",
          },
          {
            name: "finishedSettlingOption",
            type: "u8",
          },
          {
            name: "voltType",
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
            name: "vaultAuthorityBump",
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
  ],
  types: [
    {
      name: "SerumOrderPreferences",
      type: {
        kind: "struct",
        fields: [
          {
            name: "limit",
            type: "u16",
          },
          {
            name: "orderType",
            type: {
              defined: "OrderType",
            },
          },
          {
            name: "selfTradeBehavior",
            type: {
              defined: "SelfTradeBehavior",
            },
          },
        ],
      },
    },
    {
      name: "CreateSwapParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "giveSize",
            type: "u64",
          },
          {
            name: "receiveSize",
            type: "u64",
          },
          {
            name: "expiry",
            type: "u64",
          },
          {
            name: "isCounterpartyProvided",
            type: "bool",
          },
          {
            name: "isWhitelisted",
            type: "bool",
          },
          {
            name: "enforceMintMatch",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "VoltBumps",
      type: {
        kind: "struct",
        fields: [
          {
            name: "vaultAuthorityBump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "InitializeArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "vaultName",
            type: "string",
          },
          {
            name: "capacity",
            type: "u64",
          },
          {
            name: "individualCapacity",
            type: "u64",
          },
          {
            name: "bumps",
            type: {
              defined: "VoltBumps",
            },
          },
        ],
      },
    },
    {
      name: "SerumArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "orderSizeOptions",
            type: "u64",
          },
          {
            name: "orderType",
            type: "u64",
          },
          {
            name: "selfTradeBehavior",
            type: "u16",
          },
        ],
      },
    },
    {
      name: "OptionsContractArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "participantType",
            type: {
              defined: "DovParticipantType",
            },
          },
          {
            name: "optionType",
            type: {
              defined: "OptionType",
            },
          },
          {
            name: "expirationInterval",
            type: "u64",
          },
          {
            name: "underlyingAmountPerContract",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "InitializeDovArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "serumArgs",
            type: {
              defined: "SerumArgs",
            },
          },
          {
            name: "optionsArgs",
            type: {
              defined: "OptionsContractArgs",
            },
          },
          {
            name: "permissionlessAuctions",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "InitializeShortOptionsArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "baseArgs",
            type: {
              defined: "InitializeArgs",
            },
          },
          {
            name: "dovArgs",
            type: {
              defined: "InitializeDovArgs",
            },
          },
        ],
      },
    },
    {
      name: "InitializePrincipalProtectionArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "baseArgs",
            type: {
              defined: "InitializeArgs",
            },
          },
          {
            name: "dovArgs",
            type: {
              defined: "InitializeDovArgs",
            },
          },
          {
            name: "allocationStrategy",
            type: {
              defined: "SecondLegAllocationStrategy",
            },
          },
          {
            name: "lendingStrategy",
            type: {
              defined: "LendingStrategy",
            },
          },
        ],
      },
    },
    {
      name: "InitializeEntropyArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "baseArgs",
            type: {
              defined: "InitializeArgs",
            },
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
            name: "shouldHedge",
            type: "bool",
          },
          {
            name: "hedgeWithSpot",
            type: "bool",
          },
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
        ],
      },
    },
    {
      name: "PrincipalProtectionAccountsV1",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lendingKeys",
            type: {
              defined: "LendingKeys",
            },
          },
          {
            name: "optionsKeys",
            type: {
              defined: "OptionsContractKeys",
            },
          },
          {
            name: "lendingSharesPool",
            type: "publicKey",
          },
          {
            name: "depositIntoLendingAta",
            type: "publicKey",
          },
          {
            name: "extraKey1",
            type: "publicKey",
          },
          {
            name: "extraKey2",
            type: "publicKey",
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
        ],
      },
    },
    {
      name: "OptionsContractKeys",
      type: {
        kind: "struct",
        fields: [
          {
            name: "programId",
            type: "publicKey",
          },
          {
            name: "optionsContract",
            type: "publicKey",
          },
          {
            name: "optionTokenPool",
            type: "publicKey",
          },
          {
            name: "extraKey1",
            type: "publicKey",
          },
          {
            name: "extraKey2",
            type: "publicKey",
          },
          {
            name: "extraKey3",
            type: "publicKey",
          },
          {
            name: "extraKey4",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "EntropyPlaceOrderParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "clientBidPrice",
            type: "u64",
          },
          {
            name: "clientAskPrice",
            type: "u64",
          },
          {
            name: "maxQuotePosChange",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "LendingParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bool1",
            type: "u8",
          },
          {
            name: "bool2",
            type: "u8",
          },
          {
            name: "bool3",
            type: "u8",
          },
          {
            name: "bool4",
            type: "u8",
          },
          {
            name: "maxAllowedUtilizationBps",
            type: "u64",
          },
          {
            name: "unusedUint1",
            type: "u64",
          },
          {
            name: "unusedUint2",
            type: "u64",
          },
          {
            name: "unusedUint3",
            type: "u64",
          },
          {
            name: "unusedUint4",
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
        ],
      },
    },
    {
      name: "PrimaryVaultKeys",
      type: {
        kind: "struct",
        fields: [
          {
            name: "vault",
            type: "publicKey",
          },
          {
            name: "vaultPda",
            type: "publicKey",
          },
          {
            name: "underlyingDepositQueue",
            type: "publicKey",
          },
          {
            name: "underlyingWithdrawQueue",
            type: "publicKey",
          },
          {
            name: "sharesMint",
            type: "publicKey",
          },
          {
            name: "underlyingMint",
            type: "publicKey",
          },
          {
            name: "depositTrackingAccount",
            type: "publicKey",
          },
          {
            name: "depositTrackingQueueAccount",
            type: "publicKey",
          },
          {
            name: "depositTrackingHoldAccount",
            type: "publicKey",
          },
          {
            name: "depositTrackingPda",
            type: "publicKey",
          },
          {
            name: "programId",
            type: "publicKey",
          },
          {
            name: "extraKey1",
            type: "publicKey",
          },
          {
            name: "extraKey2",
            type: "publicKey",
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
        ],
      },
    },
    {
      name: "LendingKeys",
      type: {
        kind: "struct",
        fields: [
          {
            name: "primaryVault",
            type: {
              defined: "PrimaryVaultKeys",
            },
          },
          {
            name: "mangoVault",
            type: "publicKey",
          },
          {
            name: "solendVault",
            type: "publicKey",
          },
          {
            name: "tulipVault",
            type: "publicKey",
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
      name: "DovParticipantType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "OptionSeller",
          },
          {
            name: "OptionBuyer",
          },
        ],
      },
    },
    {
      name: "OptionType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Call",
          },
          {
            name: "Put",
          },
        ],
      },
    },
    {
      name: "ExecutionType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Spot",
          },
          {
            name: "Perp",
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
          {
            name: "PrincipalProtection",
          },
        ],
      },
    },
    {
      name: "SecondLegAllocationStrategy",
      type: {
        kind: "enum",
        variants: [
          {
            name: "MinApr",
            fields: [
              {
                name: "apr",
                type: "u64",
              },
            ],
          },
          {
            name: "ProjectedPnlFraction",
            fields: [
              {
                name: "fraction_bps",
                type: "u64",
              },
            ],
          },
          {
            name: "FixedFraction",
            fields: [
              {
                name: "fraction_bps",
                type: "u64",
              },
            ],
          },
          {
            name: "ExtraStrategy1",
            fields: [
              {
                name: "uint1",
                type: "u64",
              },
              {
                name: "uint2",
                type: "u64",
              },
              {
                name: "uint3",
                type: "u64",
              },
              {
                name: "uint4",
                type: "u64",
              },
              {
                name: "u81",
                type: "u8",
              },
              {
                name: "u82",
                type: "u8",
              },
              {
                name: "u83",
                type: "u8",
              },
              {
                name: "u84",
                type: "u8",
              },
            ],
          },
        ],
      },
    },
    {
      name: "LendingStrategy",
      type: {
        kind: "enum",
        variants: [
          {
            name: "TulipOptimizer",
            fields: [
              {
                name: "params",
                type: {
                  defined: "LendingParams",
                },
              },
            ],
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidVoltType",
      msg: "invalid volt type",
    },
    {
      code: 6001,
      name: "VaultNameMustBeNonZeroLength",
      msg: "vault name must be zero length",
    },
    {
      code: 6002,
      name: "ExpirationIsInThePast",
      msg: "Expiration must be in the future",
    },
    {
      code: 6003,
      name: "FeeOwnerDoesNotMatchProgram",
      msg: "Fee owner does not match the program's fee owner",
    },
    {
      code: 6004,
      name: "MintFeeMustBeOwnedByFeeOwner",
      msg: "Mint fee account must be owned by the FEE_OWNER",
    },
    {
      code: 6005,
      name: "ExerciseFeeMustBeOwnedByFeeOwner",
      msg: "Exercise fee account must be owned by the FEE_OWNER",
    },
    {
      code: 6006,
      name: "UnderlyingDestMintDoesNotMatchUnderlyingAsset",
      msg: "Underlying destination mint must match underlying asset mint address",
    },
    {
      code: 6007,
      name: "FeeAccountOwnerDoesNotMatch",
      msg: "fee account owner does not match expected",
    },
    {
      code: 6008,
      name: "FeeAccountMintDoesNotMatchDepositPoolOrPermissionedPremium",
      msg: "fee account mint does not match deposit pool or permissioned market premium",
    },
    {
      code: 6009,
      name: "MustHaveLastTimeTookAumFees",
      msg: "please end an epoch and get a time last took aum fees",
    },
    {
      code: 6010,
      name: "InvalidFeeAccount",
    },
    {
      code: 6011,
      name: "NumberOverflow",
      msg: "Numerical overflow",
    },
    {
      code: 6012,
      name: "InvalidOrderType",
      msg: "Invalid order type",
    },
    {
      code: 6013,
      name: "InvalidSelfTradeBehavior",
      msg: "Invalid self trade behavior",
    },
    {
      code: 6014,
      name: "Unauthorized",
      msg: "Unauthorized.",
    },
    {
      code: 6015,
      name: "InsufficientVaultTokens",
      msg: "Insufficient Vault tokens to redeem.",
    },
    {
      code: 6016,
      name: "InvalidSetNextOptionState",
      msg: "invalid time to set next option",
    },
    {
      code: 6017,
      name: "InvalidRebalancePrepareState",
      msg: "invalid time to call rebalancePrepare()",
    },
    {
      code: 6018,
      name: "InvalidRebalanceSettleState",
      msg: "invalid rebalance settle state",
    },
    {
      code: 6019,
      name: "InvalidRebalanceEnterState",
      msg: "invalid rebalance enter state",
    },
    {
      code: 6020,
      name: "InvalidSwapPremiumState",
      msg: "invalid rebalance swap premium state",
    },
    {
      code: 6021,
      name: "InvalidStartRoundState",
      msg: "invalid start round state",
    },
    {
      code: 6022,
      name: "InvalidEndRoundState",
      msg: "invalid end round state",
    },
    {
      code: 6023,
      name: "InvalidInitSerumMarketState",
      msg: "invalid init serum market state",
    },
    {
      code: 6024,
      name: "InvalidResetOptionMarketState",
      msg: "must not have sold option tokens to reset",
    },
    {
      code: 6025,
      name: "PermissionedMarketPremiumPoolAmountMustBeZero",
      msg: "permissioned market premium pool amount must be zero",
    },
    {
      code: 6026,
      name: "PremiumPoolAmountMustBeZero",
      msg: "premium pool amount must be zero",
    },
    {
      code: 6027,
      name: "PremiumPoolAmountMustBeGreaterThanZero",
      msg: "premium pool amount must be greater than zero",
    },
    {
      code: 6028,
      name: "MintOptionMustMatchSetOption",
      msg: "mint option must match set option",
    },
    {
      code: 6029,
      name: "RoundHasNotEnded",
    },
    {
      code: 6030,
      name: "MustSwapPremiumAfterEnter",
    },
    {
      code: 6031,
      name: "NoValidShortOptionsEpochStage",
      msg: "no valid short options epoch stage",
    },
    {
      code: 6032,
      name: "InvalidCallToShortOptionsEpochStage",
      msg: "invalid call to short options epoch stage",
    },
    {
      code: 6033,
      name: "InvalidSettleFeesEarly",
    },
    {
      code: 6034,
      name: "InsufficientCollateralForDeposit",
      msg: "Insufficient collateral to deposit.",
    },
    {
      code: 6035,
      name: "InstantTransfersMustBeDisabled",
      msg: "instant transfers must be enabled",
    },
    {
      code: 6036,
      name: "VaultCapacityWouldBeExceeded",
      msg: "vault capacity would be exceeded",
    },
    {
      code: 6037,
      name: "IndividualDepositCapacityWouldBeExceeded",
      msg: "individual deposit capacity would be exceeded",
    },
    {
      code: 6038,
      name: "DepositsAndWithdrawalsAreTurnedOff",
      msg: "deposits and withdrawals are turned off",
    },
    {
      code: 6039,
      name: "WithdrawalsDisabled",
      msg: "invalid time to withdraw",
    },
    {
      code: 6040,
      name: "DepositsDisabled",
      msg: "invalid time to deposit",
    },
    {
      code: 6041,
      name: "InvalidDepositAmount",
      msg: "invalid deposit amount (must be greater than zero)",
    },
    {
      code: 6042,
      name: "InvalidWithdrawAmount",
      msg: "invalid withdraw amount",
    },
    {
      code: 6043,
      name: "InvalidPendingDepositKey",
      msg: "invalid pending deposit key",
    },
    {
      code: 6044,
      name: "CantHaveMultiplePendingDeposits",
      msg: "shouldn't have multiple pending deposits",
    },
    {
      code: 6045,
      name: "InvalidClaimPendingDepositState",
      msg: "invalid claim pending state",
    },
    {
      code: 6046,
      name: "CantHaveMultiplePendingWithdrawals",
      msg: "shouldn't have multiple pending deposits",
    },
    {
      code: 6047,
      name: "InvalidClaimPendingWithdrawalState",
      msg: "invalid claim pending withdrawal state",
    },
    {
      code: 6048,
      name: "PendingWithdrawalInfoNotInitialized",
      msg: "pending withdrawal info must be initialized",
    },
    {
      code: 6049,
      name: "PendingWithdrawalDoesNotExist",
      msg: "pending withdrawal does not exist",
    },
    {
      code: 6050,
      name: "CannotCancelPendingWithdrawalFromOldRound",
      msg: "cannot cancel pending withdrawal from old round",
    },
    {
      code: 6051,
      name: "PendingDepositInfoNotInitialized",
      msg: "pending deposit info not initialized",
    },
    {
      code: 6052,
      name: "PendingDepositDoesNotExist",
      msg: "pending deposits does not exist",
    },
    {
      code: 6053,
      name: "CannotCancelPendingDepositFromOldRound",
      msg: "cannot cancel pending deposit from old round",
    },
    {
      code: 6054,
      name: "InvalidRoundForCancel",
      msg: "invalid round number for cancel pending deposit/withdrawal",
    },
    {
      code: 6055,
      name: "InvalidEpochForCancel",
      msg: "invalid epoch number for cancel pending deposit/withdrawal",
    },
    {
      code: 6056,
      name: "PendingDepositAlreadyExists",
      msg: "pending deposit already exists",
    },
    {
      code: 6057,
      name: "InvalidPendingWithdrawalKey",
      msg: "invalid pending withdrawal key",
    },
    {
      code: 6058,
      name: "InvalidPendingWithdrawalState",
    },
    {
      code: 6059,
      name: "InvalidExpiry",
      msg: "invalid expiry for contract",
    },
    {
      code: 6060,
      name: "NewOptionMustHaveExactExpiry",
      msg: "new option has roughly target expiry (within lower/upper bounds)",
    },
    {
      code: 6061,
      name: "InvalidUnderlyingAsset",
      msg: "new option has wrong underlying asset",
    },
    {
      code: 6062,
      name: "InvalidQuoteAsset",
      msg: "new option has wrong quote asset",
    },
    {
      code: 6063,
      name: "InvalidContractSize",
      msg: "new option has wrong contract size",
    },
    {
      code: 6064,
      name: "InvalidStrike",
      msg: "new option has invalid strike",
    },
    {
      code: 6065,
      name: "InvalidVaultTokenAccount",
      msg: "vault mint does not match user token account",
    },
    {
      code: 6066,
      name: "InvalidDepositTokenAccount",
      msg: "deposit pool mint does not match user token account",
    },
    {
      code: 6067,
      name: "InvalidSerumProgramId",
      msg: "DEX program id does not match",
    },
    {
      code: 6068,
      name: "InvalidOptionsProtocol",
      msg: "option market should be owned by a whitelisted protocol (e.g soloptions, spreads, inertia)",
    },
    {
      code: 6069,
      name: "InvalidDepositMint",
      msg: "underlying asset mint does not match voltvault",
    },
    {
      code: 6070,
      name: "InvalidVaultMint",
      msg: "vault mint does not match volt vault",
    },
    {
      code: 6071,
      name: "InvalidVaultAuthority",
      msg: "vault authority does not match",
    },
    {
      code: 6072,
      name: "InvalidOptionsContract",
      msg: "option market does not match volt vault",
    },
    {
      code: 6073,
      name: "InvalidWriterTokenPool",
      msg: "writer token pool does not match volt vault",
    },
    {
      code: 6074,
      name: "InvalidWriterTokenMint",
      msg: "writer token mint does not match volt vault",
    },
    {
      code: 6075,
      name: "InvalidOptionTokenMint",
      msg: "option token mint does not match volt vault",
    },
    {
      code: 6076,
      name: "InvalidPermissionedMarketPremiumMint",
      msg: "invalid permissioned market premium mint",
    },
    {
      code: 6077,
      name: "RoundVoltTokensMintDoesNotMatchVoltVault",
      msg: "round volt tokens mint does not match volt vault",
    },
    {
      code: 6078,
      name: "RoundUnderlyingTokensMintDoesNotMatchVoltVault",
      msg: "round underlying tokens mint does not match volt vault",
    },
    {
      code: 6079,
      name: "DepositPoolDoesNotMatchOptionMarket",
      msg: "UnderlyingAssetPoolDoesNotMatchOptionMarket",
    },
    {
      code: 6080,
      name: "UnderlyingOpenOrdersDoesNotMatchVoltVault",
      msg: "underlying open orders does not match volt vault",
    },
    {
      code: 6081,
      name: "DepositPoolDoesNotMatchVoltVault",
      msg: "DepositPoolDoesNotMatchVoltVault",
    },
    {
      code: 6082,
      name: "MintDoesNotMatchOptionsContract",
      msg: "option mint does not match option market",
    },
    {
      code: 6083,
      name: "VaultDestinationDoesNotMatchVoltVault",
      msg: "vault destination does not match volt vault",
    },
    {
      code: 6084,
      name: "SolTransferAuthorityMustNotBeOwnedByVoltProgram",
      msg: "sol transfer authority must be owned by volt program",
    },
    {
      code: 6085,
      name: "SolTransferAuthorityMustBeWritableAndSigner",
      msg: "sol transfer authority must be writable/signer",
    },
    {
      code: 6086,
      name: "ShouldBeUnreachable",
      msg: "should be unreachable code",
    },
    {
      code: 6087,
      name: "UserIsNotSigner",
      msg: "user is not signer",
    },
    {
      code: 6088,
      name: "CantCloseNonEmptyTokenAccount",
      msg: "can't close non empty token account",
    },
    {
      code: 6089,
      name: "CantCloseAccountUnlessEmpty",
      msg: "cannot close account unless empty",
    },
    {
      code: 6090,
      name: "DiscriminatorDoesNotMatch",
      msg: "discriminator does not match",
    },
    {
      code: 6091,
      name: "InvalidOracleType",
      msg: "invalid oracle type",
    },
    {
      code: 6092,
      name: "UnexpectedRemainingAssets",
      msg: "unexpected remaining assets",
    },
    {
      code: 6093,
      name: "AlreadyInitialized",
      msg: "cannot reinitialize an (already initialized) volt",
    },
    {
      code: 6094,
      name: "TransferAuthorityMustSign",
      msg: "transfer authority must sign",
    },
    {
      code: 6095,
      name: "InvalidRoundNumber",
    },
    {
      code: 6096,
      name: "InvalidTokenAccount",
    },
    {
      code: 6097,
      name: "InvalidPDA",
    },
    {
      code: 6098,
      name: "InvalidAccount",
    },
    {
      code: 6099,
      name: "InvalidWhitelistAuthority",
      msg: "authority does not match whitelist admin",
    },
    {
      code: 6100,
      name: "InvalidSerumMarketPda",
      msg: "whitelist and option market do not generate correct PDA",
    },
    {
      code: 6101,
      name: "InvalidMiddlewareProgramId",
      msg: "middleware program id does not match expected",
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
      name: "RequiresMakerAccessToken",
      msg: "must have at least one market maker access token",
    },
    {
      code: 6106,
      name: "OpenOrderMustBeEmptyToClose",
      msg: "open orders must be empty to close",
    },
    {
      code: 6107,
      name: "PriceTooLow",
    },
    {
      code: 6108,
      name: "PriceTooHigh",
    },
    {
      code: 6109,
      name: "OrderSizeZero",
    },
    {
      code: 6110,
      name: "UnsupportedOrderStrategy",
    },
    {
      code: 6111,
      name: "InvalidMarketType",
    },
    {
      code: 6112,
      name: "InvalidOpenOrders",
    },
    {
      code: 6113,
      name: "NoOpenOrders",
    },
    {
      code: 6114,
      name: "InsufficientFundsToBid",
    },
    {
      code: 6115,
      name: "InsufficientFundsToOffer",
    },
    {
      code: 6116,
      name: "MustTakeWithdrawalFeesBeforeStartingRound",
      msg: "must take withdrawal fees before starting round",
    },
    {
      code: 6117,
      name: "InvalidEndEntropyRoundState",
      msg: "entropy: invalid end entropy round state",
    },
    {
      code: 6118,
      name: "CantFindPerpMarketIndex",
      msg: "can't find perp market index",
    },
    {
      code: 6119,
      name: "AccountEquityLessThanZero",
      msg: "account equity less than zero",
    },
    {
      code: 6120,
      name: "QuotePositionChangedTooMuch",
      msg: "quote position changed too much",
    },
    {
      code: 6121,
      name: "MustMoveCloserToTargetCollateralization",
      msg: "must move closer to target collateralization",
    },
    {
      code: 6122,
      name: "CollateralNotWithinLenience",
      msg: "collateral not within lenience",
    },
    {
      code: 6123,
      name: "InvalidRebalanceEntropyState",
      msg: "invalid rebalance entropy state",
    },
    {
      code: 6124,
      name: "BasePositionMustBeNegative",
      msg: "volt must have negative base position (be short)",
    },
    {
      code: 6125,
      name: "QuotePositionMustBePositive",
      msg: "volt must have positive quote position (be short)",
    },
    {
      code: 6126,
      name: "TargetCollateralRatioMustBeNegative",
      msg: "target collateral ratio must be neggat",
    },
    {
      code: 6127,
      name: "NewEquityMustBeHigherThanDepositAmount",
      msg: "new equity must be higher than deposit amt",
    },
    {
      code: 6128,
      name: "RebalanceMustBeReady",
      msg: "rebalance must be ready",
    },
    {
      code: 6129,
      name: "IncorrectHedge",
      msg: "spot hedge unbalanced",
    },
    {
      code: 6130,
      name: "VaultDoesNotSupportOverLeveragedStrategies",
      msg: "vault does not support over leveraged strategies",
    },
    {
      code: 6131,
      name: "LenienceMustBeGreaterThanZero",
      msg: "lenience must be greater than zero",
    },
    {
      code: 6132,
      name: "LenienceShouldNotBeGreaterThanLeverage",
      msg: "lenience should not be greater than leverage",
    },
    {
      code: 6133,
      name: "HedgeLenienceMustBeGreaterThanZero",
      msg: "hedge lenience should be greater than leverage",
    },
    {
      code: 6134,
      name: "VaultDoesNotSupportExitEarlyOverLeveragedStrategies",
      msg: "exit early ratio must be < 1.0",
    },
    {
      code: 6135,
      name: "ShouldBeDoneRebalancing",
      msg: "should be done rebalancing",
    },
    {
      code: 6136,
      name: "UnrecognizedEntropyProgramId",
      msg: "unrecognized entropy program id",
    },
    {
      code: 6137,
      name: "InvalidTakePerformanceFeesState",
      msg: "invalid take performance fees state",
    },
    {
      code: 6138,
      name: "RealizedOraclePriceTooFarOffClientProvided",
      msg: "realized oracle price too far off client provided",
    },
    {
      code: 6139,
      name: "InvalidSetupRebalanceEntropyState",
      msg: "invalid setup rebalance entropy state",
    },
    {
      code: 6140,
      name: "HedgeWithSpotMustBeTrue",
      msg: "hedge with spot must be true",
    },
    {
      code: 6141,
      name: "PowerPerpMustBeDoneRebalancing",
      msg: "power perp must be done rebalancing",
    },
    {
      code: 6142,
      name: "HedgingMustBeOn",
      msg: "hedging must be on",
    },
    {
      code: 6143,
      name: "DepositedAmountOfHedgeAssetShouldBeZero",
      msg: "deposited amount of hedge asset should be zero",
    },
    {
      code: 6144,
      name: "BorrowedAmountOfHedgeAssetShouldBeZero",
      msg: "borrowed amount of hedge asset should be zero",
    },
    {
      code: 6145,
      name: "VaultMintSupplyMustBeZeroIfEquityIsZero",
      msg: "vault mint supply must be zero if equity is zero",
    },
    {
      code: 6146,
      name: "ShouldHedgeWithSpotNotPerp",
      msg: "should hedge with spot not perp",
    },
    {
      code: 6147,
      name: "InvalidRebalanceSpotEntropyState",
      msg: "invalid rebalane spot entropy state",
    },
    {
      code: 6148,
      name: "CompleteBasePositionDoesNotMatchNormal",
      msg: "complete base position does not match normal",
    },
    {
      code: 6149,
      name: "InvalidDepositDiscretionaryState",
      msg: "invalid deposit discretionary state",
    },
    {
      code: 6150,
      name: "QuotePositionMustMoveCloserToDesired",
      msg: "quote position must move closer to desired",
    },
    {
      code: 6151,
      name: "InvalidOtcOrderPrice",
      msg: "invalid OTC order price",
    },
    {
      code: 6152,
      name: "UnhealthyEntropyAccount",
      msg: "unhealthy entropy account",
    },
    {
      code: 6153,
      name: "InvalidHedgingStrategy",
    },
    {
      code: 6154,
      name: "InvalidTargetPerpMarket",
    },
    {
      code: 6155,
      name: "InvalidHedgingPerpMarket",
    },
    {
      code: 6156,
      name: "InvalidWhitelistAccountVector",
      msg: "invalid whitelist account (vector)",
    },
    {
      code: 6157,
      name: "InvalidDaoProgramId",
      msg: "invalid dao program ID",
    },
    {
      code: 6158,
      name: "VoltMustBeForDao",
      msg: "volt must be for dao",
    },
    {
      code: 6159,
      name: "InvalidDaoAuthority",
      msg: "invalid dao authority",
    },
    {
      code: 6160,
      name: "DaoAuthorityMustSign",
      msg: "dao authority must sign",
    },
    {
      code: 6161,
      name: "InvalidWhitelistTokenAccountMint",
      msg: "invalid whitelist token account mint",
    },
    {
      code: 6162,
      name: "WhitelistTokenAccountOwnerIsNotUser",
      msg: "whitelist token account owner is not user",
    },
    {
      code: 6163,
      name: "MustNotBeLendingUnderlyingAssetMint",
      msg: "must not be lending underlying asset mint",
    },
    {
      code: 6164,
      name: "MustNotBeLendingQuoteAssetMint",
      msg: "must not be lending quote asset mint",
    },
    {
      code: 6165,
      name: "InvalidEnterSwapClaimState",
    },
    {
      code: 6166,
      name: "InvalidCurrSwapOrder",
    },
  ],
};
