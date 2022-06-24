"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InertiaSDK = exports.DefaultInertiaSDKOpts = void 0;
var tslib_1 = require("tslib");
var friktion_utils_1 = require("@friktion-labs/friktion-utils");
var anchor_1 = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var __1 = require("../..");
var optionMarketUtils_1 = require("../Volt/optionMarketUtils");
var inertiaUtils_1 = require("./inertiaUtils");
exports.DefaultInertiaSDKOpts = {
    network: "mainnet-beta",
};
var InertiaSDK = /** @class */ (function () {
    function InertiaSDK(optionMarket, opts) {
        var defaultedOpts = Object.assign({}, opts, exports.DefaultInertiaSDKOpts);
        this.readonlyProvider = (0, friktion_utils_1.providerToAnchorProvider)(defaultedOpts.provider);
        this.network = !opts.network
            ? "mainnet-beta"
            : opts.network === "testnet" || opts.network === "localnet"
                ? "mainnet-beta"
                : opts.network;
        var inertiaIdl = __1.OTHER_IDLS.Inertia;
        if (!inertiaIdl) {
            console.error("INERTIA_IDLS", __1.OTHER_IDLS);
            // this used to be a big bug
            throw new Error("Unable to load InertiaSDK because idl is missing");
        }
        var Inertia = new anchor_1.Program(inertiaIdl, __1.OPTIONS_PROGRAM_IDS.Inertia.toString(), this.readonlyProvider);
        this.program = Inertia;
        this.optionsContract = optionMarket;
        this.optionKey = optionMarket.key;
    }
    InertiaSDK.prototype.asOptionMarket = function () {
        return (0, inertiaUtils_1.convertInertiaContractToOptionMarket)(this.optionsContract);
    };
    InertiaSDK.prototype.canExercise = function () {
        return this.optionsContract.wasSettleCranked;
    };
    InertiaSDK.prototype.getStrike = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (this.readonlyProvider === undefined)
                    throw new Error("read only provider must be generated");
                return [2 /*return*/, (0, optionMarketUtils_1.getStrikeFromOptionsContract)(this.readonlyProvider, this.asOptionMarket(), this.optionsContract.isCall.gtn(0))];
            });
        });
    };
    InertiaSDK.getStubOracleByKey = function (sdk, key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sdk.programs.Inertia.account.stubOracle.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    InertiaSDK.findStubOracleAddress = function (user, pdaString, programId) {
        if (programId === void 0) { programId = __1.OPTIONS_PROGRAM_IDS.Inertia; }
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
    InertiaSDK.createStubOracle = function (sdk, user, price, pdaString) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var oracleKey, accounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, InertiaSDK.findStubOracleAddress(user, pdaString)];
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
                                instruction: sdk.programs.Inertia.instruction.createStubOracle(price, pdaString, {
                                    accounts: accounts,
                                }),
                            }];
                }
            });
        });
    };
    InertiaSDK.setStubOracle = function (sdk, user, stubOracleKey, price) {
        var accounts = {
            authority: user,
            stubOracle: stubOracleKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        };
        return sdk.programs.Inertia.instruction.setStubOracle(price, {
            accounts: accounts,
        });
    };
    InertiaSDK.prototype.getInertiaExerciseFeeAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, InertiaSDK.getGenericInertiaExerciseFeeAccount(this.optionsContract.quoteMint)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    InertiaSDK.getGenericInertiaExerciseFeeAccount = function (quoteAssetMint) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(quoteAssetMint, __1.INERTIA_FEE_OWNER)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    InertiaSDK.prototype.isCall = function () {
        return this.optionsContract.isCall.gtn(0);
    };
    InertiaSDK.prototype.mintFeeAmount = function (numOptionTokensMinted) {
        if (numOptionTokensMinted.lten(0)) {
            return new anchor_1.BN(0);
        }
        return numOptionTokensMinted
            .mul(this.optionsContract.underlyingAmount)
            .muln(__1.INERTIA_MINT_FEE_BPS)
            .divn(10000);
    };
    InertiaSDK.getOptionMarketByKey = function (program, key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, inertiaUtils_1.getInertiaMarketByKey)(program, key)];
                    case 1:
                        optionMarket = _a.sent();
                        if (!optionMarket) {
                            throw new Error("could not find Inertia market for key");
                        }
                        return [2 /*return*/, optionMarket];
                }
            });
        });
    };
    InertiaSDK.getProgramAddress = function (program, kind, underlyingMint, quoteMint, underlyingAmount, quoteAmount, expiry, isCall) {
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
                                isCall ? new anchor_1.BN(1).toBuffer("le", 8) : new anchor_1.BN(0).toBuffer("le", 8),
                            ], program.programId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    InertiaSDK.prototype.exercise = function (params) {
        var amount = params.amount, optionTokenSource = params.optionTokenSource, underlyingTokenDestination = params.underlyingTokenDestination;
        var exerciseAccounts = {
            contract: this.optionKey,
            exerciserAuthority: params.user,
            optionMint: this.optionsContract.optionMint,
            optionTokenSource: optionTokenSource,
            underlyingTokenDestination: underlyingTokenDestination,
            claimablePool: this.optionsContract.claimablePool,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
        };
        return this.program.instruction.optionExercise(amount, {
            accounts: exerciseAccounts,
        });
    };
    InertiaSDK.prototype.settle = function (params, bypassCode) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var settlePrice, settleAccounts;
            var _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // TODO: get rid of requiring a defined settle price. long term need to use oracles every time
                        if (params.settlePrice === undefined &&
                            params.env === __1.RuntimeEnvironment.Production)
                            throw new Error("stop using oracles for a bit, pls pass in settle price");
                        settlePrice = (_a = params.settlePrice) !== null && _a !== void 0 ? _a : new anchor_1.BN(0);
                        if (params.settlePrice !== undefined &&
                            params.settlePrice !== new anchor_1.BN(0) &&
                            (bypassCode === null || bypassCode === void 0 ? void 0 : bypassCode.toString()) !== "123456789")
                            bypassCode = new anchor_1.BN(11111111);
                        else if (bypassCode === undefined) {
                            bypassCode = new anchor_1.BN(0);
                        }
                        if (bypassCode.ltn(0)) {
                            throw new Error("bypass code must be positive (BN in rust)");
                        }
                        _b = {
                            authority: params.user,
                            oracleAi: this.optionsContract.oracleAi,
                            contract: this.optionKey,
                            claimablePool: this.optionsContract.claimablePool,
                            underlyingMint: this.optionsContract.underlyingMint,
                            quoteMint: this.optionsContract.quoteMint,
                            contractUnderlyingTokens: this.optionsContract.underlyingPool
                        };
                        return [4 /*yield*/, this.getInertiaExerciseFeeAccount()];
                    case 1:
                        settleAccounts = (_b.exerciseFeeAccount = _c.sent(),
                            _b.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _b.clock = web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            _b);
                        console.log("settle px = ", settlePrice.toString(), ", bypass code = ", bypassCode.toString());
                        return [2 /*return*/, this.program.instruction.optionSettle(settlePrice, bypassCode, {
                                accounts: settleAccounts,
                            })];
                }
            });
        });
    };
    InertiaSDK.prototype.revertSettle = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var seeds, _a, claimablePool, _, revertSettleAccounts;
            var _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        seeds = [
                            this.optionsContract.underlyingMint,
                            this.optionsContract.quoteMint,
                            this.optionsContract.underlyingAmount,
                            this.optionsContract.quoteAmount,
                            this.optionsContract.expiryTs,
                            this.optionsContract.isCall.toNumber() > 0 ? true : false,
                        ];
                        return [4 /*yield*/, InertiaSDK.getProgramAddress.apply(InertiaSDK, tslib_1.__spreadArray([this.program,
                                "ClaimablePool"], seeds, false))];
                    case 1:
                        _a = _c.sent(), claimablePool = _a[0], _ = _a[1];
                        _b = {
                            authority: params.user,
                            oracleAi: this.optionsContract.oracleAi,
                            contract: this.optionKey,
                            claimablePool: claimablePool,
                            underlyingMint: this.optionsContract.underlyingMint,
                            quoteMint: this.optionsContract.quoteMint,
                            contractUnderlyingTokens: this.optionsContract.underlyingPool
                        };
                        return [4 /*yield*/, this.getInertiaExerciseFeeAccount()];
                    case 2:
                        revertSettleAccounts = (_b.exerciseFeeAccount = _c.sent(),
                            _b.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _b.clock = web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            _b);
                        return [2 /*return*/, this.program.instruction.revertOptionSettle({
                                accounts: revertSettleAccounts,
                            })];
                }
            });
        });
    };
    InertiaSDK.prototype.write = function (params) {
        var amount = params.amount, user = params.user, writerUnderlyingFundingTokens = params.writerUnderlyingFundingTokens, writerTokenDestination = params.writerTokenDestination, optionTokenDestination = params.optionTokenDestination, feeDestination = params.feeDestination;
        var writeAccounts = {
            contract: this.optionsContract.key,
            optionMint: this.optionsContract.optionMint,
            optionTokenDestination: optionTokenDestination,
            underlyingPool: this.optionsContract.underlyingPool,
            writerMint: this.optionsContract.writerMint,
            writerTokenDestination: writerTokenDestination,
            writerAuthority: user,
            userUnderlyingFundingTokens: writerUnderlyingFundingTokens,
            feeDestination: feeDestination,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        };
        return this.program.instruction.optionWrite(amount, {
            accounts: writeAccounts,
        });
    };
    InertiaSDK.prototype.redeem = function (params) {
        var user = params.user, underlyingTokenDestination = params.underlyingTokenDestination, redeemerTokenSource = params.redeemerTokenSource, amount = params.amount;
        var redeemAccounts = {
            contract: this.optionKey,
            redeemerAuthority: user,
            writerMint: this.optionsContract.writerMint,
            contractUnderlyingTokens: this.optionsContract.underlyingPool,
            writerTokenSource: redeemerTokenSource,
            underlyingTokenDestination: underlyingTokenDestination,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
        };
        return this.program.instruction.optionRedeem(new anchor_1.BN(amount), {
            accounts: redeemAccounts,
        });
    };
    InertiaSDK.prototype.close = function (params) {
        var user = params.user, underlyingTokenDestination = params.underlyingTokenDestination, writerTokenSource = params.writerTokenSource, optionTokenSource = params.optionTokenSource, amount = params.amount;
        var closePositionAccounts = {
            contract: this.optionKey,
            closeAuthority: user,
            writerMint: this.optionsContract.writerMint,
            optionMint: this.optionsContract.optionMint,
            writerTokenSource: writerTokenSource,
            optionTokenSource: optionTokenSource,
            underlyingTokenDestination: underlyingTokenDestination,
            underlyingPool: this.optionsContract.underlyingPool,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
        };
        return this.program.instruction.closePosition(new anchor_1.BN(amount), {
            accounts: closePositionAccounts,
        });
    };
    return InertiaSDK;
}());
exports.InertiaSDK = InertiaSDK;
