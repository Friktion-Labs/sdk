export type CpiExamplesIDL = {
  version: "0.1.0";
  name: "cpi_examples";
  instructions: [
    {
      name: "depositExample";
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
          name: "voltProgramId";
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
          name: "epochInfo";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingDepositInfo";
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
      name: "withdrawExample";
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
          name: "voltProgramId";
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
          isMut: true;
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
          name: "vaultTokenSource";
          isMut: true;
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
      name: "depositWithClaimExample";
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
          name: "voltProgramId";
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
        }
      ];
    },
    {
      name: "withdrawWithClaimExample";
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
          name: "voltProgramId";
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
          isMut: true;
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
          name: "vaultTokenSource";
          isMut: true;
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
      name: "claimPendingDepositExample";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltProgramId";
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
      name: "claimPendingWithdrawalExample";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltProgramId";
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
      name: "cancelPendingDepositExample";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "voltProgramId";
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
          name: "pendingDepositInfo";
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
      name: "cancelPendingWithdrawalExample";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "voltProgramId";
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
          name: "vaultTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pendingWithdrawalInfo";
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
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidDepositProgramId";
      msg: "invalid deposit program id";
    },
    {
      code: 6001;
      name: "InvalidDaoAuthority";
      msg: "invalid dao authority";
    }
  ];
};
export const CpiExamplesIDLJsonRaw = {
  version: "0.1.0",
  name: "cpi_examples",
  instructions: [
    {
      name: "depositExample",
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
          name: "voltProgramId",
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
          name: "epochInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingDepositInfo",
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
      name: "withdrawExample",
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
          name: "voltProgramId",
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
          isMut: true,
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
          name: "vaultTokenSource",
          isMut: true,
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
      name: "depositWithClaimExample",
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
          name: "voltProgramId",
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
      ],
    },
    {
      name: "withdrawWithClaimExample",
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
          name: "voltProgramId",
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
          isMut: true,
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
          name: "vaultTokenSource",
          isMut: true,
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
      name: "claimPendingDepositExample",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltProgramId",
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
      name: "claimPendingWithdrawalExample",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltProgramId",
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
      name: "cancelPendingDepositExample",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voltProgramId",
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
          name: "pendingDepositInfo",
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
      name: "cancelPendingWithdrawalExample",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "voltProgramId",
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
          name: "vaultTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pendingWithdrawalInfo",
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
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidDepositProgramId",
      msg: "invalid deposit program id",
    },
    {
      code: 6001,
      name: "InvalidDaoAuthority",
      msg: "invalid dao authority",
    },
  ],
};
