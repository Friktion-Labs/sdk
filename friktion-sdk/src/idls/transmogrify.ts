export type TransmogrifyIDL = {
  version: "0.1.0";
  name: "transmogrify";
  instructions: [
    {
      name: "createGlobalConfig";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "configAccount";
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
      name: "addDelegate";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "optionalAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "globalConfig";
          isMut: false;
          isSigner: false;
        },
        {
          name: "delegateAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "delegateAccount";
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
      name: "createLoan";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: true;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "borrower";
          isMut: false;
          isSigner: false;
        },
        {
          name: "lender";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralOracleKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsOracleKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
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
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "CreateLoanArgs";
          };
        }
      ];
    },
    {
      name: "createLoanBook";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "globalConfig";
          isMut: false;
          isSigner: false;
        },
        {
          name: "delegateConfig";
          isMut: true;
          isSigner: false;
        },
        {
          name: "loanBook";
          isMut: false;
          isSigner: false;
        },
        {
          name: "restrictedFundsMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "restrictedCollateralMint";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "CreateLoanBookArgs";
          };
        }
      ];
    },
    {
      name: "changeLoanParameters";
      accounts: [
        {
          name: "delegate";
          isMut: true;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "ChangeLoanParametersArgs";
          };
        }
      ];
    },
    {
      name: "lend";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "lenderFunds";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
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
          name: "args";
          type: {
            defined: "LendArgs";
          };
        }
      ];
    },
    {
      name: "borrow";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "adminAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "borrowerFunds";
          isMut: true;
          isSigner: false;
        },
        {
          name: "borrowerCollateral";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralOracleKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsOracleKey";
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
          name: "args";
          type: {
            defined: "BorrowArgs";
          };
        }
      ];
    },
    {
      name: "payCoupon";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "borrowerFunds";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
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
          name: "args";
          type: {
            defined: "PayCouponArgs";
          };
        }
      ];
    },
    {
      name: "repayPrincipal";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "borrowerFunds";
          isMut: true;
          isSigner: false;
        },
        {
          name: "borrowerCollateral";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralPool";
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
          name: "args";
          type: {
            defined: "RepayPrincipalArgs";
          };
        }
      ];
    },
    {
      name: "collectFunds";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "lenderFunds";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
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
          name: "args";
          type: {
            defined: "CollectFundsArgs";
          };
        }
      ];
    },
    {
      name: "liquidate";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "collateralDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralOracleKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsOracleKey";
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
          name: "args";
          type: {
            defined: "LiquidateArgs";
          };
        }
      ];
    },
    {
      name: "requestEarlyRepayment";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "RequestEarlyRepaymentArgs";
          };
        }
      ];
    },
    {
      name: "acceptEarlyRepayment";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "AcceptEarlyRepaymentArgs";
          };
        }
      ];
    },
    {
      name: "rejectEarlyRepayment";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "RejectEarlyRepaymentArgs";
          };
        }
      ];
    },
    {
      name: "collectFeesAdmin";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "adminFunds";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
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
          name: "args";
          type: {
            defined: "CollectFeesAdminArgs";
          };
        }
      ];
    },
    {
      name: "collectFeesDelegate";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "delegateFunds";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
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
          name: "args";
          type: {
            defined: "CollectFeesDelegateArgs";
          };
        }
      ];
    },
    {
      name: "addCollateral";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "borrowerCollateral";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralPool";
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
          name: "args";
          type: {
            defined: "AddCollateralArgs";
          };
        }
      ];
    },
    {
      name: "removeCollateral";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "borrowerCollateral";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralOracleKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsOracleKey";
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
          name: "args";
          type: {
            defined: "RemoveCollateralArgs";
          };
        }
      ];
    },
    {
      name: "removeLoan";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: true;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "collateralMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "RemoveLoanArgs";
          };
        }
      ];
    },
    {
      name: "removeDelegate";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "optionalAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "globalConfig";
          isMut: false;
          isSigner: false;
        },
        {
          name: "delegateAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "delegateConfig";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "cancelLoan";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "loanAccounts";
          accounts: [
            {
              name: "globalConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "delegateConfig";
              isMut: false;
              isSigner: false;
            },
            {
              name: "loanBook";
              isMut: true;
              isSigner: false;
            }
          ];
        },
        {
          name: "collateralMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "fundsMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "fundsPool";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "CancelLoanArgs";
          };
        }
      ];
    },
    {
      name: "changeGlobalConfigParameters";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "configAccount";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "ChangeGlobalConfigParametersArgs";
          };
        }
      ];
    },
    {
      name: "toggleDelegateEnabled";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "globalConfig";
          isMut: false;
          isSigner: false;
        },
        {
          name: "delegateAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "delegateAccount";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "getTvl";
      accounts: [
        {
          name: "loanBook";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "loanNumber";
          type: {
            option: "u64";
          };
        }
      ];
      returns: "u64";
    }
  ];
  accounts: [
    {
      name: "DelegateConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "delegate";
            type: "publicKey";
          },
          {
            name: "globalConfig";
            type: "publicKey";
          },
          {
            name: "booksUnderManagement";
            type: "u64";
          },
          {
            name: "loansUnderManagement";
            type: "u64";
          },
          {
            name: "enabled";
            type: "bool";
          },
          {
            name: "padding";
            type: {
              array: ["u64", 32];
            };
          }
        ];
      };
    },
    {
      name: "GlobalConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "admin";
            type: "publicKey";
          },
          {
            name: "principalLiquidationGracePeriod";
            type: "u64";
          },
          {
            name: "interestLiquidationGracePeriod";
            type: "u64";
          },
          {
            name: "delegateInterestFeeBps";
            type: "u16";
          },
          {
            name: "adminInterestFeeBps";
            type: "u16";
          },
          {
            name: "enabled";
            type: "bool";
          },
          {
            name: "padding";
            type: {
              array: ["u64", 32];
            };
          }
        ];
      };
    },
    {
      name: "LoanBook";
      type: {
        kind: "struct";
        fields: [
          {
            name: "delegate";
            type: "publicKey";
          },
          {
            name: "delegateConfig";
            type: "publicKey";
          },
          {
            name: "restrictedBorrower";
            type: "publicKey";
          },
          {
            name: "restrictedLender";
            type: "publicKey";
          },
          {
            name: "restrictedFundsMint";
            type: "publicKey";
          },
          {
            name: "restrictedCollateralMint";
            type: "publicKey";
          },
          {
            name: "defaultLoanLength";
            type: "u64";
          },
          {
            name: "defaultCouponLength";
            type: "u64";
          },
          {
            name: "loanCount";
            type: "u64";
          },
          {
            name: "padding1";
            type: "u64";
          },
          {
            name: "loansLength";
            type: "u16";
          },
          {
            name: "padding";
            type: {
              array: ["u16", 7];
            };
          },
          {
            name: "loans";
            type: {
              array: [
                {
                  defined: "Loan";
                },
                100
              ];
            };
          }
        ];
      };
    },
    {
      name: "LoanSequence";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "borrower";
            type: "publicKey";
          },
          {
            name: "lender";
            type: "publicKey";
          },
          {
            name: "delegate";
            type: "publicKey";
          },
          {
            name: "sequenceNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "StubOracle";
      type: {
        kind: "struct";
        fields: [
          {
            name: "magic";
            type: "u32";
          },
          {
            name: "price";
            type: "f64";
          },
          {
            name: "lastUpdate";
            type: "i64";
          },
          {
            name: "pdaStr";
            type: "string";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "AcceptEarlyRepaymentArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          },
          {
            name: "newExpiry";
            type: "u64";
          },
          {
            name: "earlyTerminationFee";
            type: "i128";
          }
        ];
      };
    },
    {
      name: "AddCollateralArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          },
          {
            name: "amount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "BorrowArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          },
          {
            name: "collateralAmount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "CancelLoanArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "ChangeGlobalConfigParametersArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "enabled";
            type: {
              option: "bool";
            };
          },
          {
            name: "principalLiquidationGracePeriod";
            type: {
              option: "u64";
            };
          },
          {
            name: "interestLiquidationGracePeriod";
            type: {
              option: "u64";
            };
          },
          {
            name: "delegateInterestFeeBps";
            type: {
              option: "u16";
            };
          },
          {
            name: "adminInterestFeeBps";
            type: {
              option: "u16";
            };
          }
        ];
      };
    },
    {
      name: "ChangeLoanParametersArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          },
          {
            name: "borrowingCollateralizationRatio";
            type: {
              option: "i128";
            };
          },
          {
            name: "liquidationCollateralizationRatio";
            type: {
              option: "i128";
            };
          },
          {
            name: "lateCouponPaymentFeeBps";
            type: {
              option: "u16";
            };
          },
          {
            name: "latePrincipalPaymentFeeBps";
            type: {
              option: "u16";
            };
          },
          {
            name: "interestLiquidationGracePeriod";
            type: {
              option: "u64";
            };
          },
          {
            name: "principalLiquidationGracePeriod";
            type: {
              option: "u64";
            };
          }
        ];
      };
    },
    {
      name: "CollectFeesAdminArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          },
          {
            name: "collectExcessFunds";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "CollectFeesDelegateArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "CollectFundsArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "CreateLoanBookArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "restrictedBorrower";
            type: "publicKey";
          },
          {
            name: "restrictedLender";
            type: "publicKey";
          },
          {
            name: "defaultLoanLength";
            type: "u64";
          },
          {
            name: "defaultCouponLength";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "CreateLoanArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          },
          {
            name: "isImmutable";
            type: "bool";
          },
          {
            name: "principalAmount";
            type: "u64";
          },
          {
            name: "interestApr";
            type: "i128";
          },
          {
            name: "loanDuration";
            type: "u64";
          },
          {
            name: "couponPaymentPeriod";
            type: "u64";
          },
          {
            name: "couponRate";
            type: "i128";
          },
          {
            name: "lateCouponPaymentFeeBps";
            type: "u16";
          },
          {
            name: "latePrincipalPaymentFeeBps";
            type: "u16";
          },
          {
            name: "interestLiquidationGracePeriod";
            type: "u64";
          },
          {
            name: "principalLiquidationGracePeriod";
            type: "u64";
          },
          {
            name: "borrowingCollateralizationRatio";
            type: "i128";
          },
          {
            name: "liquidationCollateralizationRatio";
            type: "i128";
          },
          {
            name: "delegateInterestFeeBps";
            type: "u16";
          },
          {
            name: "borrowerOriginationFeeBps";
            type: "u16";
          },
          {
            name: "lenderOriginationFeeBps";
            type: "u16";
          },
          {
            name: "delegateOriginationFeeBps";
            type: "u16";
          }
        ];
      };
    },
    {
      name: "LendArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "LiquidateArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "PayCouponArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "RejectEarlyRepaymentArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "RemoveCollateralArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          },
          {
            name: "amount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "RemoveLoanArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "RepayPrincipalArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "RequestEarlyRepaymentArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "loanNumber";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "InterestCoupon";
      type: {
        kind: "struct";
        fields: [
          {
            name: "couponPaymentPeriod";
            type: "u64";
          },
          {
            name: "couponRate";
            type: "i128";
          }
        ];
      };
    },
    {
      name: "AmortizingCoupon";
      type: {
        kind: "struct";
        fields: [
          {
            name: "couponPaymentPeriod";
            type: "u64";
          },
          {
            name: "couponRate";
            type: "i128";
          },
          {
            name: "couponAmortizationRate";
            type: "i128";
          }
        ];
      };
    },
    {
      name: "Coupon";
      type: {
        kind: "struct";
        fields: [
          {
            name: "couponKind";
            type: "u8";
          },
          {
            name: "padding1";
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "couponPaymentPeriod";
            type: "u64";
          },
          {
            name: "couponRate";
            type: "i128";
          },
          {
            name: "couponAmortizationRate";
            type: "i128";
          }
        ];
      };
    },
    {
      name: "Loan";
      type: {
        kind: "struct";
        fields: [
          {
            name: "sequenceNumber";
            type: "u64";
          },
          {
            name: "padding1";
            type: "u64";
          },
          {
            name: "base";
            type: {
              defined: "LoanCore";
            };
          },
          {
            name: "keys";
            type: {
              defined: "LoanAccounts";
            };
          },
          {
            name: "meta";
            type: {
              defined: "LoanMetadata";
            };
          },
          {
            name: "padding";
            type: {
              array: ["u32", 32];
            };
          }
        ];
      };
    },
    {
      name: "LoanAccounts";
      type: {
        kind: "struct";
        fields: [
          {
            name: "borrower";
            type: "publicKey";
          },
          {
            name: "lender";
            type: "publicKey";
          },
          {
            name: "collateralMint";
            type: "publicKey";
          },
          {
            name: "fundsMint";
            type: "publicKey";
          },
          {
            name: "collateralOracleKey";
            type: "publicKey";
          },
          {
            name: "fundsOracleKey";
            type: "publicKey";
          },
          {
            name: "padding";
            type: {
              array: ["publicKey", 4];
            };
          }
        ];
      };
    },
    {
      name: "LoanMetadata";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lastPaymentDate";
            type: "u64";
          },
          {
            name: "numPaymentsDone";
            type: "u64";
          },
          {
            name: "interestFeesPaid";
            type: "u64";
          },
          {
            name: "principalFeesPaid";
            type: "u64";
          },
          {
            name: "delegateFeesPaid";
            type: "u64";
          },
          {
            name: "interestPaid";
            type: "u64";
          },
          {
            name: "originationFeesPaid";
            type: "u64";
          },
          {
            name: "initTs";
            type: "u64";
          },
          {
            name: "activationTs";
            type: "u64";
          },
          {
            name: "padding1";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u32", 16];
            };
          }
        ];
      };
    },
    {
      name: "LoanCore";
      type: {
        kind: "struct";
        fields: [
          {
            name: "principalAmount";
            type: "u64";
          },
          {
            name: "interestLiquidationGracePeriod";
            type: "u64";
          },
          {
            name: "principalLiquidationGracePeriod";
            type: "u64";
          },
          {
            name: "expiryTs";
            type: "u64";
          },
          {
            name: "loanLength";
            type: "u64";
          },
          {
            name: "couponPaymentPeriod";
            type: "u64";
          },
          {
            name: "nextRequiredPaymentDate";
            type: "u64";
          },
          {
            name: "lastRequiredPaymentDate";
            type: "u64";
          },
          {
            name: "numPaymentsLeft";
            type: "u64";
          },
          {
            name: "principalRepaid";
            type: "u64";
          },
          {
            name: "reclaimableLenderPrincipal";
            type: "u64";
          },
          {
            name: "reclaimableBorrowerCollateral";
            type: "u64";
          },
          {
            name: "claimableLenderInterest";
            type: "u64";
          },
          {
            name: "claimableDelegateFees";
            type: "u64";
          },
          {
            name: "claimableProtocolFees";
            type: "u64";
          },
          {
            name: "padding0";
            type: "u64";
          },
          {
            name: "interestApr";
            type: "i128";
          },
          {
            name: "couponRate";
            type: "i128";
          },
          {
            name: "couponAmortizationRate";
            type: "i128";
          },
          {
            name: "earlyTerminationFee";
            type: "i128";
          },
          {
            name: "borrowingCollateralizationRatio";
            type: "i128";
          },
          {
            name: "liquidationCollateralizationRatio";
            type: "i128";
          },
          {
            name: "lateCouponPaymentFeeBps";
            type: "u16";
          },
          {
            name: "latePrincipalPaymentFeeBps";
            type: "u16";
          },
          {
            name: "delegateInterestFeeBps";
            type: "u16";
          },
          {
            name: "delegateOriginationFeeBps";
            type: "u16";
          },
          {
            name: "borrowerOriginationFeeBps";
            type: "u16";
          },
          {
            name: "lenderOriginationFeeBps";
            type: "u16";
          },
          {
            name: "padding1";
            type: {
              array: ["u16", 2];
            };
          },
          {
            name: "earlyRepaymentRequestKind";
            type: "u8";
          },
          {
            name: "earlyRepaymentRequestOrigin";
            type: "u8";
          },
          {
            name: "state";
            type: "u8";
          },
          {
            name: "couponKind";
            type: "u8";
          },
          {
            name: "isImmutable";
            type: "bool";
          },
          {
            name: "cancelled";
            type: "bool";
          },
          {
            name: "padding2";
            type: {
              array: ["u8", 10];
            };
          },
          {
            name: "paddingBottom";
            type: {
              array: ["u32", 32];
            };
          }
        ];
      };
    },
    {
      name: "CouponType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "InterestOnly";
            fields: [
              {
                defined: "InterestCoupon";
              }
            ];
          },
          {
            name: "AmortizingCoupon";
            fields: [
              {
                defined: "AmortizingCoupon";
              }
            ];
          }
        ];
      };
    },
    {
      name: "Counterparty";
      type: {
        kind: "enum";
        variants: [
          {
            name: "None";
          },
          {
            name: "Borrower";
          },
          {
            name: "Lender";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "Unauthorized";
      msg: "Unauthorized.";
    },
    {
      code: 6001;
      name: "InvalidAprValue";
      msg: "Invalid apr value.";
    },
    {
      code: 6002;
      name: "InvalidPrincipalAmount";
      msg: "Invalid principal amount. Must be >0";
    },
    {
      code: 6003;
      name: "InvalidCouponAprValue";
      msg: "Coupon APR cannot be higher than loan apr.";
    },
    {
      code: 6004;
      name: "InvalidCouponPeriod";
      msg: "Coupon period be higher than loan duration.";
    },
    {
      code: 6005;
      name: "InvalidEarlyRepaymentFeeValue";
      msg: "Invalid early repayment fee value.";
    },
    {
      code: 6006;
      name: "InvalidEarlyRepaymentExpiry";
      msg: "Invalid expiry for early repayment. Value must be in the future and after last required payment";
    },
    {
      code: 6007;
      name: "InvalidLateCouponFeeValue";
      msg: "Invalid late coupon fee value.";
    },
    {
      code: 6008;
      name: "InvalidLatePrincipalFeeValue";
      msg: "Invalid late principal fee value.";
    },
    {
      code: 6009;
      name: "InvalidBorrowCollateralizationValue";
      msg: "Invalid borrow collateralization value.";
    },
    {
      code: 6010;
      name: "InvalidLiquidationCollateralizationValue";
      msg: "Invalid liquidation collateralization value.";
    },
    {
      code: 6011;
      name: "InvalidCollateralizationRatios";
      msg: "Invalid collateralization ratios. Liquidation must be bellow or equal to borrow ratio.";
    },
    {
      code: 6012;
      name: "InvalidBorrowerOriginationFeeValue";
      msg: "Invalid borrower origination fee value.";
    },
    {
      code: 6013;
      name: "InvalidLenderOriginationFeeValue";
      msg: "Invalid lender origination fee value.";
    },
    {
      code: 6014;
      name: "InvalidDelegateOriginationFeeValue";
      msg: "Invalid delegate origination fee value.";
    },
    {
      code: 6015;
      name: "InvalidAdminAuthority";
      msg: "Invalid admin authority or optional authority to execute instruction.";
    },
    {
      code: 6016;
      name: "InvalidDelegateAuthority";
      msg: "Invalid delegate authority to execute instruction.";
    },
    {
      code: 6017;
      name: "InvalidDelegateInterestRatio";
      msg: "Invalid delegate interest ratio. Must be 0 <= ratio <= 100";
    },
    {
      code: 6018;
      name: "InvalidLoanBookProgramOwner";
      msg: "Invalid loan_book account program owner.";
    },
    {
      code: 6019;
      name: "InvalidLoanBookSize";
      msg: "Invalid loan_book account size.";
    },
    {
      code: 6020;
      name: "LoanBookAlreadyInitialized";
      msg: "loan_book account already initialized.";
    },
    {
      code: 6021;
      name: "InvalidLoanState";
      msg: "Invalid loan state for the given operation.";
    },
    {
      code: 6022;
      name: "InvalidNewLoanNumber";
      msg: "Invalid new loan number. Must be loan_book.loan_count + 1.";
    },
    {
      code: 6023;
      name: "LoanBookFullCapacity";
      msg: "Loan book is at capacity. Create new loan book or remove settled loans.";
    },
    {
      code: 6024;
      name: "InvalidLoanNumber";
      msg: "Loan with the given number not found.";
    },
    {
      code: 6025;
      name: "CantRemoveLoan";
      msg: "Unable to remove loan at the given time.";
    },
    {
      code: 6026;
      name: "CantRemoveDelegateWithAssetsUnderManagement";
      msg: "Unable to remove a delegate that has assets under management.";
    },
    {
      code: 6027;
      name: "InvalidBorrowerForRestrictedBook";
      msg: "loan_book is restricted to a single borrower.";
    },
    {
      code: 6028;
      name: "InvalidLenderForRestrictedBook";
      msg: "loan_book is restricted to a single lender.";
    },
    {
      code: 6029;
      name: "InvalidLender";
      msg: "Invalid lender account.";
    },
    {
      code: 6030;
      name: "InvalidLenderOrBorrower";
      msg: "Invalid lender or borrower account";
    },
    {
      code: 6031;
      name: "InvalidBorrower";
      msg: "Invalid borrower account.";
    },
    {
      code: 6032;
      name: "InvalidCollateralMint";
      msg: "Invalid collateral mint account.";
    },
    {
      code: 6033;
      name: "InvalidCollateralOracle";
      msg: "Invalid collateral oracle account.";
    },
    {
      code: 6034;
      name: "InvalidCollateralAccount";
      msg: "Invalid collateral account.";
    },
    {
      code: 6035;
      name: "InvalidFundsOracle";
      msg: "Invalid funds oracle account.";
    },
    {
      code: 6036;
      name: "InvalidFundsMint";
      msg: "Invalid funds mint account.";
    },
    {
      code: 6037;
      name: "PositionBellowCollateralObligations";
      msg: "Position bellow required collateral obligations. Increase collateral.";
    },
    {
      code: 6038;
      name: "NoCouponsLeftToPay";
      msg: "No coupons left to pay.";
    },
    {
      code: 6039;
      name: "CannotRepayPrincipalBeforeAllCoupons";
      msg: "Cannot repay principal before all coupons are paid.";
    },
    {
      code: 6040;
      name: "LoanDoesNotExceedLiquidationThreshold";
      msg: "Cannot liquidate - loan position above liquidation thresholds.";
    },
    {
      code: 6041;
      name: "InvalidExpiryForEarlyRepayment";
      msg: "Invalid new loan expiry for early repayment. Must be in the future.";
    },
    {
      code: 6042;
      name: "CannotChangeImmutableLoan";
      msg: "This loan is immutable, cannot be changed.";
    },
    {
      code: 6043;
      name: "ConfigurationDisabledByAdmin";
      msg: "The selected configuration was disabled and all operations are suspended.";
    },
    {
      code: 6044;
      name: "DelegateConfigurationDisabledByAdmin";
      msg: "The selected delegate was disabled and all delegate operations are suspended.";
    },
    {
      code: 6045;
      name: "DelegateConfigAndLoanBookMismatch";
      msg: "delegate_config different from expected for this loan_book.";
    },
    {
      code: 6046;
      name: "DelegateConfigAndGlobalConfigMismatch";
      msg: "global_config different from expected for this delegate_config.";
    },
    {
      code: 6047;
      name: "UnableToGetTvlForNonUniformBook";
      msg: "can only call get_tvl on uniform book due to account limit restrictions and diversity of oracles.";
    }
  ];
};
export const TransmogrifyIDLJsonRaw = {
  version: "0.1.0",
  name: "transmogrify",
  instructions: [
    {
      name: "createGlobalConfig",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "configAccount",
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
      name: "addDelegate",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "optionalAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "globalConfig",
          isMut: false,
          isSigner: false,
        },
        {
          name: "delegateAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "delegateAccount",
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
      name: "createLoan",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: true,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "borrower",
          isMut: false,
          isSigner: false,
        },
        {
          name: "lender",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralOracleKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsOracleKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
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
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "CreateLoanArgs",
          },
        },
      ],
    },
    {
      name: "createLoanBook",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "globalConfig",
          isMut: false,
          isSigner: false,
        },
        {
          name: "delegateConfig",
          isMut: true,
          isSigner: false,
        },
        {
          name: "loanBook",
          isMut: false,
          isSigner: false,
        },
        {
          name: "restrictedFundsMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "restrictedCollateralMint",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "CreateLoanBookArgs",
          },
        },
      ],
    },
    {
      name: "changeLoanParameters",
      accounts: [
        {
          name: "delegate",
          isMut: true,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "ChangeLoanParametersArgs",
          },
        },
      ],
    },
    {
      name: "lend",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "lenderFunds",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
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
          name: "args",
          type: {
            defined: "LendArgs",
          },
        },
      ],
    },
    {
      name: "borrow",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "adminAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "borrowerFunds",
          isMut: true,
          isSigner: false,
        },
        {
          name: "borrowerCollateral",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralOracleKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsOracleKey",
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
          name: "args",
          type: {
            defined: "BorrowArgs",
          },
        },
      ],
    },
    {
      name: "payCoupon",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "borrowerFunds",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
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
          name: "args",
          type: {
            defined: "PayCouponArgs",
          },
        },
      ],
    },
    {
      name: "repayPrincipal",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "borrowerFunds",
          isMut: true,
          isSigner: false,
        },
        {
          name: "borrowerCollateral",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralPool",
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
          name: "args",
          type: {
            defined: "RepayPrincipalArgs",
          },
        },
      ],
    },
    {
      name: "collectFunds",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "lenderFunds",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
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
          name: "args",
          type: {
            defined: "CollectFundsArgs",
          },
        },
      ],
    },
    {
      name: "liquidate",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "collateralDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralOracleKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsOracleKey",
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
          name: "args",
          type: {
            defined: "LiquidateArgs",
          },
        },
      ],
    },
    {
      name: "requestEarlyRepayment",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "RequestEarlyRepaymentArgs",
          },
        },
      ],
    },
    {
      name: "acceptEarlyRepayment",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "AcceptEarlyRepaymentArgs",
          },
        },
      ],
    },
    {
      name: "rejectEarlyRepayment",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "RejectEarlyRepaymentArgs",
          },
        },
      ],
    },
    {
      name: "collectFeesAdmin",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "adminFunds",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
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
          name: "args",
          type: {
            defined: "CollectFeesAdminArgs",
          },
        },
      ],
    },
    {
      name: "collectFeesDelegate",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "delegateFunds",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
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
          name: "args",
          type: {
            defined: "CollectFeesDelegateArgs",
          },
        },
      ],
    },
    {
      name: "addCollateral",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "borrowerCollateral",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralPool",
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
          name: "args",
          type: {
            defined: "AddCollateralArgs",
          },
        },
      ],
    },
    {
      name: "removeCollateral",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "borrowerCollateral",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralOracleKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsOracleKey",
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
          name: "args",
          type: {
            defined: "RemoveCollateralArgs",
          },
        },
      ],
    },
    {
      name: "removeLoan",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: true,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "collateralMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "RemoveLoanArgs",
          },
        },
      ],
    },
    {
      name: "removeDelegate",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "optionalAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "globalConfig",
          isMut: false,
          isSigner: false,
        },
        {
          name: "delegateAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "delegateConfig",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "cancelLoan",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "loanAccounts",
          accounts: [
            {
              name: "globalConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "delegateConfig",
              isMut: false,
              isSigner: false,
            },
            {
              name: "loanBook",
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: "collateralMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fundsMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "fundsPool",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "CancelLoanArgs",
          },
        },
      ],
    },
    {
      name: "changeGlobalConfigParameters",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "configAccount",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "ChangeGlobalConfigParametersArgs",
          },
        },
      ],
    },
    {
      name: "toggleDelegateEnabled",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "globalConfig",
          isMut: false,
          isSigner: false,
        },
        {
          name: "delegateAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "delegateAccount",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "getTvl",
      accounts: [
        {
          name: "loanBook",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "loanNumber",
          type: {
            option: "u64",
          },
        },
      ],
      returns: "u64",
    },
  ],
  accounts: [
    {
      name: "DelegateConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "delegate",
            type: "publicKey",
          },
          {
            name: "globalConfig",
            type: "publicKey",
          },
          {
            name: "booksUnderManagement",
            type: "u64",
          },
          {
            name: "loansUnderManagement",
            type: "u64",
          },
          {
            name: "enabled",
            type: "bool",
          },
          {
            name: "padding",
            type: {
              array: ["u64", 32],
            },
          },
        ],
      },
    },
    {
      name: "GlobalConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "principalLiquidationGracePeriod",
            type: "u64",
          },
          {
            name: "interestLiquidationGracePeriod",
            type: "u64",
          },
          {
            name: "delegateInterestFeeBps",
            type: "u16",
          },
          {
            name: "adminInterestFeeBps",
            type: "u16",
          },
          {
            name: "enabled",
            type: "bool",
          },
          {
            name: "padding",
            type: {
              array: ["u64", 32],
            },
          },
        ],
      },
    },
    {
      name: "LoanBook",
      type: {
        kind: "struct",
        fields: [
          {
            name: "delegate",
            type: "publicKey",
          },
          {
            name: "delegateConfig",
            type: "publicKey",
          },
          {
            name: "restrictedBorrower",
            type: "publicKey",
          },
          {
            name: "restrictedLender",
            type: "publicKey",
          },
          {
            name: "restrictedFundsMint",
            type: "publicKey",
          },
          {
            name: "restrictedCollateralMint",
            type: "publicKey",
          },
          {
            name: "defaultLoanLength",
            type: "u64",
          },
          {
            name: "defaultCouponLength",
            type: "u64",
          },
          {
            name: "loanCount",
            type: "u64",
          },
          {
            name: "padding1",
            type: "u64",
          },
          {
            name: "loansLength",
            type: "u16",
          },
          {
            name: "padding",
            type: {
              array: ["u16", 7],
            },
          },
          {
            name: "loans",
            type: {
              array: [
                {
                  defined: "Loan",
                },
                100,
              ],
            },
          },
        ],
      },
    },
    {
      name: "LoanSequence",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "borrower",
            type: "publicKey",
          },
          {
            name: "lender",
            type: "publicKey",
          },
          {
            name: "delegate",
            type: "publicKey",
          },
          {
            name: "sequenceNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "StubOracle",
      type: {
        kind: "struct",
        fields: [
          {
            name: "magic",
            type: "u32",
          },
          {
            name: "price",
            type: "f64",
          },
          {
            name: "lastUpdate",
            type: "i64",
          },
          {
            name: "pdaStr",
            type: "string",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "AcceptEarlyRepaymentArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
          {
            name: "newExpiry",
            type: "u64",
          },
          {
            name: "earlyTerminationFee",
            type: "i128",
          },
        ],
      },
    },
    {
      name: "AddCollateralArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
          {
            name: "amount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "BorrowArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
          {
            name: "collateralAmount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "CancelLoanArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "ChangeGlobalConfigParametersArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "enabled",
            type: {
              option: "bool",
            },
          },
          {
            name: "principalLiquidationGracePeriod",
            type: {
              option: "u64",
            },
          },
          {
            name: "interestLiquidationGracePeriod",
            type: {
              option: "u64",
            },
          },
          {
            name: "delegateInterestFeeBps",
            type: {
              option: "u16",
            },
          },
          {
            name: "adminInterestFeeBps",
            type: {
              option: "u16",
            },
          },
        ],
      },
    },
    {
      name: "ChangeLoanParametersArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
          {
            name: "borrowingCollateralizationRatio",
            type: {
              option: "i128",
            },
          },
          {
            name: "liquidationCollateralizationRatio",
            type: {
              option: "i128",
            },
          },
          {
            name: "lateCouponPaymentFeeBps",
            type: {
              option: "u16",
            },
          },
          {
            name: "latePrincipalPaymentFeeBps",
            type: {
              option: "u16",
            },
          },
          {
            name: "interestLiquidationGracePeriod",
            type: {
              option: "u64",
            },
          },
          {
            name: "principalLiquidationGracePeriod",
            type: {
              option: "u64",
            },
          },
        ],
      },
    },
    {
      name: "CollectFeesAdminArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
          {
            name: "collectExcessFunds",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "CollectFeesDelegateArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "CollectFundsArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "CreateLoanBookArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "restrictedBorrower",
            type: "publicKey",
          },
          {
            name: "restrictedLender",
            type: "publicKey",
          },
          {
            name: "defaultLoanLength",
            type: "u64",
          },
          {
            name: "defaultCouponLength",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "CreateLoanArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
          {
            name: "isImmutable",
            type: "bool",
          },
          {
            name: "principalAmount",
            type: "u64",
          },
          {
            name: "interestApr",
            type: "i128",
          },
          {
            name: "loanDuration",
            type: "u64",
          },
          {
            name: "couponPaymentPeriod",
            type: "u64",
          },
          {
            name: "couponRate",
            type: "i128",
          },
          {
            name: "lateCouponPaymentFeeBps",
            type: "u16",
          },
          {
            name: "latePrincipalPaymentFeeBps",
            type: "u16",
          },
          {
            name: "interestLiquidationGracePeriod",
            type: "u64",
          },
          {
            name: "principalLiquidationGracePeriod",
            type: "u64",
          },
          {
            name: "borrowingCollateralizationRatio",
            type: "i128",
          },
          {
            name: "liquidationCollateralizationRatio",
            type: "i128",
          },
          {
            name: "delegateInterestFeeBps",
            type: "u16",
          },
          {
            name: "borrowerOriginationFeeBps",
            type: "u16",
          },
          {
            name: "lenderOriginationFeeBps",
            type: "u16",
          },
          {
            name: "delegateOriginationFeeBps",
            type: "u16",
          },
        ],
      },
    },
    {
      name: "LendArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "LiquidateArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "PayCouponArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RejectEarlyRepaymentArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RemoveCollateralArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
          {
            name: "amount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RemoveLoanArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RepayPrincipalArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RequestEarlyRepaymentArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "loanNumber",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "InterestCoupon",
      type: {
        kind: "struct",
        fields: [
          {
            name: "couponPaymentPeriod",
            type: "u64",
          },
          {
            name: "couponRate",
            type: "i128",
          },
        ],
      },
    },
    {
      name: "AmortizingCoupon",
      type: {
        kind: "struct",
        fields: [
          {
            name: "couponPaymentPeriod",
            type: "u64",
          },
          {
            name: "couponRate",
            type: "i128",
          },
          {
            name: "couponAmortizationRate",
            type: "i128",
          },
        ],
      },
    },
    {
      name: "Coupon",
      type: {
        kind: "struct",
        fields: [
          {
            name: "couponKind",
            type: "u8",
          },
          {
            name: "padding1",
            type: {
              array: ["u8", 7],
            },
          },
          {
            name: "couponPaymentPeriod",
            type: "u64",
          },
          {
            name: "couponRate",
            type: "i128",
          },
          {
            name: "couponAmortizationRate",
            type: "i128",
          },
        ],
      },
    },
    {
      name: "Loan",
      type: {
        kind: "struct",
        fields: [
          {
            name: "sequenceNumber",
            type: "u64",
          },
          {
            name: "padding1",
            type: "u64",
          },
          {
            name: "base",
            type: {
              defined: "LoanCore",
            },
          },
          {
            name: "keys",
            type: {
              defined: "LoanAccounts",
            },
          },
          {
            name: "meta",
            type: {
              defined: "LoanMetadata",
            },
          },
          {
            name: "padding",
            type: {
              array: ["u32", 32],
            },
          },
        ],
      },
    },
    {
      name: "LoanAccounts",
      type: {
        kind: "struct",
        fields: [
          {
            name: "borrower",
            type: "publicKey",
          },
          {
            name: "lender",
            type: "publicKey",
          },
          {
            name: "collateralMint",
            type: "publicKey",
          },
          {
            name: "fundsMint",
            type: "publicKey",
          },
          {
            name: "collateralOracleKey",
            type: "publicKey",
          },
          {
            name: "fundsOracleKey",
            type: "publicKey",
          },
          {
            name: "padding",
            type: {
              array: ["publicKey", 4],
            },
          },
        ],
      },
    },
    {
      name: "LoanMetadata",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lastPaymentDate",
            type: "u64",
          },
          {
            name: "numPaymentsDone",
            type: "u64",
          },
          {
            name: "interestFeesPaid",
            type: "u64",
          },
          {
            name: "principalFeesPaid",
            type: "u64",
          },
          {
            name: "delegateFeesPaid",
            type: "u64",
          },
          {
            name: "interestPaid",
            type: "u64",
          },
          {
            name: "originationFeesPaid",
            type: "u64",
          },
          {
            name: "initTs",
            type: "u64",
          },
          {
            name: "activationTs",
            type: "u64",
          },
          {
            name: "padding1",
            type: "u64",
          },
          {
            name: "padding",
            type: {
              array: ["u32", 16],
            },
          },
        ],
      },
    },
    {
      name: "LoanCore",
      type: {
        kind: "struct",
        fields: [
          {
            name: "principalAmount",
            type: "u64",
          },
          {
            name: "interestLiquidationGracePeriod",
            type: "u64",
          },
          {
            name: "principalLiquidationGracePeriod",
            type: "u64",
          },
          {
            name: "expiryTs",
            type: "u64",
          },
          {
            name: "loanLength",
            type: "u64",
          },
          {
            name: "couponPaymentPeriod",
            type: "u64",
          },
          {
            name: "nextRequiredPaymentDate",
            type: "u64",
          },
          {
            name: "lastRequiredPaymentDate",
            type: "u64",
          },
          {
            name: "numPaymentsLeft",
            type: "u64",
          },
          {
            name: "principalRepaid",
            type: "u64",
          },
          {
            name: "reclaimableLenderPrincipal",
            type: "u64",
          },
          {
            name: "reclaimableBorrowerCollateral",
            type: "u64",
          },
          {
            name: "claimableLenderInterest",
            type: "u64",
          },
          {
            name: "claimableDelegateFees",
            type: "u64",
          },
          {
            name: "claimableProtocolFees",
            type: "u64",
          },
          {
            name: "padding0",
            type: "u64",
          },
          {
            name: "interestApr",
            type: "i128",
          },
          {
            name: "couponRate",
            type: "i128",
          },
          {
            name: "couponAmortizationRate",
            type: "i128",
          },
          {
            name: "earlyTerminationFee",
            type: "i128",
          },
          {
            name: "borrowingCollateralizationRatio",
            type: "i128",
          },
          {
            name: "liquidationCollateralizationRatio",
            type: "i128",
          },
          {
            name: "lateCouponPaymentFeeBps",
            type: "u16",
          },
          {
            name: "latePrincipalPaymentFeeBps",
            type: "u16",
          },
          {
            name: "delegateInterestFeeBps",
            type: "u16",
          },
          {
            name: "delegateOriginationFeeBps",
            type: "u16",
          },
          {
            name: "borrowerOriginationFeeBps",
            type: "u16",
          },
          {
            name: "lenderOriginationFeeBps",
            type: "u16",
          },
          {
            name: "padding1",
            type: {
              array: ["u16", 2],
            },
          },
          {
            name: "earlyRepaymentRequestKind",
            type: "u8",
          },
          {
            name: "earlyRepaymentRequestOrigin",
            type: "u8",
          },
          {
            name: "state",
            type: "u8",
          },
          {
            name: "couponKind",
            type: "u8",
          },
          {
            name: "isImmutable",
            type: "bool",
          },
          {
            name: "cancelled",
            type: "bool",
          },
          {
            name: "padding2",
            type: {
              array: ["u8", 10],
            },
          },
          {
            name: "paddingBottom",
            type: {
              array: ["u32", 32],
            },
          },
        ],
      },
    },
    {
      name: "CouponType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "InterestOnly",
            fields: [
              {
                defined: "InterestCoupon",
              },
            ],
          },
          {
            name: "AmortizingCoupon",
            fields: [
              {
                defined: "AmortizingCoupon",
              },
            ],
          },
        ],
      },
    },
    {
      name: "Counterparty",
      type: {
        kind: "enum",
        variants: [
          {
            name: "None",
          },
          {
            name: "Borrower",
          },
          {
            name: "Lender",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "Unauthorized",
      msg: "Unauthorized.",
    },
    {
      code: 6001,
      name: "InvalidAprValue",
      msg: "Invalid apr value.",
    },
    {
      code: 6002,
      name: "InvalidPrincipalAmount",
      msg: "Invalid principal amount. Must be >0",
    },
    {
      code: 6003,
      name: "InvalidCouponAprValue",
      msg: "Coupon APR cannot be higher than loan apr.",
    },
    {
      code: 6004,
      name: "InvalidCouponPeriod",
      msg: "Coupon period be higher than loan duration.",
    },
    {
      code: 6005,
      name: "InvalidEarlyRepaymentFeeValue",
      msg: "Invalid early repayment fee value.",
    },
    {
      code: 6006,
      name: "InvalidEarlyRepaymentExpiry",
      msg: "Invalid expiry for early repayment. Value must be in the future and after last required payment",
    },
    {
      code: 6007,
      name: "InvalidLateCouponFeeValue",
      msg: "Invalid late coupon fee value.",
    },
    {
      code: 6008,
      name: "InvalidLatePrincipalFeeValue",
      msg: "Invalid late principal fee value.",
    },
    {
      code: 6009,
      name: "InvalidBorrowCollateralizationValue",
      msg: "Invalid borrow collateralization value.",
    },
    {
      code: 6010,
      name: "InvalidLiquidationCollateralizationValue",
      msg: "Invalid liquidation collateralization value.",
    },
    {
      code: 6011,
      name: "InvalidCollateralizationRatios",
      msg: "Invalid collateralization ratios. Liquidation must be bellow or equal to borrow ratio.",
    },
    {
      code: 6012,
      name: "InvalidBorrowerOriginationFeeValue",
      msg: "Invalid borrower origination fee value.",
    },
    {
      code: 6013,
      name: "InvalidLenderOriginationFeeValue",
      msg: "Invalid lender origination fee value.",
    },
    {
      code: 6014,
      name: "InvalidDelegateOriginationFeeValue",
      msg: "Invalid delegate origination fee value.",
    },
    {
      code: 6015,
      name: "InvalidAdminAuthority",
      msg: "Invalid admin authority or optional authority to execute instruction.",
    },
    {
      code: 6016,
      name: "InvalidDelegateAuthority",
      msg: "Invalid delegate authority to execute instruction.",
    },
    {
      code: 6017,
      name: "InvalidDelegateInterestRatio",
      msg: "Invalid delegate interest ratio. Must be 0 <= ratio <= 100",
    },
    {
      code: 6018,
      name: "InvalidLoanBookProgramOwner",
      msg: "Invalid loan_book account program owner.",
    },
    {
      code: 6019,
      name: "InvalidLoanBookSize",
      msg: "Invalid loan_book account size.",
    },
    {
      code: 6020,
      name: "LoanBookAlreadyInitialized",
      msg: "loan_book account already initialized.",
    },
    {
      code: 6021,
      name: "InvalidLoanState",
      msg: "Invalid loan state for the given operation.",
    },
    {
      code: 6022,
      name: "InvalidNewLoanNumber",
      msg: "Invalid new loan number. Must be loan_book.loan_count + 1.",
    },
    {
      code: 6023,
      name: "LoanBookFullCapacity",
      msg: "Loan book is at capacity. Create new loan book or remove settled loans.",
    },
    {
      code: 6024,
      name: "InvalidLoanNumber",
      msg: "Loan with the given number not found.",
    },
    {
      code: 6025,
      name: "CantRemoveLoan",
      msg: "Unable to remove loan at the given time.",
    },
    {
      code: 6026,
      name: "CantRemoveDelegateWithAssetsUnderManagement",
      msg: "Unable to remove a delegate that has assets under management.",
    },
    {
      code: 6027,
      name: "InvalidBorrowerForRestrictedBook",
      msg: "loan_book is restricted to a single borrower.",
    },
    {
      code: 6028,
      name: "InvalidLenderForRestrictedBook",
      msg: "loan_book is restricted to a single lender.",
    },
    {
      code: 6029,
      name: "InvalidLender",
      msg: "Invalid lender account.",
    },
    {
      code: 6030,
      name: "InvalidLenderOrBorrower",
      msg: "Invalid lender or borrower account",
    },
    {
      code: 6031,
      name: "InvalidBorrower",
      msg: "Invalid borrower account.",
    },
    {
      code: 6032,
      name: "InvalidCollateralMint",
      msg: "Invalid collateral mint account.",
    },
    {
      code: 6033,
      name: "InvalidCollateralOracle",
      msg: "Invalid collateral oracle account.",
    },
    {
      code: 6034,
      name: "InvalidCollateralAccount",
      msg: "Invalid collateral account.",
    },
    {
      code: 6035,
      name: "InvalidFundsOracle",
      msg: "Invalid funds oracle account.",
    },
    {
      code: 6036,
      name: "InvalidFundsMint",
      msg: "Invalid funds mint account.",
    },
    {
      code: 6037,
      name: "PositionBellowCollateralObligations",
      msg: "Position bellow required collateral obligations. Increase collateral.",
    },
    {
      code: 6038,
      name: "NoCouponsLeftToPay",
      msg: "No coupons left to pay.",
    },
    {
      code: 6039,
      name: "CannotRepayPrincipalBeforeAllCoupons",
      msg: "Cannot repay principal before all coupons are paid.",
    },
    {
      code: 6040,
      name: "LoanDoesNotExceedLiquidationThreshold",
      msg: "Cannot liquidate - loan position above liquidation thresholds.",
    },
    {
      code: 6041,
      name: "InvalidExpiryForEarlyRepayment",
      msg: "Invalid new loan expiry for early repayment. Must be in the future.",
    },
    {
      code: 6042,
      name: "CannotChangeImmutableLoan",
      msg: "This loan is immutable, cannot be changed.",
    },
    {
      code: 6043,
      name: "ConfigurationDisabledByAdmin",
      msg: "The selected configuration was disabled and all operations are suspended.",
    },
    {
      code: 6044,
      name: "DelegateConfigurationDisabledByAdmin",
      msg: "The selected delegate was disabled and all delegate operations are suspended.",
    },
    {
      code: 6045,
      name: "DelegateConfigAndLoanBookMismatch",
      msg: "delegate_config different from expected for this loan_book.",
    },
    {
      code: 6046,
      name: "DelegateConfigAndGlobalConfigMismatch",
      msg: "global_config different from expected for this delegate_config.",
    },
    {
      code: 6047,
      name: "UnableToGetTvlForNonUniformBook",
      msg: "can only call get_tvl on uniform book due to account limit restrictions and diversity of oracles.",
    },
  ],
};
