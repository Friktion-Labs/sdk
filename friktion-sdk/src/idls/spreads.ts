export type SpreadsIDL = {
  version: "0.1.0";
  name: "spreads";
  instructions: [
    {
      name: "newSpread";
      accounts: [
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "adminKey";
          isMut: false;
          isSigner: false;
        },
        {
          name: "oracleAi";
          isMut: false;
          isSigner: false;
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
          name: "claimablePool";
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
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "underlyingAmountBuy";
          type: "u64";
        },
        {
          name: "quoteAmountBuy";
          type: "u64";
        },
        {
          name: "underlyingAmountSell";
          type: "u64";
        },
        {
          name: "quoteAmountSell";
          type: "u64";
        },
        {
          name: "expiryTs";
          type: "u64";
        },
        {
          name: "isCall";
          type: "u64";
        }
      ];
    },
    {
      name: "write";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "contract";
          isMut: false;
          isSigner: false;
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
        },
        {
          name: "writerTokenDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "optionTokenDestination";
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
      args: [
        {
          name: "writeAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "closePosition";
      accounts: [
        {
          name: "authority";
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
          name: "writerMint";
          isMut: true;
          isSigner: false;
          docs: ["The option mint."];
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
          docs: [
            "The user's options tokens used to represent write of exercise."
          ];
        },
        {
          name: "writerTokenSource";
          isMut: true;
          isSigner: false;
          docs: ["The user's options tokens used to fund writing the options."];
        },
        {
          name: "underlyingTokenDestination";
          isMut: true;
          isSigner: false;
          docs: ["The underlying token account to send collateral to."];
        },
        {
          name: "underlyingPool";
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
      name: "revertSettle";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "contract";
          isMut: true;
          isSigner: false;
          docs: ["The options contract."];
        },
        {
          name: "oracleAi";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "quoteMint";
          isMut: true;
          isSigner: false;
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
          name: "claimablePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "exerciseFeeAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Token Program."];
        }
      ];
      args: [];
    },
    {
      name: "settle";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "contract";
          isMut: true;
          isSigner: false;
          docs: ["The options contract."];
        },
        {
          name: "oracleAi";
          isMut: true;
          isSigner: false;
        },
        {
          name: "underlyingMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "quoteMint";
          isMut: true;
          isSigner: false;
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
          name: "claimablePool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "exerciseFeeAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Token Program."];
        }
      ];
      args: [
        {
          name: "settlePrice";
          type: "u64";
        },
        {
          name: "bypassCode";
          type: "u64";
        }
      ];
    },
    {
      name: "redeem";
      accounts: [
        {
          name: "authority";
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
          name: "underlyingTokenDestination";
          isMut: true;
          isSigner: false;
          docs: ["The underlying token account to send to."];
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
      name: "exercise";
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
          name: "optionMint";
          isMut: true;
          isSigner: false;
          docs: ["The option mint."];
        },
        {
          name: "optionTokenSource";
          isMut: true;
          isSigner: false;
          docs: ["The user's options tokens representing right to exercise."];
        },
        {
          name: "underlyingTokenDestination";
          isMut: true;
          isSigner: false;
          docs: ["The underlying token account to send to."];
        },
        {
          name: "claimablePool";
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
      name: "createStubOracle";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "stubOracle";
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
      args: [
        {
          name: "price";
          type: "f64";
        },
        {
          name: "pdaStr";
          type: "string";
        }
      ];
    },
    {
      name: "setStubOracle";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "stubOracle";
          isMut: true;
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
          name: "price";
          type: "f64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "SpreadsContract";
      type: {
        kind: "struct";
        fields: [
          {
            name: "adminKey";
            type: "publicKey";
          },
          {
            name: "oracleAi";
            type: "publicKey";
          },
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
            name: "underlyingDecimals";
            type: "u8";
          },
          {
            name: "quoteDecimals";
            type: "u8";
          },
          {
            name: "expiryTs";
            docs: ["When the options expire."];
            type: "u64";
          },
          {
            name: "isCall";
            docs: ["Whether is a call or put"];
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
            name: "underlyingPoolBump";
            type: "u8";
          },
          {
            name: "claimablePoolBump";
            type: "u8";
          },
          {
            name: "optionBump";
            type: "u8";
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
            name: "claimablePool";
            docs: [
              "The address for the claimable pool where coin goes after expiry, when option was ITM"
            ];
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
            name: "wasSettleCranked";
            type: "bool";
          },
          {
            name: "exerciseAmount";
            type: "u64";
          },
          {
            name: "totalAmount";
            type: "u64";
          },
          {
            name: "underlyingAmountBuy";
            type: "u64";
          },
          {
            name: "quoteAmountBuy";
            type: "u64";
          },
          {
            name: "underlyingAmountSell";
            type: "u64";
          },
          {
            name: "quoteAmountSell";
            type: "u64";
          },
          {
            name: "settlePrice";
            type: "f64";
          },
          {
            name: "extraKey1";
            type: "publicKey";
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
  errors: [
    {
      code: 6000;
      name: "Unauthorized";
      msg: "Unauthorized.";
    },
    {
      code: 6001;
      name: "TooEarlyToExercise";
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
    },
    {
      code: 6029;
      name: "TooEarlyToSettleContract";
      msg: "too early to settle contract";
    },
    {
      code: 6030;
      name: "SettleWasNotCranked";
      msg: "settle must be cranked";
    },
    {
      code: 6031;
      name: "NothingInClaimablePool";
      msg: "nothing in claimable pool";
    },
    {
      code: 6032;
      name: "InvalidAuthorityForPermissionedInstruction";
      msg: "Invalid authority for permissioned instruction";
    },
    {
      code: 6033;
      name: "TooLateToClosePosition";
      msg: "Too late to close positiion";
    },
    {
      code: 6034;
      name: "MustBeNonZeroClose";
      msg: "must be non zero close position";
    },
    {
      code: 6035;
      name: "OptionHasAlreadyBeenCranked";
      msg: "option has already been cranked";
    },
    {
      code: 6036;
      name: "LowerStrikeMustBeLower";
      msg: "lower strike must be lower";
    },
    {
      code: 6037;
      name: "BuyQuoteAmountMustBeHigherThanSellForCall";
      msg: "buy call quote amt error";
    },
    {
      code: 6038;
      name: "BuyUnderlyingAmountMustBeLowerThanSellForPut";
      msg: "buy put underlying amt error";
    },
    {
      code: 6039;
      name: "SomethingUnexpectedHasHappened";
      msg: "something unexpected has happened";
    },
    {
      code: 6040;
      name: "UnderlyingAmountsForCallMustBeEqual";
      msg: "ul amounts call must be equal";
    },
    {
      code: 6041;
      name: "QuoteAmountsForPutMustBeEqual";
      msg: "quote amounts put must be equal";
    },
    {
      code: 6042;
      name: "ExpiryInThePast";
      msg: "expiry is in the past, please give an expiry time in the future";
    }
  ];
};
export const SpreadsIDLJsonRaw = {
  version: "0.1.0",
  name: "spreads",
  instructions: [
    {
      name: "newSpread",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "adminKey",
          isMut: false,
          isSigner: false,
        },
        {
          name: "oracleAi",
          isMut: false,
          isSigner: false,
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
          name: "claimablePool",
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
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "underlyingAmountBuy",
          type: "u64",
        },
        {
          name: "quoteAmountBuy",
          type: "u64",
        },
        {
          name: "underlyingAmountSell",
          type: "u64",
        },
        {
          name: "quoteAmountSell",
          type: "u64",
        },
        {
          name: "expiryTs",
          type: "u64",
        },
        {
          name: "isCall",
          type: "u64",
        },
      ],
    },
    {
      name: "write",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "contract",
          isMut: false,
          isSigner: false,
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
        },
        {
          name: "writerTokenDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "optionTokenDestination",
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
      args: [
        {
          name: "writeAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "closePosition",
      accounts: [
        {
          name: "authority",
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
          name: "writerMint",
          isMut: true,
          isSigner: false,
          docs: ["The option mint."],
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
          docs: [
            "The user's options tokens used to represent write of exercise.",
          ],
        },
        {
          name: "writerTokenSource",
          isMut: true,
          isSigner: false,
          docs: ["The user's options tokens used to fund writing the options."],
        },
        {
          name: "underlyingTokenDestination",
          isMut: true,
          isSigner: false,
          docs: ["The underlying token account to send collateral to."],
        },
        {
          name: "underlyingPool",
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
      name: "revertSettle",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "contract",
          isMut: true,
          isSigner: false,
          docs: ["The options contract."],
        },
        {
          name: "oracleAi",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "quoteMint",
          isMut: true,
          isSigner: false,
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
          name: "claimablePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "exerciseFeeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Token Program."],
        },
      ],
      args: [],
    },
    {
      name: "settle",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "contract",
          isMut: true,
          isSigner: false,
          docs: ["The options contract."],
        },
        {
          name: "oracleAi",
          isMut: true,
          isSigner: false,
        },
        {
          name: "underlyingMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "quoteMint",
          isMut: true,
          isSigner: false,
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
          name: "claimablePool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "exerciseFeeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Token Program."],
        },
      ],
      args: [
        {
          name: "settlePrice",
          type: "u64",
        },
        {
          name: "bypassCode",
          type: "u64",
        },
      ],
    },
    {
      name: "redeem",
      accounts: [
        {
          name: "authority",
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
          name: "underlyingTokenDestination",
          isMut: true,
          isSigner: false,
          docs: ["The underlying token account to send to."],
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
      name: "exercise",
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
          name: "optionMint",
          isMut: true,
          isSigner: false,
          docs: ["The option mint."],
        },
        {
          name: "optionTokenSource",
          isMut: true,
          isSigner: false,
          docs: ["The user's options tokens representing right to exercise."],
        },
        {
          name: "underlyingTokenDestination",
          isMut: true,
          isSigner: false,
          docs: ["The underlying token account to send to."],
        },
        {
          name: "claimablePool",
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
      name: "createStubOracle",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "stubOracle",
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
      args: [
        {
          name: "price",
          type: "f64",
        },
        {
          name: "pdaStr",
          type: "string",
        },
      ],
    },
    {
      name: "setStubOracle",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "stubOracle",
          isMut: true,
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
          name: "price",
          type: "f64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "SpreadsContract",
      type: {
        kind: "struct",
        fields: [
          {
            name: "adminKey",
            type: "publicKey",
          },
          {
            name: "oracleAi",
            type: "publicKey",
          },
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
            name: "underlyingDecimals",
            type: "u8",
          },
          {
            name: "quoteDecimals",
            type: "u8",
          },
          {
            name: "expiryTs",
            docs: ["When the options expire."],
            type: "u64",
          },
          {
            name: "isCall",
            docs: ["Whether is a call or put"],
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
            name: "underlyingPoolBump",
            type: "u8",
          },
          {
            name: "claimablePoolBump",
            type: "u8",
          },
          {
            name: "optionBump",
            type: "u8",
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
            name: "claimablePool",
            docs: [
              "The address for the claimable pool where coin goes after expiry, when option was ITM",
            ],
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
            name: "wasSettleCranked",
            type: "bool",
          },
          {
            name: "exerciseAmount",
            type: "u64",
          },
          {
            name: "totalAmount",
            type: "u64",
          },
          {
            name: "underlyingAmountBuy",
            type: "u64",
          },
          {
            name: "quoteAmountBuy",
            type: "u64",
          },
          {
            name: "underlyingAmountSell",
            type: "u64",
          },
          {
            name: "quoteAmountSell",
            type: "u64",
          },
          {
            name: "settlePrice",
            type: "f64",
          },
          {
            name: "extraKey1",
            type: "publicKey",
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
  errors: [
    {
      code: 6000,
      name: "Unauthorized",
      msg: "Unauthorized.",
    },
    {
      code: 6001,
      name: "TooEarlyToExercise",
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
    {
      code: 6029,
      name: "TooEarlyToSettleContract",
      msg: "too early to settle contract",
    },
    {
      code: 6030,
      name: "SettleWasNotCranked",
      msg: "settle must be cranked",
    },
    {
      code: 6031,
      name: "NothingInClaimablePool",
      msg: "nothing in claimable pool",
    },
    {
      code: 6032,
      name: "InvalidAuthorityForPermissionedInstruction",
      msg: "Invalid authority for permissioned instruction",
    },
    {
      code: 6033,
      name: "TooLateToClosePosition",
      msg: "Too late to close positiion",
    },
    {
      code: 6034,
      name: "MustBeNonZeroClose",
      msg: "must be non zero close position",
    },
    {
      code: 6035,
      name: "OptionHasAlreadyBeenCranked",
      msg: "option has already been cranked",
    },
    {
      code: 6036,
      name: "LowerStrikeMustBeLower",
      msg: "lower strike must be lower",
    },
    {
      code: 6037,
      name: "BuyQuoteAmountMustBeHigherThanSellForCall",
      msg: "buy call quote amt error",
    },
    {
      code: 6038,
      name: "BuyUnderlyingAmountMustBeLowerThanSellForPut",
      msg: "buy put underlying amt error",
    },
    {
      code: 6039,
      name: "SomethingUnexpectedHasHappened",
      msg: "something unexpected has happened",
    },
    {
      code: 6040,
      name: "UnderlyingAmountsForCallMustBeEqual",
      msg: "ul amounts call must be equal",
    },
    {
      code: 6041,
      name: "QuoteAmountsForPutMustBeEqual",
      msg: "quote amounts put must be equal",
    },
    {
      code: 6042,
      name: "ExpiryInThePast",
      msg: "expiry is in the past, please give an expiry time in the future",
    },
  ],
};
