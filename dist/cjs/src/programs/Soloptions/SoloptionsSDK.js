"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoloptionsSDK = exports.DefaultSoloptionsSDKOpts = void 0;
var tslib_1 = require("tslib");
var anchor_1 = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var __1 = require("../..");
var _1 = require(".");
var soloptionsUtils_1 = require("./soloptionsUtils");
exports.DefaultSoloptionsSDKOpts = {
    network: "mainnet-beta",
};
var SoloptionsSDK = /** @class */ (function () {
    function SoloptionsSDK(friktionSdk, optionMarket) {
        this.readonlyProvider = friktionSdk.readonlyProvider;
        this.network = friktionSdk.network;
        this.program = friktionSdk.programs.Soloptions;
        this.optionsContract = optionMarket;
        this.optionKey = optionMarket.key;
    }
    SoloptionsSDK.prototype.getSoloptionsExerciseFeeAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, SoloptionsSDK.getGenericSoloptionsExerciseFeeAccount(this.optionsContract.quoteMint)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SoloptionsSDK.getGenericSoloptionsExerciseFeeAccount = function (quoteAssetMint) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(quoteAssetMint, __1.SOLOPTIONS_FEE_OWNER)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SoloptionsSDK.prototype.mintFeeAmount = function (numOptionTokensMinted) {
        if (numOptionTokensMinted.lten(0)) {
            return new anchor_1.BN(0);
        }
        return numOptionTokensMinted
            .mul(this.optionsContract.underlyingAmount)
            .muln(__1.SOLOPTIONS_MINT_FEE_BPS)
            .divn(10000);
    };
    SoloptionsSDK.prototype.exerciseFeeAmount = function (numOptionTokensToExercise) {
        if (numOptionTokensToExercise.lten(0)) {
            return new anchor_1.BN(0);
        }
        return numOptionTokensToExercise
            .mul(this.optionsContract.underlyingAmount)
            .muln(__1.SOLOPTIONS_EXERCISE_FEE_BPS)
            .divn(10000);
    };
    SoloptionsSDK.getOptionMarketByKey = function (program, key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = _1.convertSoloptionsContractToOptionMarket;
                        _b = [{}];
                        return [4 /*yield*/, (0, soloptionsUtils_1.getSoloptionsContractByKey)(program, key)];
                    case 1:
                        optionMarket = _a.apply(void 0, [tslib_1.__assign.apply(void 0, [tslib_1.__assign.apply(void 0, _b.concat([(_c.sent())])), { key: key }])]);
                        if (!optionMarket) {
                            throw new Error("could not find Soloptions market for key");
                        }
                        return [2 /*return*/, optionMarket];
                }
            });
        });
    };
    SoloptionsSDK.getProgramAddress = function (program, kind, underlyingMint, quoteMint, underlyingAmount, quoteAmount, expiry) {
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
                            ], program.programId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SoloptionsSDK.initializeOptionMarketAndGetSdk = function (sdk, opts, providerMut, params, user) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var underlyingMint, quoteMint, underlyingAmount, quoteAmount, mintFeeAccount, exerciseFeeAccount, expiryTs, seeds, _a, contract, contractBump, _b, optionMint, optionBump, _c, writerMint, writerBump, underlyingPool, quotePool, extraKeys, optionMarketStruct, newContractIx, optionMarket;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        underlyingMint = params.underlyingMint, quoteMint = params.quoteMint, underlyingAmount = params.underlyingAmount, quoteAmount = params.quoteAmount, mintFeeAccount = params.mintFeeAccount, exerciseFeeAccount = params.exerciseFeeAccount, expiryTs = params.expiryTs;
                        seeds = [
                            underlyingMint,
                            quoteMint,
                            underlyingAmount,
                            quoteAmount,
                            expiryTs,
                        ];
                        return [4 /*yield*/, SoloptionsSDK.getProgramAddress.apply(SoloptionsSDK, tslib_1.__spreadArray([sdk.programs.Soloptions,
                                "OptionsContract"], seeds, false))];
                    case 1:
                        _a = _d.sent(), contract = _a[0], contractBump = _a[1];
                        return [4 /*yield*/, SoloptionsSDK.getProgramAddress.apply(SoloptionsSDK, tslib_1.__spreadArray([sdk.programs.Soloptions,
                                "OptionMint"], seeds, false))];
                    case 2:
                        _b = _d.sent(), optionMint = _b[0], optionBump = _b[1];
                        return [4 /*yield*/, SoloptionsSDK.getProgramAddress.apply(SoloptionsSDK, tslib_1.__spreadArray([sdk.programs.Soloptions,
                                "WriterMint"], seeds, false))];
                    case 3:
                        _c = _d.sent(), writerMint = _c[0], writerBump = _c[1];
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(underlyingMint, contract, true)];
                    case 4:
                        underlyingPool = _d.sent();
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(quoteMint, contract, true)];
                    case 5:
                        quotePool = _d.sent();
                        extraKeys = web3_js_1.SystemProgram.programId;
                        optionMarketStruct = tslib_1.__assign(tslib_1.__assign({}, params), { expiryTs: new anchor_1.BN(expiryTs), underlyingAmount: new anchor_1.BN(params.underlyingAmount), quoteAmount: new anchor_1.BN(params.quoteAmount), key: contract, underlyingPool: underlyingPool, quotePool: quotePool, writerMint: writerMint, optionMint: optionMint, contractBump: contractBump, optionBump: optionBump, writerBump: writerBump, extraKey1: extraKeys, extraKey2: extraKeys, extraInt1: new anchor_1.BN(0), extraInt2: new anchor_1.BN(0), extraBool: false });
                        newContractIx = sdk.programs.Soloptions.instruction.newContract(params.underlyingAmount, params.quoteAmount, new anchor_1.BN(expiryTs), contractBump, optionBump, writerBump, {
                            accounts: {
                                payer: user,
                                contract: contract,
                                writerMint: writerMint,
                                optionMint: optionMint,
                                quoteMint: quoteMint,
                                underlyingMint: underlyingMint,
                                quotePool: quotePool,
                                underlyingPool: underlyingPool,
                                mintFeeAccount: mintFeeAccount,
                                exerciseFeeAccount: exerciseFeeAccount,
                                systemProgram: web3_js_1.SystemProgram.programId,
                                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                            },
                        });
                        optionMarket = (0, _1.convertSoloptionsContractToOptionMarket)(optionMarketStruct);
                        return [2 /*return*/, {
                                ix: newContractIx,
                                optionMarket: optionMarket,
                                optionKey: optionMarketStruct.key,
                            }];
                }
            });
        });
    };
    SoloptionsSDK.prototype.canExercise = function () {
        return this.optionsContract.expiryTs.lt(new anchor_1.BN(Date.now()).divn(1000));
    };
    SoloptionsSDK.prototype.exercise = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var amount, quoteTokenSource, optionTokenSource, underlyingTokenDestination, feeDestination, exerciseAccounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        amount = params.amount, quoteTokenSource = params.quoteTokenSource, optionTokenSource = params.optionTokenSource, underlyingTokenDestination = params.underlyingTokenDestination;
                        return [4 /*yield*/, this.getSoloptionsExerciseFeeAccount()];
                    case 1:
                        feeDestination = _a.sent();
                        exerciseAccounts = {
                            contract: this.optionKey,
                            exerciserAuthority: params.user,
                            quoteTokenSource: quoteTokenSource,
                            contractQuoteTokens: this.optionsContract.quotePool,
                            optionMint: this.optionsContract.optionMint,
                            optionTokenSource: optionTokenSource,
                            contractUnderlyingTokens: this.optionsContract.underlyingPool,
                            underlyingTokenDestination: underlyingTokenDestination,
                            underlyingMint: this.optionsContract.underlyingMint,
                            quoteMint: this.optionsContract.quoteMint,
                            feeDestination: feeDestination,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        };
                        return [2 /*return*/, this.program.instruction.optionExercise(amount, {
                                accounts: exerciseAccounts,
                            })];
                }
            });
        });
    };
    SoloptionsSDK.prototype.write = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var amount, user, writerUnderlyingFundingTokens, writerTokenDestination, optionTokenDestination, feeDestination, writeAccounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        amount = params.amount, user = params.user, writerUnderlyingFundingTokens = params.writerUnderlyingFundingTokens, writerTokenDestination = params.writerTokenDestination, optionTokenDestination = params.optionTokenDestination;
                        return [4 /*yield*/, this.getSoloptionsExerciseFeeAccount()];
                    case 1:
                        feeDestination = _a.sent();
                        writeAccounts = {
                            contract: this.optionsContract.key,
                            optionMint: this.optionsContract.optionMint,
                            quoteMint: this.optionsContract.quoteMint,
                            optionTokenDestination: optionTokenDestination,
                            underlyingMint: this.optionsContract.underlyingMint,
                            underlyingPool: this.optionsContract.underlyingPool,
                            writerMint: this.optionsContract.writerMint,
                            writerTokenDestination: writerTokenDestination,
                            writerAuthority: user,
                            userUnderlyingFundingTokens: writerUnderlyingFundingTokens,
                            feeDestination: feeDestination,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        return [2 /*return*/, this.program.instruction.optionWrite(amount, {
                                accounts: writeAccounts,
                            })];
                }
            });
        });
    };
    SoloptionsSDK.prototype.redeem = function (params) {
        var user = params.user, underlyingTokenDestination = params.underlyingTokenDestination, quoteTokenDestination = params.quoteTokenDestination, redeemerTokenSource = params.redeemerTokenSource, amount = params.amount;
        var redeemAccounts = {
            contract: this.optionKey,
            redeemerAuthority: user,
            writerMint: this.optionsContract.writerMint,
            contractUnderlyingTokens: this.optionsContract.underlyingPool,
            contractQuoteTokens: this.optionsContract.quotePool,
            writerTokenSource: redeemerTokenSource,
            underlyingTokenDestination: underlyingTokenDestination,
            quoteTokenDestination: quoteTokenDestination,
            underlyingMint: this.optionsContract.underlyingMint,
            quoteMint: this.optionsContract.quoteMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
        };
        return this.program.instruction.optionRedeem(new anchor_1.BN(amount), {
            accounts: redeemAccounts,
        });
    };
    return SoloptionsSDK;
}());
exports.SoloptionsSDK = SoloptionsSDK;
