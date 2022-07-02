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
        },
        {
          name: "bump";
          type: "u8";
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidDepositProgramId";
      msg: "invalid deposit program id";
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
        {
          name: "bump",
          type: "u8",
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidDepositProgramId",
      msg: "invalid deposit program id",
    },
  ],
};
