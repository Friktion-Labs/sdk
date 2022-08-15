export type SoloptionsIDL = {
  version: "0.1.0";
  name: "soloptions";
  instructions: [
    {
      name: "newContract";
      docs: ["Creates a new [OptionsContract]."];
      accounts: [
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "contract";
          isMut: true;
          isSigner: false;
        },
        {
          name: "writerMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingMint";
          isMut: true;
          isSigner: false;
          docs: ["The mint for the underlying asset, for example, WBTC."];
        },
        {
          name: "quoteMint";
          isMut: true;
          isSigner: false;
          docs: [
            "The mint for the quote asset (ie the strike), for example, USDC."
          ];
        },
        {
          name: "underlyingPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "quotePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mintFeeAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "exerciseFeeAccount";
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
          name: "associatedTokenProgram";
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
          name: "underlyingAmount";
          type: "u64";
        },
        {
          name: "quoteAmount";
          type: "u64";
        },
        {
          name: "expiryTs";
          type: "u64";
        },
        {
          name: "contractBump";
          type: "u8";
        },
        {
          name: "optionBump";
          type: "u8";
        },
        {
          name: "writerBump";
          type: "u8";
        }
      ];
    },
    {
      name: "optionWrite";
      docs: ["Writes options for an [OptionsContract]."];
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
          docs: [
            "The authority of the [user_underlying_funding_tokens] account."
          ];
        },
        {
          name: "contract";
          isMut: false;
          isSigner: false;
          docs: ["The options contract."];
        },
        {
          name: "userUnderlyingFundingTokens";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingPool";
          isMut: true;
          isSigner: false;
          docs: ["Contract underlying token pool"];
        },
        {
          name: "writerTokenDestination";
          isMut: true;
          isSigner: false;
          docs: ["The writer token account to send to."];
        },
        {
          name: "optionTokenDestination";
          isMut: true;
          isSigner: false;
          docs: ["The option token account to send to."];
        },
        {
          name: "writerMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "feeDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingMint";
          isMut: false;
          isSigner: false;
          docs: ["Mint for the underlying asset. Used as a seed for CPI"];
        },
        {
          name: "quoteMint";
          isMut: false;
          isSigner: false;
          docs: ["Mint for the quote asset. Used as a seed for CPI"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "writeAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "optionExercise";
      docs: ["Exercises options."];
      accounts: [
        {
          name: "exerciserAuthority";
          isMut: false;
          isSigner: true;
          docs: ["The authority of the [option_token_source] account."];
        },
        {
          name: "contract";
          isMut: false;
          isSigner: false;
          docs: ["The options contract."];
        },
        {
          name: "quoteTokenSource";
          isMut: true;
          isSigner: false;
          docs: ["The user's quote tokens used to fund writing the options."];
        },
        {
          name: "contractQuoteTokens";
          isMut: true;
          isSigner: false;
          docs: ["The contract's quote tokens."];
        },
        {
          name: "optionMint";
          isMut: true;
          isSigner: false;
          docs: ["The option mint."];
        },
        {
          name: "optionTokenSource";
          isMut: true;
          isSigner: false;
          docs: ["The user's options tokens used to fund writing the options."];
        },
        {
          name: "contractUnderlyingTokens";
          isMut: true;
          isSigner: false;
          docs: [
            "The contract's underlying tokens which collateralize the options."
          ];
        },
        {
          name: "underlyingTokenDestination";
          isMut: true;
          isSigner: false;
          docs: ["The option token account to send to."];
        },
        {
          name: "underlyingMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "quoteMint";
          isMut: false;
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
          docs: ["Token program."];
        }
      ];
      args: [
        {
          name: "numContracts";
          type: "u64";
        }
      ];
    },
    {
      name: "optionRedeem";
      accounts: [
        {
          name: "redeemerAuthority";
          isMut: false;
          isSigner: true;
          docs: ["The authority of the [option_token_source] account."];
        },
        {
          name: "contract";
          isMut: false;
          isSigner: false;
          docs: ["The options contract."];
        },
        {
          name: "writerTokenSource";
          isMut: true;
          isSigner: false;
          docs: ["The writer's writer token account."];
        },
        {
          name: "writerMint";
          isMut: true;
          isSigner: false;
          docs: ["The writer mint."];
        },
        {
          name: "contractUnderlyingTokens";
          isMut: true;
          isSigner: false;
          docs: [
            "The contract's underlying tokens which collateralize the options."
          ];
        },
        {
          name: "contractQuoteTokens";
          isMut: true;
          isSigner: false;
          docs: ["The contract's quote tokens."];
        },
        {
          name: "underlyingTokenDestination";
          isMut: true;
          isSigner: false;
          docs: ["The underlying token account to send to."];
        },
        {
          name: "quoteTokenDestination";
          isMut: true;
          isSigner: false;
          docs: ["The quote token account to send to."];
        },
        {
          name: "underlyingMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "quoteMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Token program."];
        }
      ];
      args: [
        {
          name: "numContracts";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "OptionsContract";
      docs: [
        "American option",
        "",
        "e.x. 0.1WBTC @ 5000 USDC",
        'suppose both have 9 decimal places for "sats" or whatever',
        'exercising ONE contract will be buying 10^8 "sats" of WBTC token',
        "Given strike is 5000, will require:",
        "num_options * strike * num_decimals_quote",
        "",
        "Passing in a u64 for underlying_multiplier won't work, suppose you want to do",
        "the ETH/BTC pair, write an option for 1 ETH at 0.1BTC. You want 0.1 of the quote",
        "for every unit of the underlying",
        "",
        'Could pass in a ratio, or just do an amount of "sats" for both explicitly to',
        "make things easier"
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "underlyingMint";
            docs: ["Underlying asset"];
            type: "publicKey";
          },
          {
            name: "quoteMint";
            docs: ["Strike price is denominated in this"];
            type: "publicKey";
          },
          {
            name: "expiryTs";
            docs: ["When the option expires."];
            type: "u64";
          },
          {
            name: "contractBump";
            docs: ["Bump seeds."];
            type: "u8";
          },
          {
            name: "writerBump";
            type: "u8";
          },
          {
            name: "optionBump";
            type: "u8";
          },
          {
            name: "underlyingAmount";
            docs: [
              "10^{Number of decimals of the underlying per contract}.",
              "e.g. if the contract had 9 decimals and this was 10^8,",
              "each contract would be for 0.1 of the underlying"
            ];
            type: "u64";
          },
          {
            name: "quoteAmount";
            docs: ["Same logic as underlying"];
            type: "u64";
          },
          {
            name: "writerMint";
            docs: [
              "The right to receive the proceeds from the option being exercised."
            ];
            type: "publicKey";
          },
          {
            name: "optionMint";
            docs: ["The option which can be exercised."];
            type: "publicKey";
          },
          {
            name: "underlyingPool";
            docs: [
              "The address for the contract's pool of the underlying asset"
            ];
            type: "publicKey";
          },
          {
            name: "quotePool";
            docs: ["The address for the contract's pool of the quote asset"];
            type: "publicKey";
          },
          {
            name: "mintFeeAccount";
            type: "publicKey";
          },
          {
            name: "exerciseFeeAccount";
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
            name: "extraInt1";
            type: "u64";
          },
          {
            name: "extraInt2";
            type: "u64";
          },
          {
            name: "extraBool";
            type: "bool";
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
      name: "InvalidContractExpiry";
      msg: "Invalid contract expiry.";
    },
    {
      code: 6002;
      name: "ContractExpired";
      msg: "Options contract is expired.";
    },
    {
      code: 6003;
      name: "ContractNotYetExpired";
      msg: "Cannot redeem until contract expiry.";
    },
    {
      code: 6004;
      name: "InvalidMultiplier";
      msg: "Multiplier must be between 1 and 1000000";
    },
    {
      code: 6005;
      name: "InvalidFee";
      msg: "Invalid fee";
    },
    {
      code: 6006;
      name: "InvalidFeeOwner";
      msg: "Invalid fee owner";
    },
    {
      code: 6007;
      name: "InvalidQuoteTokenSource";
      msg: "invalid quote token source";
    },
    {
      code: 6008;
      name: "InvalidOptionTokenSource";
      msg: "invalid option token source";
    },
    {
      code: 6009;
      name: "InvalidWriterTokenSource";
      msg: "invalid writer token source";
    },
    {
      code: 6010;
      name: "InvalidWriterTokenDestination";
      msg: "invalid writer token destination";
    },
    {
      code: 6011;
      name: "InvalidUserUnderlyingTokens";
      msg: "invalid user underlying tokens";
    },
    {
      code: 6012;
      name: "InvalidUserQuoteTokens";
      msg: "invalid user quote tokens";
    },
    {
      code: 6013;
      name: "InvalidContractUnderlyingPool";
      msg: "invalid contract quote pool";
    },
    {
      code: 6014;
      name: "InvalidContractQuotePool";
      msg: "invalid contract quote pool";
    },
    {
      code: 6015;
      name: "InvalidOptionMint";
      msg: "invalid option mint";
    },
    {
      code: 6016;
      name: "InvalidWriterMint";
      msg: "invalid writer mint";
    },
    {
      code: 6017;
      name: "InvalidUnderlyingMint";
      msg: "invalid underlying mint";
    },
    {
      code: 6018;
      name: "InvalidQuoteMint";
      msg: "invalid quote mint";
    },
    {
      code: 6019;
      name: "InvalidUnderlyingOrQuoteAmount";
      msg: "invalid underlying or quote amount";
    },
    {
      code: 6020;
      name: "RoundUnderlyingTokensMintDoesNotMatchVoltVault";
      msg: "round underlying tokens does not match volt";
    },
    {
      code: 6021;
      name: "NotEnoughUnderlyingTokens";
      msg: "not enough underlying tokens";
    },
    {
      code: 6022;
      name: "NotEnoughWriterTokens";
      msg: "not enough writer tokens";
    },
    {
      code: 6023;
      name: "NotEnoughOptionTokens";
      msg: "not enough option tokens";
    },
    {
      code: 6024;
      name: "MustBeNonZeroRedemption";
      msg: "must be non zero # writer tokens being redeemed";
    },
    {
      code: 6025;
      name: "MustBeNonZeroWriteAmount";
      msg: "must be non zero write amount";
    },
    {
      code: 6026;
      name: "MustBeNonZeroExercise";
      msg: "must be non zero exercise";
    },
    {
      code: 6027;
      name: "NumberOverflow";
      msg: "number overflow";
    },
    {
      code: 6028;
      name: "TooEarlyToExerciseContract";
      msg: "too early to exercise contract";
    }
  ];
};
export const SoloptionsIDLJsonRaw = {
  version: "0.1.0",
  name: "soloptions",
  instructions: [
    {
      name: "newContract",
      docs: ["Creates a new [OptionsContract]."],
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "contract",
          isMut: true,
          isSigner: false,
        },
        {
          name: "writerMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingMint",
          isMut: true,
          isSigner: false,
          docs: ["The mint for the underlying asset, for example, WBTC."],
        },
        {
          name: "quoteMint",
          isMut: true,
          isSigner: false,
          docs: [
            "The mint for the quote asset (ie the strike), for example, USDC.",
          ],
        },
        {
          name: "underlyingPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "quotePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mintFeeAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "exerciseFeeAccount",
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
          name: "associatedTokenProgram",
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
          name: "underlyingAmount",
          type: "u64",
        },
        {
          name: "quoteAmount",
          type: "u64",
        },
        {
          name: "expiryTs",
          type: "u64",
        },
        {
          name: "contractBump",
          type: "u8",
        },
        {
          name: "optionBump",
          type: "u8",
        },
        {
          name: "writerBump",
          type: "u8",
        },
      ],
    },
    {
      name: "optionWrite",
      docs: ["Writes options for an [OptionsContract]."],
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
          docs: [
            "The authority of the [user_underlying_funding_tokens] account.",
          ],
        },
        {
          name: "contract",
          isMut: false,
          isSigner: false,
          docs: ["The options contract."],
        },
        {
          name: "userUnderlyingFundingTokens",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingPool",
          isMut: true,
          isSigner: false,
          docs: ["Contract underlying token pool"],
        },
        {
          name: "writerTokenDestination",
          isMut: true,
          isSigner: false,
          docs: ["The writer token account to send to."],
        },
        {
          name: "optionTokenDestination",
          isMut: true,
          isSigner: false,
          docs: ["The option token account to send to."],
        },
        {
          name: "writerMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "feeDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingMint",
          isMut: false,
          isSigner: false,
          docs: ["Mint for the underlying asset. Used as a seed for CPI"],
        },
        {
          name: "quoteMint",
          isMut: false,
          isSigner: false,
          docs: ["Mint for the quote asset. Used as a seed for CPI"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "writeAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "optionExercise",
      docs: ["Exercises options."],
      accounts: [
        {
          name: "exerciserAuthority",
          isMut: false,
          isSigner: true,
          docs: ["The authority of the [option_token_source] account."],
        },
        {
          name: "contract",
          isMut: false,
          isSigner: false,
          docs: ["The options contract."],
        },
        {
          name: "quoteTokenSource",
          isMut: true,
          isSigner: false,
          docs: ["The user's quote tokens used to fund writing the options."],
        },
        {
          name: "contractQuoteTokens",
          isMut: true,
          isSigner: false,
          docs: ["The contract's quote tokens."],
        },
        {
          name: "optionMint",
          isMut: true,
          isSigner: false,
          docs: ["The option mint."],
        },
        {
          name: "optionTokenSource",
          isMut: true,
          isSigner: false,
          docs: ["The user's options tokens used to fund writing the options."],
        },
        {
          name: "contractUnderlyingTokens",
          isMut: true,
          isSigner: false,
          docs: [
            "The contract's underlying tokens which collateralize the options.",
          ],
        },
        {
          name: "underlyingTokenDestination",
          isMut: true,
          isSigner: false,
          docs: ["The option token account to send to."],
        },
        {
          name: "underlyingMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "quoteMint",
          isMut: false,
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
          docs: ["Token program."],
        },
      ],
      args: [
        {
          name: "numContracts",
          type: "u64",
        },
      ],
    },
    {
      name: "optionRedeem",
      accounts: [
        {
          name: "redeemerAuthority",
          isMut: false,
          isSigner: true,
          docs: ["The authority of the [option_token_source] account."],
        },
        {
          name: "contract",
          isMut: false,
          isSigner: false,
          docs: ["The options contract."],
        },
        {
          name: "writerTokenSource",
          isMut: true,
          isSigner: false,
          docs: ["The writer's writer token account."],
        },
        {
          name: "writerMint",
          isMut: true,
          isSigner: false,
          docs: ["The writer mint."],
        },
        {
          name: "contractUnderlyingTokens",
          isMut: true,
          isSigner: false,
          docs: [
            "The contract's underlying tokens which collateralize the options.",
          ],
        },
        {
          name: "contractQuoteTokens",
          isMut: true,
          isSigner: false,
          docs: ["The contract's quote tokens."],
        },
        {
          name: "underlyingTokenDestination",
          isMut: true,
          isSigner: false,
          docs: ["The underlying token account to send to."],
        },
        {
          name: "quoteTokenDestination",
          isMut: true,
          isSigner: false,
          docs: ["The quote token account to send to."],
        },
        {
          name: "underlyingMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "quoteMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Token program."],
        },
      ],
      args: [
        {
          name: "numContracts",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "OptionsContract",
      docs: [
        "American option",
        "",
        "e.x. 0.1WBTC @ 5000 USDC",
        'suppose both have 9 decimal places for "sats" or whatever',
        'exercising ONE contract will be buying 10^8 "sats" of WBTC token',
        "Given strike is 5000, will require:",
        "num_options * strike * num_decimals_quote",
        "",
        "Passing in a u64 for underlying_multiplier won't work, suppose you want to do",
        "the ETH/BTC pair, write an option for 1 ETH at 0.1BTC. You want 0.1 of the quote",
        "for every unit of the underlying",
        "",
        'Could pass in a ratio, or just do an amount of "sats" for both explicitly to',
        "make things easier",
      ],
      type: {
        kind: "struct",
        fields: [
          {
            name: "underlyingMint",
            docs: ["Underlying asset"],
            type: "publicKey",
          },
          {
            name: "quoteMint",
            docs: ["Strike price is denominated in this"],
            type: "publicKey",
          },
          {
            name: "expiryTs",
            docs: ["When the option expires."],
            type: "u64",
          },
          {
            name: "contractBump",
            docs: ["Bump seeds."],
            type: "u8",
          },
          {
            name: "writerBump",
            type: "u8",
          },
          {
            name: "optionBump",
            type: "u8",
          },
          {
            name: "underlyingAmount",
            docs: [
              "10^{Number of decimals of the underlying per contract}.",
              "e.g. if the contract had 9 decimals and this was 10^8,",
              "each contract would be for 0.1 of the underlying",
            ],
            type: "u64",
          },
          {
            name: "quoteAmount",
            docs: ["Same logic as underlying"],
            type: "u64",
          },
          {
            name: "writerMint",
            docs: [
              "The right to receive the proceeds from the option being exercised.",
            ],
            type: "publicKey",
          },
          {
            name: "optionMint",
            docs: ["The option which can be exercised."],
            type: "publicKey",
          },
          {
            name: "underlyingPool",
            docs: [
              "The address for the contract's pool of the underlying asset",
            ],
            type: "publicKey",
          },
          {
            name: "quotePool",
            docs: ["The address for the contract's pool of the quote asset"],
            type: "publicKey",
          },
          {
            name: "mintFeeAccount",
            type: "publicKey",
          },
          {
            name: "exerciseFeeAccount",
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
            name: "extraInt1",
            type: "u64",
          },
          {
            name: "extraInt2",
            type: "u64",
          },
          {
            name: "extraBool",
            type: "bool",
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
      name: "InvalidContractExpiry",
      msg: "Invalid contract expiry.",
    },
    {
      code: 6002,
      name: "ContractExpired",
      msg: "Options contract is expired.",
    },
    {
      code: 6003,
      name: "ContractNotYetExpired",
      msg: "Cannot redeem until contract expiry.",
    },
    {
      code: 6004,
      name: "InvalidMultiplier",
      msg: "Multiplier must be between 1 and 1000000",
    },
    {
      code: 6005,
      name: "InvalidFee",
      msg: "Invalid fee",
    },
    {
      code: 6006,
      name: "InvalidFeeOwner",
      msg: "Invalid fee owner",
    },
    {
      code: 6007,
      name: "InvalidQuoteTokenSource",
      msg: "invalid quote token source",
    },
    {
      code: 6008,
      name: "InvalidOptionTokenSource",
      msg: "invalid option token source",
    },
    {
      code: 6009,
      name: "InvalidWriterTokenSource",
      msg: "invalid writer token source",
    },
    {
      code: 6010,
      name: "InvalidWriterTokenDestination",
      msg: "invalid writer token destination",
    },
    {
      code: 6011,
      name: "InvalidUserUnderlyingTokens",
      msg: "invalid user underlying tokens",
    },
    {
      code: 6012,
      name: "InvalidUserQuoteTokens",
      msg: "invalid user quote tokens",
    },
    {
      code: 6013,
      name: "InvalidContractUnderlyingPool",
      msg: "invalid contract quote pool",
    },
    {
      code: 6014,
      name: "InvalidContractQuotePool",
      msg: "invalid contract quote pool",
    },
    {
      code: 6015,
      name: "InvalidOptionMint",
      msg: "invalid option mint",
    },
    {
      code: 6016,
      name: "InvalidWriterMint",
      msg: "invalid writer mint",
    },
    {
      code: 6017,
      name: "InvalidUnderlyingMint",
      msg: "invalid underlying mint",
    },
    {
      code: 6018,
      name: "InvalidQuoteMint",
      msg: "invalid quote mint",
    },
    {
      code: 6019,
      name: "InvalidUnderlyingOrQuoteAmount",
      msg: "invalid underlying or quote amount",
    },
    {
      code: 6020,
      name: "RoundUnderlyingTokensMintDoesNotMatchVoltVault",
      msg: "round underlying tokens does not match volt",
    },
    {
      code: 6021,
      name: "NotEnoughUnderlyingTokens",
      msg: "not enough underlying tokens",
    },
    {
      code: 6022,
      name: "NotEnoughWriterTokens",
      msg: "not enough writer tokens",
    },
    {
      code: 6023,
      name: "NotEnoughOptionTokens",
      msg: "not enough option tokens",
    },
    {
      code: 6024,
      name: "MustBeNonZeroRedemption",
      msg: "must be non zero # writer tokens being redeemed",
    },
    {
      code: 6025,
      name: "MustBeNonZeroWriteAmount",
      msg: "must be non zero write amount",
    },
    {
      code: 6026,
      name: "MustBeNonZeroExercise",
      msg: "must be non zero exercise",
    },
    {
      code: 6027,
      name: "NumberOverflow",
      msg: "number overflow",
    },
    {
      code: 6028,
      name: "TooEarlyToExerciseContract",
      msg: "too early to exercise contract",
    },
  ],
};
