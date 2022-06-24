"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsSDK = exports.DefaultSpreadsSDKOpts = void 0;
var tslib_1 = require("tslib");
var friktion_utils_1 = require("@friktion-labs/friktion-utils");
var anchor_1 = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var decimal_js_1 = tslib_1.__importDefault(require("decimal.js"));
var __1 = require("../..");
var spreadsUtils_1 = require("./spreadsUtils");
exports.DefaultSpreadsSDKOpts = {
    network: "mainnet-beta",
};
var SpreadsSDK = /** @class */ (function () {
    function SpreadsSDK(spreadsContract, opts) {
        var defaultedOpts = Object.assign({}, opts, exports.DefaultSpreadsSDKOpts);
        this.readonlyProvider = (0, friktion_utils_1.providerToAnchorProvider)(defaultedOpts.provider);
        this.network = !opts.network
            ? "mainnet-beta"
            : opts.network === "testnet" || opts.network === "localnet"
                ? "mainnet-beta"
                : opts.network;
        var spreadsIdl = __1.OTHER_IDLS.Spreads;
        if (!spreadsIdl) {
            console.error("SPREADS_IDLS", __1.OTHER_IDLS);
            // this used to be a big bug
            throw new Error("Unable to load SpreadsSDK because idl is missing");
        }
        var Spreads = new anchor_1.Program(spreadsIdl, __1.OPTIONS_PROGRAM_IDS.Spreads.toString(), this.readonlyProvider);
        this.program = Spreads;
        this.spreadsContract = spreadsContract;
        this.spreadsKey = spreadsContract.key;
    }
    SpreadsSDK.createSpread = function (sdk, params, admin) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var underlyingMint, quoteMint, underlyingAmountBuy, quoteAmountBuy, underlyingAmountSell, quoteAmountSell, mintFeeAccount, exerciseFeeAccount, expiryTs, isCall, oracleAi, contract, optionMint, writerMint, underlyingPool, claimablePool, initializeAccounts, newContractIx;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        underlyingMint = params.underlyingMint, quoteMint = params.quoteMint, underlyingAmountBuy = params.underlyingAmountBuy, quoteAmountBuy = params.quoteAmountBuy, underlyingAmountSell = params.underlyingAmountSell, quoteAmountSell = params.quoteAmountSell, mintFeeAccount = params.mintFeeAccount, exerciseFeeAccount = params.exerciseFeeAccount, expiryTs = params.expiryTs, isCall = params.isCall, oracleAi = params.oracleAi;
                        return [4 /*yield*/, SpreadsSDK.findContractAddress(underlyingMint, quoteMint, underlyingAmountBuy, quoteAmountBuy, underlyingAmountSell, quoteAmountSell, expiryTs, isCall ? new anchor_1.BN(1) : new anchor_1.BN(0), sdk.programs.Spreads.programId)];
                    case 1:
                        contract = (_a.sent())[0];
                        return [4 /*yield*/, SpreadsSDK.findOptionMintAddress(contract)];
                    case 2:
                        optionMint = (_a.sent())[0];
                        return [4 /*yield*/, SpreadsSDK.findWriterMintAddress(contract)];
                    case 3:
                        writerMint = (_a.sent())[0];
                        return [4 /*yield*/, SpreadsSDK.findUnderlyingPoolAddress(contract)];
                    case 4:
                        underlyingPool = (_a.sent())[0];
                        return [4 /*yield*/, SpreadsSDK.findClaimablePoolAddress(contract)];
                    case 5:
                        claimablePool = (_a.sent())[0];
                        initializeAccounts = {
                            adminKey: admin,
                            payer: admin,
                            oracleAi: oracleAi,
                            contract: contract,
                            writerMint: writerMint,
                            optionMint: optionMint,
                            quoteMint: quoteMint,
                            underlyingMint: underlyingMint,
                            underlyingPool: underlyingPool,
                            claimablePool: claimablePool,
                            mintFeeAccount: mintFeeAccount,
                            exerciseFeeAccount: exerciseFeeAccount,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        newContractIx = sdk.programs.Spreads.instruction.newSpread(underlyingAmountBuy, quoteAmountBuy, underlyingAmountSell, quoteAmountSell, expiryTs, isCall ? new anchor_1.BN(1) : new anchor_1.BN(0), {
                            accounts: initializeAccounts,
                        });
                        return [2 /*return*/, {
                                ix: newContractIx,
                                spreadsKey: contract,
                            }];
                }
            });
        });
    };
    SpreadsSDK.prototype.canExercise = function () {
        return this.spreadsContract.wasSettleCranked;
    };
    SpreadsSDK.getStubOracleByKey = function (sdk, key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sdk.programs.Spreads.account.stubOracle.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    SpreadsSDK.findStubOracleAddress = function (user, pdaString, programId) {
        if (programId === void 0) { programId = __1.OPTIONS_PROGRAM_IDS.Spreads; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                textEncoder.encode("stubOracle"),
                                user.toBuffer(),
                                textEncoder.encode(pdaString),
                            ], programId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.createStubOracle = function (sdk, user, price, pdaString) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var oracleKey, accounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SpreadsSDK.findStubOracleAddress(user, pdaString)];
                    case 1:
                        oracleKey = (_a.sent())[0];
                        accounts = {
                            authority: user,
                            stubOracle: oracleKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, {
                                oracleKey: oracleKey,
                                instruction: sdk.programs.Spreads.instruction.createStubOracle(price, pdaString, {
                                    accounts: accounts,
                                }),
                            }];
                }
            });
        });
    };
    SpreadsSDK.setStubOracle = function (sdk, user, stubOracleKey, price) {
        var accounts = {
            authority: user,
            stubOracle: stubOracleKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        };
        return sdk.programs.Spreads.instruction.setStubOracle(price, {
            accounts: accounts,
        });
    };
    SpreadsSDK.prototype.getSpreadsExerciseFeeAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SpreadsSDK.getGenericSpreadsExerciseFeeAccount(this.spreadsContract.quoteMint)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.getGenericSpreadsExerciseFeeAccount = function (quoteAssetMint) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(quoteAssetMint, __1.SPREADS_FEE_OWNER)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.prototype.isCall = function () {
        return this.spreadsContract.isCall.gtn(0);
    };
    SpreadsSDK.prototype.totalPossibleToMint = function (ulAmount) {
        return ulAmount.div(this.getRequiredCollateral(new anchor_1.BN(1)).add(this.mintFeeAmount(new anchor_1.BN(1))));
    };
    SpreadsSDK.prototype.getRequiredCollateral = function (numOptionTokensMinted) {
        var requiredCollateralForOneToken;
        if (this.isCall()) {
            requiredCollateralForOneToken = new anchor_1.BN(new decimal_js_1.default(this.spreadsContract.quoteAmountBuy
                .sub(this.spreadsContract.quoteAmountSell)
                .toString())
                .mul(new decimal_js_1.default(this.spreadsContract.underlyingAmountBuy.toString()))
                .div(new decimal_js_1.default(this.spreadsContract.quoteAmountSell.toString()))
                .ceil()
                .toFixed(0));
        }
        else {
            requiredCollateralForOneToken =
                this.spreadsContract.underlyingAmountSell.sub(this.spreadsContract.underlyingAmountBuy);
        }
        return requiredCollateralForOneToken.mul(numOptionTokensMinted);
    };
    SpreadsSDK.prototype.mintFeeAmount = function (numOptionTokensMinted) {
        if (numOptionTokensMinted.lten(0)) {
            return new anchor_1.BN(0);
        }
        return numOptionTokensMinted
            .mul(this.getRequiredCollateral(numOptionTokensMinted))
            .muln(__1.SPREADS_MINT_FEE_BPS)
            .divn(10000);
    };
    SpreadsSDK.getSpreadsContractByKey = function (program, key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var spreadsContract;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, spreadsUtils_1.getSpreadsContractByKeyOrNull)(program, key)];
                    case 1:
                        spreadsContract = _a.sent();
                        if (!spreadsContract) {
                            throw new Error("could not find Spreads market for key");
                        }
                        return [2 /*return*/, spreadsContract];
                }
            });
        });
    };
    SpreadsSDK.getProgramAddress = function (program, kind, underlyingMint, quoteMint, underlyingAmount, quoteAmount, expiry, isCall) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                textEncoder.encode(kind),
                                underlyingMint.toBuffer(),
                                quoteMint.toBuffer(),
                                new anchor_1.BN(underlyingAmount.toString()).toBuffer("le", 8),
                                new anchor_1.BN(quoteAmount.toString()).toBuffer("le", 8),
                                new anchor_1.BN(expiry.toString()).toBuffer("le", 8),
                                isCall ? new anchor_1.BN(1).toBuffer() : new anchor_1.BN(0).toBuffer("le", 8),
                            ], program.programId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.prototype.getOptionMintAddress = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SpreadsSDK.findOptionMintAddress(this.spreadsKey)];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    SpreadsSDK.prototype.getWriterMintAddress = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SpreadsSDK.findWriterMintAddress(this.spreadsKey)];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    SpreadsSDK.prototype.getClaimablePoolAddress = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SpreadsSDK.findClaimablePoolAddress(this.spreadsKey)];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    SpreadsSDK.prototype.getUnderlyingPoolAddress = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SpreadsSDK.findUnderlyingPoolAddress(this.spreadsKey)];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    SpreadsSDK.findOptionMintAddress = function (contractKey, spreadsProgramId) {
        if (spreadsProgramId === void 0) { spreadsProgramId = __1.OPTIONS_PROGRAM_IDS.Spreads; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([textEncoder.encode("OptionMint"), contractKey.toBuffer()], spreadsProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.findWriterMintAddress = function (contractKey, spreadsProgramId) {
        if (spreadsProgramId === void 0) { spreadsProgramId = __1.OPTIONS_PROGRAM_IDS.Spreads; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([textEncoder.encode("WriterMint"), contractKey.toBuffer()], spreadsProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.findUnderlyingPoolAddress = function (contractKey, spreadsProgramId) {
        if (spreadsProgramId === void 0) { spreadsProgramId = __1.OPTIONS_PROGRAM_IDS.Spreads; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([textEncoder.encode("UnderlyingPool"), contractKey.toBuffer()], spreadsProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.findClaimablePoolAddress = function (contractKey, spreadsProgramId) {
        if (spreadsProgramId === void 0) { spreadsProgramId = __1.OPTIONS_PROGRAM_IDS.Spreads; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([textEncoder.encode("ClaimablePool"), contractKey.toBuffer()], spreadsProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.findContractAddress = function (underlyingMint, quoteMint, underlyingAmountBuy, quoteAmountBuy, underlyingAmountSell, quoteAmountSell, expiryTs, isCall, spreadsProgramId) {
        if (spreadsProgramId === void 0) { spreadsProgramId = __1.OPTIONS_PROGRAM_IDS.Spreads; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        console.log("program id = ", spreadsProgramId.toString());
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                textEncoder.encode("SpreadsContract"),
                                underlyingMint.toBuffer(),
                                quoteMint.toBuffer(),
                                new anchor_1.BN(underlyingAmountBuy.toString()).toBuffer("le", 8),
                                new anchor_1.BN(quoteAmountBuy.toString()).toBuffer("le", 8),
                                new anchor_1.BN(underlyingAmountSell.toString()).toBuffer("le", 8),
                                new anchor_1.BN(quoteAmountSell.toString()).toBuffer("le", 8),
                                new anchor_1.BN(expiryTs.toString()).toBuffer("le", 8),
                                new anchor_1.BN(isCall.toString()).toBuffer("le", 8),
                            ], spreadsProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SpreadsSDK.prototype.exercise = function (params) {
        var amount = params.amount, optionTokenSource = params.optionTokenSource, underlyingTokenDestination = params.underlyingTokenDestination;
        var exerciseAccounts = {
            contract: this.spreadsKey,
            exerciserAuthority: params.user,
            optionMint: this.spreadsContract.optionMint,
            optionTokenSource: optionTokenSource,
            underlyingTokenDestination: underlyingTokenDestination,
            claimablePool: this.spreadsContract.claimablePool,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
        };
        return this.program.instruction.exercise(amount, {
            accounts: exerciseAccounts,
        });
    };
    SpreadsSDK.prototype.settle = function (params, bypassCode) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var settlePrice, settleAccounts;
            var _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        settlePrice = (_a = params.settlePrice) !== null && _a !== void 0 ? _a : new anchor_1.BN(0);
                        if (params.settlePrice !== undefined && params.settlePrice !== new anchor_1.BN(0))
                            bypassCode = new anchor_1.BN(11111111);
                        else if (bypassCode === undefined) {
                            bypassCode = new anchor_1.BN(0);
                        }
                        if (bypassCode.ltn(0)) {
                            throw new Error("bypass code must be positive (BN in rust)");
                        }
                        _b = {
                            authority: params.user,
                            oracleAi: this.spreadsContract.oracleAi,
                            contract: this.spreadsKey,
                            claimablePool: this.spreadsContract.claimablePool,
                            underlyingMint: this.spreadsContract.underlyingMint,
                            quoteMint: this.spreadsContract.quoteMint,
                            contractUnderlyingTokens: this.spreadsContract.underlyingPool
                        };
                        return [4 /*yield*/, this.getSpreadsExerciseFeeAccount()];
                    case 1:
                        settleAccounts = (_b.exerciseFeeAccount = _c.sent(),
                            _b.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _b.clock = web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            _b);
                        return [2 /*return*/, this.program.instruction.settle(settlePrice, bypassCode, {
                                accounts: settleAccounts,
                            })];
                }
            });
        });
    };
    SpreadsSDK.prototype.revertSettle = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var revertSettleAccounts;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            authority: params.user,
                            oracleAi: this.spreadsContract.oracleAi,
                            contract: this.spreadsKey,
                            claimablePool: this.spreadsContract.claimablePool,
                            underlyingMint: this.spreadsContract.underlyingMint,
                            quoteMint: this.spreadsContract.quoteMint,
                            contractUnderlyingTokens: this.spreadsContract.underlyingPool
                        };
                        return [4 /*yield*/, this.getSpreadsExerciseFeeAccount()];
                    case 1:
                        revertSettleAccounts = (_a.exerciseFeeAccount = _b.sent(),
                            _a.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _a.clock = web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            _a);
                        return [2 /*return*/, this.program.instruction.revertSettle({
                                accounts: revertSettleAccounts,
                            })];
                }
            });
        });
    };
    SpreadsSDK.prototype.write = function (params) {
        var amount = params.amount, user = params.user, writerUnderlyingFundingTokens = params.writerUnderlyingFundingTokens, writerTokenDestination = params.writerTokenDestination, optionTokenDestination = params.optionTokenDestination, feeDestination = params.feeDestination;
        var writeAccounts = {
            authority: user,
            contract: this.spreadsContract.key,
            optionMint: this.spreadsContract.optionMint,
            optionTokenDestination: optionTokenDestination,
            underlyingPool: this.spreadsContract.underlyingPool,
            writerMint: this.spreadsContract.writerMint,
            writerTokenDestination: writerTokenDestination,
            userUnderlyingFundingTokens: writerUnderlyingFundingTokens,
            feeDestination: feeDestination,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        };
        return this.program.instruction.write(amount, {
            accounts: writeAccounts,
        });
    };
    SpreadsSDK.prototype.redeem = function (params) {
        var user = params.user, underlyingTokenDestination = params.underlyingTokenDestination, redeemerTokenSource = params.redeemerTokenSource, amount = params.amount;
        var redeemAccounts = {
            contract: this.spreadsKey,
            authority: user,
            writerMint: this.spreadsContract.writerMint,
            contractUnderlyingTokens: this.spreadsContract.underlyingPool,
            writerTokenSource: redeemerTokenSource,
            underlyingTokenDestination: underlyingTokenDestination,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
        };
        return this.program.instruction.redeem(new anchor_1.BN(amount), {
            accounts: redeemAccounts,
        });
    };
    SpreadsSDK.prototype.close = function (params) {
        var user = params.user, underlyingTokenDestination = params.underlyingTokenDestination, writerTokenSource = params.writerTokenSource, optionTokenSource = params.optionTokenSource, amount = params.amount;
        var closePositionAccounts = {
            contract: this.spreadsKey,
            authority: user,
            writerMint: this.spreadsContract.writerMint,
            optionMint: this.spreadsContract.optionMint,
            writerTokenSource: writerTokenSource,
            optionTokenSource: optionTokenSource,
            underlyingTokenDestination: underlyingTokenDestination,
            underlyingPool: this.spreadsContract.underlyingPool,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
        };
        return this.program.instruction.closePosition(new anchor_1.BN(amount), {
            accounts: closePositionAccounts,
        });
    };
    return SpreadsSDK;
}());
exports.SpreadsSDK = SpreadsSDK;
