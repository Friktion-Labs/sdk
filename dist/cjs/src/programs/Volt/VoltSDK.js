"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoltSDK = void 0;
var tslib_1 = require("tslib");
var mango_client_1 = require("@blockworks-foundation/mango-client");
var entropy_client_1 = require("@friktion-labs/entropy-client");
var friktion_utils_1 = require("@friktion-labs/friktion-utils");
var anchor = tslib_1.__importStar(require("@project-serum/anchor"));
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var bn_js_1 = tslib_1.__importDefault(require("bn.js"));
var decimal_js_1 = require("decimal.js");
var __1 = require("../..");
var constants_1 = require("../../constants");
var inertiaUtils_1 = require("../Inertia/inertiaUtils");
var helperTypes_1 = require("./helperTypes");
var optionMarketUtils_1 = require("./optionMarketUtils");
var utils_1 = require("./utils");
var NoOptionMarketError = /** @class */ (function (_super) {
    tslib_1.__extends(NoOptionMarketError, _super);
    function NoOptionMarketError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NoOptionMarketError;
}(Error));
var VoltSDK = /** @class */ (function () {
    function VoltSDK(sdk, voltVault, voltKey, extraVoltData) {
        this.sdk = sdk;
        this.voltVault = voltVault;
        this.voltKey = voltKey;
        this.extraVoltData = extraVoltData;
    }
    VoltSDK.prototype.mintNameFromKey = function (key) {
        var _a;
        var foundName = (_a = Object.entries(this.sdk.net.mints).find(function (pair) { return pair[1].toString() === key.toString(); })) === null || _a === void 0 ? void 0 : _a[0];
        if (foundName === undefined)
            throw new Error("can't find name for mint. undetected");
        return foundName;
    };
    VoltSDK.prototype.printStrategyParams = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ev, entropyMetadata;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.extraVoltData === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadInExtraVoltData()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        ev = this.extraVoltData;
                        console.log("Strategy Params", "\n----------------------------");
                        if (!(this.voltType() === constants_1.VoltType.ShortOptions)) return [3 /*break*/, 3];
                        console.log("\n DOV: ", "\n, isCall: ", this.isCall(), "\n, firstEverOptionWasSet: ", this.voltVault.firstEverOptionWasSet);
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(this.voltType() === constants_1.VoltType.Entropy)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getEntropyMetadata()];
                    case 4:
                        entropyMetadata = _a.sent();
                        console.log("\n ENTROPY: ", "\n, target perp market: ", ev.powerPerpMarket.toString(), "\n hedging perp market: ", ev.hedgingSpotPerpMarket.toString(), "\n hedging spot market: ", ev.hedgingSpotMarket.toString(), "\n hedging?: ", ev.isHedgingOn, "\n hedging with spot?: ", entropyMetadata.hedgeWithSpot);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.getCurrentOptionsContractOrNull = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getCurrentOptionsContract()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_1 = _a.sent();
                        if (err_1 instanceof NoOptionMarketError) {
                            return [2 /*return*/, null];
                        }
                        throw err_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.printOptionsContract = function (key, optionsProtocol) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var inertiaContract, serumMarketKey, _a, _b, _c, nonInertiaOptionsContract;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(optionsProtocol === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getOptionsProtocolForKey(key)];
                    case 1:
                        optionsProtocol = _d.sent();
                        _d.label = 2;
                    case 2:
                        if (!(optionsProtocol === "Inertia")) return [3 /*break*/, 8];
                        return [4 /*yield*/, (0, inertiaUtils_1.getInertiaContractByKeyOrNull)(this.sdk.programs.Inertia, key)];
                    case 3:
                        inertiaContract = _d.sent();
                        if (!inertiaContract)
                            throw new Error("inertia options contract = " + key.toString() + " can't be found");
                        return [4 /*yield*/, this.getMarketAndAuthorityInfo(key)];
                    case 4:
                        serumMarketKey = (_d.sent()).serumMarketKey;
                        console.log("serum market = ", serumMarketKey.toString());
                        _b = (_a = console).log;
                        _c = ["option market: ",
                            inertiaContract.key.toString(),
                            "option mint: ",
                            inertiaContract.optionMint.toString(),
                            "ul mint: ",
                            inertiaContract.underlyingMint.toString(),
                            "\noption mint: ",
                            inertiaContract.optionMint.toString(),
                            "\noption mint supply: "];
                        return [4 /*yield*/, (0, friktion_utils_1.getMintSupply)(this.sdk.readonlyProvider.connection, inertiaContract.optionMint)];
                    case 5:
                        _c = _c.concat([(_d.sent()).toString(),
                            "\nisCall: ",
                            inertiaContract.isCall.toString(),
                            "\nexpiry: ",
                            inertiaContract.expiryTs.toString(),
                            "\nul amount: ",
                            inertiaContract.underlyingAmount.toString(),
                            "\nquote amount: ",
                            inertiaContract.quoteAmount.toString(),
                            "\noracle: ",
                            inertiaContract.oracleAi.toString(),
                            "\nadminKey: ",
                            inertiaContract.adminKey.toString(),
                            "\nwas settled: ",
                            inertiaContract.wasSettleCranked,
                            "\nsettle px: ",
                            // contract.
                            "\nunderlying tokens key ",
                            inertiaContract.underlyingPool.toString(),
                            "\nunderlying tokens"]);
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalanceOrZero)(this.sdk.readonlyProvider.connection, inertiaContract.underlyingPool)];
                    case 6:
                        _c = _c.concat([(_d.sent()).toString(),
                            "\nclaimable pool"]);
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalanceOrZero)(this.sdk.readonlyProvider.connection, inertiaContract.claimablePool)];
                    case 7:
                        _b.apply(_a, _c.concat([(_d.sent()).toString()]));
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, this.getOptionsContractByKey(key)];
                    case 9:
                        nonInertiaOptionsContract = _d.sent();
                        // const protocol = await voltSdk.getOptionsProtocolForKey(optionMarketKey);
                        console.log("option market: ", nonInertiaOptionsContract.key.toString(), "\nexpiry: ", nonInertiaOptionsContract.expirationUnixTimestamp.toString(), "\nul amount: ", nonInertiaOptionsContract.underlyingAmountPerContract.toString(), "\nquote amount: ", nonInertiaOptionsContract.quoteAmountPerContract.toString());
                        _d.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.getStrikeFromOptionsContract = function (optionsContract) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, optionMarketUtils_1.getStrikeFromOptionsContract)(this.sdk.readonlyProvider, optionsContract, this.isOptionsContractACall(optionsContract))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getCurrentOptionsContract = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.voltType() !== constants_1.VoltType.ShortOptions)
                            throw new Error("volt must trade options");
                        if (this.voltVault.optionMarket.toString() ===
                            web3_js_1.SystemProgram.programId.toString())
                            throw new NoOptionMarketError("option market must not be systemprogram (not set)");
                        return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.optionsContractToDetailsString = function (optionsContract) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var isCall, _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        isCall = this.isOptionsContractACall(optionsContract);
                        _b = (_a = new decimal_js_1.Decimal(optionsContract.underlyingAmountPerContract.toString()))
                            .div;
                        return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 1:
                        _b.apply(_a, [_d.sent()])
                            .toString(), " ", this.mintNameFromKey(this.voltVault.underlyingAssetMint), " ";
                        _c = new Date(optionsContract.expirationUnixTimestamp.muln(1000).toNumber()).toUTCString() +
                            " $";
                        return [4 /*yield*/, this.getStrikeFromOptionsContract(optionsContract)];
                    case 2: return [2 /*return*/, (_c +
                            (_d.sent()).toString() +
                            " " +
                            (isCall ? "CALL" : "PUT"))];
                }
            });
        });
    };
    VoltSDK.prototype.perpMarketToName = function (perpMarketKey) {
        if (!(perpMarketKey.toString() in this.sdk.net.ENTROPY_PERP_MARKET_NAMES))
            throw new Error("couldn't find name for " + perpMarketKey.toString());
        return this.sdk.net.ENTROPY_PERP_MARKET_NAMES[perpMarketKey.toString()];
    };
    VoltSDK.prototype.headlineTokenPrice = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var symbol;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        symbol = this.mintNameFromKey(this.isCall()
                            ? this.voltVault.underlyingAssetMint
                            : this.voltVault.quoteAssetMint);
                        return [4 /*yield*/, this.getCoingeckoPrice(this.sdk.net.COINGECKO_IDS[symbol])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.depositTokenPrice = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var symbol;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        symbol = this.mintNameFromKey(this.voltVault.underlyingAssetMint);
                        return [4 /*yield*/, this.getCoingeckoPrice(this.sdk.net.COINGECKO_IDS[symbol])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.requiresSwapPremium = function () {
        return (this.voltType() === constants_1.VoltType.ShortOptions &&
            this.voltVault.permissionedMarketPremiumMint.toString() !==
                this.voltVault.underlyingAssetMint.toString());
    };
    VoltSDK.prototype.definitelyDoesntRequirePermissionedSettle = function () {
        return (this.voltType() === constants_1.VoltType.ShortOptions &&
            this.voltVault.permissionedMarketPremiumMint.toString() !==
                this.voltVault.underlyingAssetMint.toString() &&
            this.voltVault.permissionedMarketPremiumMint.toString() !==
                this.voltVault.quoteAssetMint.toString());
    };
    VoltSDK.prototype.printState = function () {
        var _a, _b, _c, _d, _e, _f;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var symbol, ev, depositTokenPrice, _g, _h, _j, _k, valueInDeposits, _l, _m, _o, _p, _q, _r, premiumFactor, _s, _t, permissionedPremiumFactor, _u, _v, _w, _x, _y, _z, _0, entropyMetadata, pendingDeposits, _1, _2, _3, pendingWithdrawals, _4, optionMarket, _5, _6, _7, writerTokenBalance, _8, _9, _10, _11, _12, err_2, _13, tokens, dollars, entropyLendingAccountKey, entropyRound, _14, entropyAccount, entropyGroup, entropyCache, entropyMetadata, targetPerpIndex, spotPerpIndex, acctEquityPostDeposits, _15, _16, _17, _18, _19, _20, targetPerpSize, hedgingPerpSize;
            return tslib_1.__generator(this, function (_21) {
                switch (_21.label) {
                    case 0:
                        if (!(this.extraVoltData === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadInExtraVoltData()];
                    case 1:
                        _21.sent();
                        _21.label = 2;
                    case 2:
                        symbol = this.mintNameFromKey(this.voltVault.underlyingAssetMint);
                        ev = this.extraVoltData;
                        return [4 /*yield*/, this.depositTokenPrice()];
                    case 3:
                        depositTokenPrice = _21.sent();
                        console.log("\n-------------------------\n ID: ".concat(this.voltKey.toString(), "\n-------------------------"));
                        _h = (_g = console).log;
                        return [4 /*yield*/, this.voltName()];
                    case 4:
                        _h.apply(_g, [_21.sent()]);
                        _k = (_j = console).log;
                        return [4 /*yield*/, this.specificVoltName()];
                    case 5:
                        _k.apply(_j, [_21.sent()]);
                        console.log("\n-------------------------\n HIGH LEVEL STATS\n-------------------------");
                        return [4 /*yield*/, this.getTvlWithoutPendingInDepositToken()];
                    case 6:
                        valueInDeposits = _21.sent();
                        console.log("Total Value (minus pending deposits) (".concat(symbol, "): "), valueInDeposits, ", ($): ", valueInDeposits.mul(depositTokenPrice).toString());
                        _m = (_l = console).log;
                        _o = ["deposit pool: "];
                        _q = decimal_js_1.Decimal.bind;
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalanceOrZero)(this.sdk.readonlyProvider.connection, this.voltVault.depositPool)];
                    case 7:
                        _r = (_p = new (_q.apply(decimal_js_1.Decimal, [void 0, (_21.sent()).toString()]))())
                            .div;
                        return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 8:
                        _m.apply(_l, _o.concat([_r.apply(_p, [_21.sent()])
                                .toString()]));
                        if (!(this.voltType() === constants_1.VoltType.ShortOptions)) return [3 /*break*/, 13];
                        _t = (_s = new decimal_js_1.Decimal(10)).pow;
                        return [4 /*yield*/, (0, spl_token_1.getMint)(this.sdk.readonlyProvider.connection, this.voltVault.quoteAssetMint)];
                    case 9:
                        premiumFactor = _t.apply(_s, [(_21.sent()).decimals]);
                        _v = (_u = new decimal_js_1.Decimal(10)).pow;
                        return [4 /*yield*/, (0, spl_token_1.getMint)(this.sdk.readonlyProvider.connection, this.voltVault.permissionedMarketPremiumMint)];
                    case 10:
                        permissionedPremiumFactor = _v.apply(_u, [(_21.sent()).decimals]);
                        _x = (_w = console).log;
                        _y = ["premium pool: "];
                        _z = decimal_js_1.Decimal.bind;
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalanceOrZero)(this.sdk.readonlyProvider.connection, this.voltVault.premiumPool)];
                    case 11:
                        _y = _y.concat([new (_z.apply(decimal_js_1.Decimal, [void 0, (_21.sent()).toString()]))()
                                .div(premiumFactor)
                                .toString(),
                            "permissioned premium pool: "]);
                        _0 = decimal_js_1.Decimal.bind;
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalanceOrZero)(this.sdk.readonlyProvider.connection, this.voltVault.permissionedMarketPremiumPool)];
                    case 12:
                        _x.apply(_w, _y.concat([new (_0.apply(decimal_js_1.Decimal, [void 0, (_21.sent()).toString()]))()
                                .div(permissionedPremiumFactor)
                                .toString()]));
                        return [3 /*break*/, 15];
                    case 13:
                        if (!(this.voltType() === constants_1.VoltType.Entropy)) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.getEntropyMetadata()];
                    case 14:
                        entropyMetadata = _21.sent();
                        console.log("leverage: ", ev.targetLeverage, "hedge ratio: ", entropyMetadata.targetHedgeRatio, "leverage lenience: ", ev.targetLeverageLenience, "hedge lenience: ", ev.targetHedgeLenience);
                        _21.label = 15;
                    case 15:
                        _2 = decimal_js_1.Decimal.bind;
                        return [4 /*yield*/, this.getCurrentlyPendingDeposits()];
                    case 16:
                        _3 = (_1 = new (_2.apply(decimal_js_1.Decimal, [void 0, (_21.sent()).toString()]))()).div;
                        return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 17:
                        pendingDeposits = _3.apply(_1, [_21.sent()]);
                        console.log("\n-------------------------\n EPOCH INFO\n-------------------------");
                        console.log("Round #: ", this.voltVault.roundNumber.toString());
                        console.log("pending deposits ".concat(symbol, ": "), pendingDeposits.toString(), ", ($): ", pendingDeposits.mul(depositTokenPrice).toString());
                        _4 = decimal_js_1.Decimal.bind;
                        return [4 /*yield*/, this.getCurrentlyPendingWithdrawals()];
                    case 18:
                        pendingWithdrawals = new (_4.apply(decimal_js_1.Decimal, [void 0, (_21.sent()).toString()]))();
                        console.log("pending withdrawals (".concat(symbol, "): "), pendingWithdrawals.toString(), ", ($): ", pendingWithdrawals.mul(depositTokenPrice).toString());
                        console.log("\n-------------------------\n POSITION STATS\n-------------------------");
                        if (!(this.voltType() === constants_1.VoltType.ShortOptions)) return [3 /*break*/, 27];
                        _21.label = 19;
                    case 19:
                        _21.trys.push([19, 25, , 26]);
                        return [4 /*yield*/, this.getCurrentOptionsContract()];
                    case 20:
                        optionMarket = _21.sent();
                        _6 = (_5 = console).log;
                        _7 = ["\n " + "Short" + " ("];
                        return [4 /*yield*/, this.optionsContractToDetailsString(optionMarket)];
                    case 21:
                        _6.apply(_5, _7.concat([_21.sent(), "): "]));
                        console.log("option key: ", optionMarket.key.toString());
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalance)(this.sdk.readonlyProvider.connection, this.voltVault.writerTokenPool)];
                    case 22:
                        writerTokenBalance = _21.sent();
                        _9 = (_8 = console).log;
                        _10 = ["minted options: (#)",
                            writerTokenBalance.toString(), " (".concat(symbol, ") ")];
                        _12 = (_11 = new decimal_js_1.Decimal(writerTokenBalance.toString())
                            .mul(new decimal_js_1.Decimal(optionMarket.underlyingAmountPerContract.toString())))
                            .div;
                        return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 23:
                        _9.apply(_8, _10.concat([_12.apply(_11, [_21.sent()])
                                .toString()]));
                        return [4 /*yield*/, this.printOptionsContract(optionMarket.key)];
                    case 24:
                        _21.sent();
                        return [3 /*break*/, 26];
                    case 25:
                        err_2 = _21.sent();
                        console.log("no option currently selected");
                        return [3 /*break*/, 26];
                    case 26: return [3 /*break*/, 29];
                    case 27:
                        if (!(this.voltType() === constants_1.VoltType.Entropy)) return [3 /*break*/, 29];
                        return [4 /*yield*/, this.printEntropyPositionStats()];
                    case 28:
                        _21.sent();
                        _21.label = 29;
                    case 29: return [4 /*yield*/, this.getEntropyLendingTvl()];
                    case 30:
                        _13 = _21.sent(), tokens = _13.tvlDepositToken, dollars = _13.tvlUsd;
                        if (!tokens.gt(0)) return [3 /*break*/, 32];
                        return [4 /*yield*/, VoltSDK.findEntropyLendingAccountAddress(this.voltKey)];
                    case 31:
                        entropyLendingAccountKey = (_21.sent())[0];
                        console.log("\n-------------------------\n MANGO LENDING \n-------------------------\n", "account: ", entropyLendingAccountKey.toString(), "\n", tokens.toString(), " (tokens), ", dollars.toString(), " ($) \n");
                        _21.label = 32;
                    case 32:
                        console.log("\n-------------------------\n AUCTION DETAILS \n-------------------------");
                        if (!(this.voltType() === constants_1.VoltType.Entropy)) return [3 /*break*/, 37];
                        return [4 /*yield*/, this.getCurrentEntropyRound()];
                    case 33:
                        entropyRound = _21.sent();
                        return [4 /*yield*/, this.getEntropyObjectsForEvData()];
                    case 34:
                        _14 = _21.sent(), entropyAccount = _14.entropyAccount, entropyGroup = _14.entropyGroup, entropyCache = _14.entropyCache;
                        return [4 /*yield*/, this.getEntropyMetadata()];
                    case 35:
                        entropyMetadata = _21.sent();
                        targetPerpIndex = entropyGroup.getPerpMarketIndex(ev.powerPerpMarket);
                        spotPerpIndex = entropyGroup.getPerpMarketIndex(ev.hedgingSpotPerpMarket);
                        _16 = (_15 = entropyAccount
                            .computeValue(entropyGroup, entropyCache))
                            .add;
                        _18 = (_17 = entropy_client_1.I80F48.fromString(entropyRound.netDeposits))
                            .div;
                        _20 = (_19 = entropy_client_1.I80F48).fromString;
                        return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 36:
                        acctEquityPostDeposits = _16.apply(_15, [_18.apply(_17, [_20.apply(_19, [(_21.sent()).toString()])])
                                .min(new entropy_client_1.I80F48(new bn_js_1.default(0)))]);
                        targetPerpSize = acctEquityPostDeposits
                            .mul(entropy_client_1.I80F48.fromString(ev.targetLeverage))
                            .sub(entropy_client_1.I80F48.fromNumber(entropyAccount.getBasePositionUiWithGroup(targetPerpIndex, entropyGroup)).mul((_a = entropyCache.priceCache[targetPerpIndex]) === null || _a === void 0 ? void 0 : _a.price));
                        hedgingPerpSize = acctEquityPostDeposits
                            .mul(entropy_client_1.I80F48.fromString(entropyMetadata.targetHedgeRatio))
                            .mul(entropy_client_1.I80F48.fromString(ev.targetLeverage))
                            .sub(entropy_client_1.I80F48.fromNumber(entropyAccount.getBasePositionUiWithGroup(spotPerpIndex, entropyGroup)).mul((_b = entropyCache.priceCache[spotPerpIndex]) === null || _b === void 0 ? void 0 : _b.price));
                        console.log("equity post deposits = ".concat(acctEquityPostDeposits.toString()), "\nneeded ".concat((_d = (_c = this.sdk.net.ENTROPY_PERP_MARKET_NAMES[ev.powerPerpMarket.toString()]) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : "N/A", " quote size: "), targetPerpSize.toFixed(4), "\nneeded ".concat((_f = (_e = this.sdk.net.ENTROPY_PERP_MARKET_NAMES[ev.hedgingSpotPerpMarket.toString()]) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : "N/A", " quote size: "), hedgingPerpSize.toFixed(4));
                        _21.label = 37;
                    case 37:
                        console.log("\n-------------------------\n STATE MACHINE\n-------------------------");
                        console.log("\nGeneric State: ", "\n, instantTransfersEnabled: ", this.voltVault.instantTransfersEnabled, "\n, deposits and withdrawals off?: ", ev.turnOffDepositsAndWithdrawals, "\n, performance fees in underlying?: ", ev.dovPerformanceFeesInUnderlying, "\n----------------------------");
                        if (this.voltType() === constants_1.VoltType.ShortOptions) {
                            console.log("\nShort Options State:", "\n, firstEverOptionWasSet: ", this.voltVault.firstEverOptionWasSet, "\n, nextOptionSet: ", this.voltVault.nextOptionWasSet, "\n, has started?: ", this.voltVault.roundHasStarted, "\n, taken withdrawal fees: ", this.voltVault.haveTakenWithdrawalFees, "\n, isSettled: ", this.voltVault.currOptionWasSettled, "\n, mustSwapPremium: ", this.voltVault.mustSwapPremiumToUnderlying, "\n, preparedIsFinished: ", this.voltVault.prepareIsFinished, "\n, enterIsFinished: ", this.voltVault.enterIsFinished);
                        }
                        else if (this.voltType() === constants_1.VoltType.Entropy) {
                            console.log("\n Entropy State: ", "\n, rebalance ready?: ", ev.rebalanceIsReady, "\n, done rebalancing?: ", ev.doneRebalancing, "\n, done rebalancing target perp?: ", ev.doneRebalancingPowerPerp, "\n, have taken perf fees?: ", ev.haveTakenPerformanceFees, "\n, have resolved deposits?: ", ev.haveResolvedDeposits);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.needsExtraVoltData = function () {
        return this.voltType() === constants_1.VoltType.Entropy;
    };
    VoltSDK.prototype.isKeyAStableCoin = function (key) {
        return [
            this.sdk.net.mints.USDC,
            this.sdk.net.mints.UST,
            this.sdk.net.mints.PAI,
            this.sdk.net.mints.UXD,
            this.sdk.net.mints.TUSDCV2,
        ]
            .map(function (k) { return k.toString(); })
            .includes(key.toString());
    };
    VoltSDK.prototype.isOptionsContractACall = function (optionsContract) {
        return !this.isKeyAStableCoin(optionsContract.underlyingAssetMint);
    };
    VoltSDK.prototype.isCall = function () {
        if (this.voltType() !== constants_1.VoltType.ShortOptions)
            throw new Error("wrong volt type, should be DOV");
        return !this.isKeyAStableCoin(this.voltVault.underlyingAssetMint);
    };
    VoltSDK.prototype.getHedgingInstrument = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var entropyMetadata;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.extraVoltData)
                            throw new Error("must load extra volt data");
                        return [4 /*yield*/, this.getEntropyMetadata()];
                    case 1:
                        entropyMetadata = _a.sent();
                        return [2 /*return*/, entropyMetadata.hedgeWithSpot
                                ? this.extraVoltData.hedgingSpotMarket
                                : this.extraVoltData.hedgingSpotPerpMarket];
                }
            });
        });
    };
    VoltSDK.prototype.specificVoltName = function () {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var voltNumber, _e, optionMarket, _f, _g, ev, _h, _j, ev, _k, _l;
            return tslib_1.__generator(this, function (_m) {
                switch (_m.label) {
                    case 0: return [4 /*yield*/, this.voltNumber()];
                    case 1:
                        voltNumber = _m.sent();
                        _e = voltNumber;
                        switch (_e) {
                            case 1: return [3 /*break*/, 2];
                            case 2: return [3 /*break*/, 2];
                            case 3: return [3 /*break*/, 7];
                            case 4: return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 13];
                    case 2: return [4 /*yield*/, this.getCurrentOptionsContractOrNull()];
                    case 3:
                        optionMarket = _m.sent();
                        _f = "Short" +
                            " (";
                        if (!optionMarket) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.optionsContractToDetailsString(optionMarket)];
                    case 4:
                        _g = _m.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _g = "No Option Market";
                        _m.label = 6;
                    case 6: return [2 /*return*/, (_f +
                            (_g) +
                            ")")];
                    case 7: return [4 /*yield*/, this.getExtraVoltData()];
                    case 8:
                        ev = _m.sent();
                        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                        _h = "Short" +
                            " Crab (-" +
                            ((_a = this.sdk.net.ENTROPY_PERP_MARKET_NAMES[ev.powerPerpMarket.toString()]) === null || _a === void 0 ? void 0 : _a.toString()) +
                            ", +";
                        _j = this.sdk.net.ENTROPY_PERP_MARKET_NAMES;
                        return [4 /*yield*/, this.getHedgingInstrument()];
                    case 9: return [2 /*return*/, (
                        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                        _h +
                            ((_b = _j[(_m.sent()).toString()]) === null || _b === void 0 ? void 0 : _b.toString()) +
                            ")")];
                    case 10: return [4 /*yield*/, this.getExtraVoltData()];
                    case 11:
                        ev = _m.sent();
                        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                        _k = "Long" +
                            " Basis (+" +
                            ((_c = this.sdk.net.ENTROPY_PERP_MARKET_NAMES[ev.powerPerpMarket.toString()]) === null || _c === void 0 ? void 0 : _c.toString()) +
                            ", -";
                        _l = this.sdk.net.ENTROPY_PERP_MARKET_NAMES;
                        return [4 /*yield*/, this.getHedgingInstrument()];
                    case 12: return [2 /*return*/, (
                        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                        _k +
                            ((_d = _l[(_m.sent()).toString()]) === null || _d === void 0 ? void 0 : _d.toString()) +
                            ")")];
                    case 13: throw new Error("Unknown volt type");
                }
            });
        });
    };
    VoltSDK.prototype.printEntropyPositionStats = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ev, _a, entropyAccount, entropyGroup, entropyCache, entropyGroupConfig;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.voltType() !== constants_1.VoltType.Entropy)
                            throw new Error("volt type must be Entropy");
                        ev = this.extraVoltData;
                        if (ev === undefined)
                            throw new Error("please load extraVoltData before calling");
                        return [4 /*yield*/, this.getEntropyObjectsForEvData()];
                    case 1:
                        _a = _b.sent(), entropyAccount = _a.entropyAccount, entropyGroup = _a.entropyGroup, entropyCache = _a.entropyCache;
                        entropyGroupConfig = ev.entropyProgramId.toString() === constants_1.ENTROPY_PROGRAM_ID.toString()
                            ? Object.values(entropy_client_1.Config.ids().groups).find(function (g) { return g.publicKey.toString() === ev.entropyGroup.toString(); })
                            : Object.values(mango_client_1.Config.ids().groups).find(function (g) { return g.publicKey.toString() === ev.entropyGroup.toString(); });
                        console.log(entropyAccount.toPrettyString(entropyGroupConfig, entropyGroup, entropyCache));
                        return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.voltName = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var voltNumber;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.voltNumber()];
                    case 1:
                        voltNumber = _a.sent();
                        switch (voltNumber) {
                            case 1:
                                return [2 /*return*/, "Volt #01: Covered Call"];
                            case 2:
                                return [2 /*return*/, "Volt #02: Cash Secured Put"];
                            case 3:
                                return [2 /*return*/, "Volt #03: Crab Strategy"];
                            case 4:
                                return [2 /*return*/, "Volt #04: Basis Yield"];
                        }
                        throw new Error("Unknown volt type");
                }
            });
        });
    };
    VoltSDK.prototype.voltStrategy = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var voltType, _a, entropyMetadata;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        voltType = this.voltType();
                        _a = voltType;
                        switch (_a) {
                            case constants_1.VoltType.ShortOptions: return [3 /*break*/, 1];
                            case constants_1.VoltType.Entropy: return [3 /*break*/, 2];
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        {
                            return [2 /*return*/, this.isCall() ? constants_1.VoltStrategy.ShortCalls : constants_1.VoltStrategy.ShortPuts];
                        }
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.getEntropyMetadata()];
                    case 3:
                        entropyMetadata = _b.sent();
                        return [2 /*return*/, entropyMetadata.hedgeWithSpot
                                ? constants_1.VoltStrategy.LongBasis
                                : constants_1.VoltStrategy.ShortCrab];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.voltNumber = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var voltStrategy;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.voltStrategy()];
                    case 1:
                        voltStrategy = _a.sent();
                        switch (voltStrategy) {
                            case constants_1.VoltStrategy.ShortCalls:
                                return [2 /*return*/, 1];
                            case constants_1.VoltStrategy.ShortPuts:
                                return [2 /*return*/, 1];
                            case constants_1.VoltStrategy.ShortCrab:
                                return [2 /*return*/, 3];
                            case constants_1.VoltStrategy.LongBasis:
                                return [2 /*return*/, 4];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.voltType = function () {
        if (this.voltVault.premiumPool.toString() !==
            web3_js_1.SystemProgram.programId.toString()) {
            return constants_1.VoltType.ShortOptions;
        }
        else if (this.voltVault.premiumPool.toString() ===
            web3_js_1.SystemProgram.programId.toString()) {
            return constants_1.VoltType.Entropy;
        }
        else {
            throw new Error("volt type = " +
                this.voltVault.vaultType.toString() +
                " is not recognized");
        }
    };
    VoltSDK.prototype.roundNumber = function () {
        return this.voltVault.roundNumber;
    };
    VoltSDK.prototype.isPremiumBased = function () {
        return this.voltType() === constants_1.VoltType.ShortOptions;
    };
    VoltSDK.withdrawalFeeAmount = function (numTokensWithdrawn) {
        if (numTokensWithdrawn.lten(0)) {
            return new bn_js_1.default(0);
        }
        return numTokensWithdrawn.muln(__1.WITHDRAWAL_FEE_BPS).divn(10000);
    };
    VoltSDK.performanceFeeAmount = function (numTokensGained) {
        if (numTokensGained.lten(0)) {
            return new bn_js_1.default(0);
        }
        return numTokensGained.muln(__1.PERFORMANCE_FEE_BPS).divn(10000);
    };
    VoltSDK.extraVoltDataForVoltKey = function (voltKey, sdk) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key, acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findExtraVoltDataAddress(voltKey, sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [4 /*yield*/, sdk.programs.Volt.account.extraVoltData.fetch(key)];
                    case 2:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.findUnderlyingOpenOrdersAddress = function (voltKey, spotSerumMarketKey, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                spotSerumMarketKey.toBuffer(),
                                textEncoder.encode("ulOpenOrders"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findUnderlyingOpenOrdersMetadataAddress = function (voltKey, spotSerumMarketKey, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                spotSerumMarketKey.toBuffer(),
                                textEncoder.encode("ulOpenOrdersMetadata"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findExtraVoltDataAddress = function (voltKey, voltProgramId) {
        if (voltProgramId === void 0) { voltProgramId = constants_1.FRIKTION_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([voltKey.toBuffer(), textEncoder.encode("extraVoltData")], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findSerumMarketAddress = function (voltKey, whitelistMintKey, optionMarketKey, voltProgramId) {
        if (voltProgramId === void 0) { voltProgramId = constants_1.FRIKTION_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder, auctionMetadataKey;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, VoltSDK.findAuctionMetadataAddress(voltKey)];
                    case 1:
                        auctionMetadataKey = (_a.sent())[0];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                whitelistMintKey.toBuffer(),
                                optionMarketKey.toBuffer(),
                                auctionMetadataKey.toBuffer(),
                                textEncoder.encode("serumMarket"),
                            ], voltProgramId)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findAuctionMetadataAddress = function (voltKey, voltProgramId) {
        if (voltProgramId === void 0) { voltProgramId = constants_1.FRIKTION_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([voltKey.toBuffer(), textEncoder.encode("auctionMetadata")], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findEntropyMetadataAddress = function (voltKey, voltProgramId) {
        if (voltProgramId === void 0) { voltProgramId = constants_1.FRIKTION_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([voltKey.toBuffer(), textEncoder.encode("entropyMetadata")], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findEntropyOpenOrdersAddress = function (voltKey, marketAddress, voltProgramId) {
        if (voltProgramId === void 0) { voltProgramId = constants_1.FRIKTION_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                marketAddress.toBuffer(),
                                textEncoder.encode("entropySpotOpenOrders"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * For an admin to create a volt
     *
     * spotMarket and seed are dynamically generated. Change the code if you want custom.
     */
    VoltSDK.initializeVoltWithoutOptionMarketSeed = function (_a) {
        var sdk = _a.sdk, adminKey = _a.adminKey, underlyingAssetMint = _a.underlyingAssetMint, quoteAssetMint = _a.quoteAssetMint, permissionedMarketPremiumMint = _a.permissionedMarketPremiumMint, underlyingAmountPerContract = _a.underlyingAmountPerContract, serumProgramId = _a.serumProgramId, expirationInterval = _a.expirationInterval, capacity = _a.capacity, individualCapacity = _a.individualCapacity, permissionlessAuctions = _a.permissionlessAuctions, seed = _a.seed;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, vault, vaultBump, vaultAuthorityBump, extraVoltKey, vaultMint, vaultAuthority, depositPoolKey, premiumPoolKey, permissionedMarketPremiumPoolKey, whitelistTokenAccountKey, auctionMetadataKey, initializeAccountsStruct, serumOrderSize, serumOrderType, serumSelfTradeBehavior, instruction;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!seed)
                            seed = new web3_js_1.Keypair().publicKey;
                        return [4 /*yield*/, VoltSDK.findInitializeAddresses(sdk, sdk.net.MM_TOKEN_MINT, constants_1.VoltType.ShortOptions, {
                                seed: seed,
                            })];
                    case 1:
                        _b = _c.sent(), vault = _b.vault, vaultBump = _b.vaultBump, vaultAuthorityBump = _b.vaultAuthorityBump, extraVoltKey = _b.extraVoltKey, vaultMint = _b.vaultMint, vaultAuthority = _b.vaultAuthority, depositPoolKey = _b.depositPoolKey, premiumPoolKey = _b.premiumPoolKey, permissionedMarketPremiumPoolKey = _b.permissionedMarketPremiumPoolKey, whitelistTokenAccountKey = _b.whitelistTokenAccountKey, auctionMetadataKey = _b.auctionMetadataKey;
                        initializeAccountsStruct = {
                            authority: adminKey,
                            adminKey: adminKey,
                            seed: seed,
                            voltVault: vault,
                            vaultAuthority: vaultAuthority,
                            vaultMint: vaultMint,
                            extraVoltData: extraVoltKey,
                            auctionMetadata: auctionMetadataKey,
                            depositPool: depositPoolKey,
                            premiumPool: premiumPoolKey,
                            permissionedMarketPremiumPool: permissionedMarketPremiumPoolKey,
                            permissionedMarketPremiumMint: permissionedMarketPremiumMint,
                            underlyingAssetMint: underlyingAssetMint,
                            quoteAssetMint: quoteAssetMint,
                            dexProgram: serumProgramId,
                            whitelistTokenAccount: whitelistTokenAccountKey,
                            whitelistTokenMint: sdk.net.MM_TOKEN_MINT,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        };
                        serumOrderSize = new anchor.BN(1);
                        serumOrderType = helperTypes_1.OrderType.ImmediateOrCancel;
                        serumSelfTradeBehavior = helperTypes_1.SelfTradeBehavior.AbortTransaction;
                        instruction = sdk.programs.Volt.instruction.initialize(vaultBump, vaultAuthorityBump, serumOrderSize, serumOrderType, serumSelfTradeBehavior, expirationInterval, underlyingAmountPerContract, capacity, individualCapacity, permissionlessAuctions ? new bn_js_1.default(1) : new bn_js_1.default(0), {
                            accounts: initializeAccountsStruct,
                        });
                        return [2 /*return*/, {
                                instruction: instruction,
                                voltKey: vault,
                            }];
                }
            });
        });
    };
    VoltSDK.findInitializeAddresses = function (sdk, whitelistTokenMintKey, vaultType, pdaParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder, vault, vaultBump, seed, pdaStr, extraVoltKey, auctionMetadataKey, _a, vaultMint, _vaultMintBump, _b, vaultAuthority, vaultAuthorityBump, depositPoolKey, premiumPoolKey, permissionedMarketPremiumPoolKey, whitelistTokenAccountKey;
            var _c, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        if (!(vaultType === constants_1.VoltType.ShortOptions)) return [3 /*break*/, 2];
                        seed = pdaParams.seed;
                        if (!seed)
                            seed = new web3_js_1.Keypair().publicKey;
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                new bn_js_1.default(vaultType).toBuffer("le", 8),
                                seed.toBuffer(),
                                textEncoder.encode("vault"),
                            ], sdk.programs.Volt.programId)];
                    case 1:
                        _c = _e.sent(), vault = _c[0], vaultBump = _c[1];
                        return [3 /*break*/, 4];
                    case 2:
                        pdaStr = pdaParams.pdaStr;
                        if (!pdaStr) {
                            throw new Error("must pass in pda string if not short options vault");
                        }
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                new bn_js_1.default(vaultType).toBuffer("le", 8),
                                textEncoder.encode(pdaStr),
                                textEncoder.encode("vault"),
                            ], sdk.programs.Volt.programId)];
                    case 3:
                        _d = _e.sent(), vault = _d[0], vaultBump = _d[1];
                        _e.label = 4;
                    case 4: return [4 /*yield*/, VoltSDK.findExtraVoltDataAddress(vault)];
                    case 5:
                        extraVoltKey = (_e.sent())[0];
                        return [4 /*yield*/, VoltSDK.findAuctionMetadataAddress(vault)];
                    case 6:
                        auctionMetadataKey = (_e.sent())[0];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([vault.toBuffer(), textEncoder.encode("vaultToken")], sdk.programs.Volt.programId)];
                    case 7:
                        _a = _e.sent(), vaultMint = _a[0], _vaultMintBump = _a[1];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([vault.toBuffer(), textEncoder.encode("vaultAuthority")], sdk.programs.Volt.programId)];
                    case 8:
                        _b = _e.sent(), vaultAuthority = _b[0], vaultAuthorityBump = _b[1];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([vault.toBuffer(), textEncoder.encode("depositPool")], sdk.programs.Volt.programId)];
                    case 9:
                        depositPoolKey = (_e.sent())[0];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([vault.toBuffer(), textEncoder.encode("premiumPool")], sdk.programs.Volt.programId)];
                    case 10:
                        premiumPoolKey = (_e.sent())[0];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([vault.toBuffer(), textEncoder.encode("permissionedMarketPremiumPool")], sdk.programs.Volt.programId)];
                    case 11:
                        permissionedMarketPremiumPoolKey = (_e.sent())[0];
                        return [4 /*yield*/, VoltSDK.findWhitelistTokenAccountAddress(vault, whitelistTokenMintKey, sdk.programs.Volt.programId)];
                    case 12:
                        whitelistTokenAccountKey = (_e.sent())[0];
                        return [2 /*return*/, {
                                vault: vault,
                                vaultBump: vaultBump,
                                vaultAuthorityBump: vaultAuthorityBump,
                                extraVoltKey: extraVoltKey,
                                vaultMint: vaultMint,
                                vaultAuthority: vaultAuthority,
                                depositPoolKey: depositPoolKey,
                                premiumPoolKey: premiumPoolKey,
                                permissionedMarketPremiumPoolKey: permissionedMarketPremiumPoolKey,
                                whitelistTokenAccountKey: whitelistTokenAccountKey,
                                auctionMetadataKey: auctionMetadataKey,
                            }];
                }
            });
        });
    };
    VoltSDK.findBackupPoolAddresses = function (voltKey, voltVault) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder, backupOptionPoolKey, backupWriterTokenPoolKey;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                voltVault.optionMint.toBuffer(),
                                textEncoder.encode("backupOptionPool"),
                            ], constants_1.FRIKTION_PROGRAM_ID)];
                    case 1:
                        backupOptionPoolKey = (_a.sent())[0];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                voltVault.writerTokenMint.toBuffer(),
                                textEncoder.encode("backupWriterTokenPool"),
                            ], constants_1.FRIKTION_PROGRAM_ID)];
                    case 2:
                        backupWriterTokenPoolKey = (_a.sent())[0];
                        return [2 /*return*/, {
                                backupOptionPoolKey: backupOptionPoolKey,
                                backupWriterTokenPoolKey: backupWriterTokenPoolKey,
                            }];
                }
            });
        });
    };
    VoltSDK.findEntropyAccountAddress = function (voltKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                textEncoder = new TextEncoder();
                return [2 /*return*/, web3_js_1.PublicKey.findProgramAddress([voltKey.toBuffer(), textEncoder.encode("entropyAccount")], constants_1.FRIKTION_PROGRAM_ID)];
            });
        });
    };
    VoltSDK.findEntropyLendingAccountAddress = function (voltKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                textEncoder = new TextEncoder();
                return [2 /*return*/, web3_js_1.PublicKey.findProgramAddress([voltKey.toBuffer(), textEncoder.encode("entropyLendingAccount")], constants_1.FRIKTION_PROGRAM_ID)];
            });
        });
    };
    VoltSDK.initializeEntropyVolt = function (_a) {
        var sdk = _a.sdk, adminKey = _a.adminKey, pdaStr = _a.pdaStr, underlyingAssetMint = _a.underlyingAssetMint, whitelistTokenMintKey = _a.whitelistTokenMintKey, serumProgramId = _a.serumProgramId, entropyProgramId = _a.entropyProgramId, entropyGroupKey = _a.entropyGroupKey, targetPerpMarket = _a.targetPerpMarket, spotPerpMarket = _a.spotPerpMarket, spotMarket = _a.spotMarket, targetLeverageRatio = _a.targetLeverageRatio, targetLeverageLenience = _a.targetLeverageLenience, targetHedgeLenience = _a.targetHedgeLenience, shouldHedge = _a.shouldHedge, hedgeWithSpot = _a.hedgeWithSpot, targetHedgeRatio = _a.targetHedgeRatio, rebalancingLenience = _a.rebalancingLenience, requiredBasisFromOracle = _a.requiredBasisFromOracle, exitEarlyRatio = _a.exitEarlyRatio, capacity = _a.capacity, individualCapacity = _a.individualCapacity;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, vault, vaultAuthorityBump, extraVoltKey, vaultMint, vaultAuthority, depositPoolKey, entropyAccountKey, entropyMetadataKey, client, entropyGroup, entropyCacheKey, initializeEntropyAccounts, instruction;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findInitializeAddresses(sdk, whitelistTokenMintKey, constants_1.VoltType.Entropy, {
                            pdaStr: pdaStr,
                        })];
                    case 1:
                        _b = _c.sent(), vault = _b.vault, vaultAuthorityBump = _b.vaultAuthorityBump, extraVoltKey = _b.extraVoltKey, vaultMint = _b.vaultMint, vaultAuthority = _b.vaultAuthority, depositPoolKey = _b.depositPoolKey;
                        return [4 /*yield*/, VoltSDK.findEntropyAccountAddress(vault)];
                    case 2:
                        entropyAccountKey = (_c.sent())[0];
                        return [4 /*yield*/, VoltSDK.findEntropyMetadataAddress(vault)];
                    case 3:
                        entropyMetadataKey = (_c.sent())[0];
                        client = new entropy_client_1.EntropyClient(sdk.readonlyProvider.connection, constants_1.ENTROPY_PROGRAM_ID);
                        return [4 /*yield*/, client.getEntropyGroup(entropyGroupKey)];
                    case 4:
                        entropyGroup = _c.sent();
                        entropyCacheKey = entropyGroup.entropyCache;
                        initializeEntropyAccounts = {
                            authority: adminKey,
                            adminKey: adminKey,
                            voltVault: vault,
                            vaultAuthority: vaultAuthority,
                            vaultMint: vaultMint,
                            extraVoltData: extraVoltKey,
                            entropyMetadata: entropyMetadataKey,
                            depositPool: depositPoolKey,
                            depositMint: underlyingAssetMint,
                            dexProgram: serumProgramId,
                            entropyProgram: entropyProgramId,
                            entropyGroup: entropyGroupKey,
                            entropyAccount: entropyAccountKey,
                            entropyCache: entropyCacheKey,
                            powerPerpMarket: targetPerpMarket,
                            hedgingSpotPerpMarket: spotPerpMarket,
                            hedgingSpotMarket: spotMarket,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        };
                        instruction = sdk.programs.Volt.instruction.initializeEntropy(pdaStr, vaultAuthorityBump, targetLeverageRatio, targetLeverageLenience, targetHedgeLenience, exitEarlyRatio, capacity, individualCapacity, shouldHedge, hedgeWithSpot, targetHedgeRatio, rebalancingLenience, requiredBasisFromOracle, {
                            accounts: initializeEntropyAccounts,
                        });
                        return [2 /*return*/, {
                                instruction: instruction,
                                voltKey: vault,
                            }];
                }
            });
        });
    };
    /**
     * For an admin to create a volt
     *
     * spotMarket and seed are dynamically generated. Change the code if you want custom.
     */
    VoltSDK.initializeVolt = function (_a) {
        var sdk = _a.sdk, adminKey = _a.adminKey, optionMarket = _a.optionMarket, permissionedMarketPremiumMint = _a.permissionedMarketPremiumMint, serumProgramId = _a.serumProgramId, expirationInterval = _a.expirationInterval, capacity = _a.capacity, individualCapacity = _a.individualCapacity, permissionlessAuctions = _a.permissionlessAuctions, seed = _a.seed;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                return [2 /*return*/, VoltSDK.initializeVoltWithoutOptionMarketSeed({
                        sdk: sdk,
                        adminKey: adminKey,
                        underlyingAssetMint: optionMarket.underlyingAssetMint,
                        quoteAssetMint: optionMarket.quoteAssetMint,
                        permissionedMarketPremiumMint: permissionedMarketPremiumMint,
                        underlyingAmountPerContract: optionMarket.underlyingAmountPerContract,
                        // whitelistTokenMintKey,
                        serumProgramId: serumProgramId,
                        expirationInterval: expirationInterval,
                        capacity: capacity,
                        individualCapacity: individualCapacity,
                        permissionlessAuctions: permissionlessAuctions,
                        seed: seed,
                    })];
            });
        });
    };
    VoltSDK.prototype.getCoingeckoPrice = function (id) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var nodeFetch, coingeckoPath, coingeckoUrl, retries, response, data, _i, _b, _c, key, value;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return tslib_1.__importStar(require("node-fetch")); })];
                    case 1:
                        nodeFetch = _d.sent();
                        coingeckoPath = "/api/v3/simple/price?ids=".concat(id, "&vs_currencies=usd&");
                        coingeckoUrl = "https://api.coingecko.com".concat(coingeckoPath);
                        retries = 0;
                        _d.label = 2;
                    case 2:
                        if (!(true && retries < 5)) return [3 /*break*/, 7];
                        return [4 /*yield*/, nodeFetch.default(coingeckoUrl)];
                    case 3:
                        response = _d.sent();
                        if (!(response.status === 200)) return [3 /*break*/, 5];
                        return [4 /*yield*/, response.json()];
                    case 4:
                        data = _d.sent();
                        if (data && typeof data === "object") {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            for (_i = 0, _b = Object.entries(data); _i < _b.length; _i++) {
                                _c = _b[_i], key = _c[0], value = _c[1];
                                if (
                                // eslint-disable-next-line no-prototype-builtins
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, no-prototype-builtins
                                !(value &&
                                    typeof value === "object" &&
                                    // eslint-disable-next-line no-prototype-builtins
                                    value.hasOwnProperty("usd"))) {
                                    throw new Error("Missing usd in " + key);
                                }
                            }
                            return [2 /*return*/, new decimal_js_1.Decimal((_a = data[id]) === null || _a === void 0 ? void 0 : _a.usd.toString())];
                        }
                        else {
                            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
                            throw new Error("received undefined response = " + response.toString());
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        console.error(response);
                        console.error("status != 200, === ", response.status.toString());
                        _d.label = 6;
                    case 6:
                        retries += 1;
                        return [3 /*break*/, 2];
                    case 7: 
                    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
                    throw new Error("retries failed");
                }
            });
        });
    };
    VoltSDK.prototype.oraclePriceForTokenIndex = function (entropyGroup, entropyCache, tokenIndex) {
        var oraclePrice = entropyGroup.getPrice(tokenIndex, entropyCache);
        if (oraclePrice === undefined)
            throw new Error("oracle price was undefined");
        return new decimal_js_1.Decimal(oraclePrice.toString());
    };
    VoltSDK.prototype.oraclePriceForMint = function (entropyGroup, entropyCache, mint) {
        var quoteInfo = entropyGroup.getQuoteTokenInfo();
        if (quoteInfo.mint.toString() === mint.toString()) {
            return new decimal_js_1.Decimal(1.0);
        }
        else {
            var tokenIndex = entropyGroup.getTokenIndex(mint);
            console.log("token mint = ", mint.toString(), ", index = ", tokenIndex.toString());
            return this.oraclePriceForTokenIndex(entropyGroup, entropyCache, tokenIndex);
        }
    };
    VoltSDK.prototype.oraclePriceForDepositToken = function (entropyGroup, entropyCache) {
        if (!this.extraVoltData) {
            throw new Error("extra volt data must be loaded");
        }
        return this.oraclePriceForMint(entropyGroup, entropyCache, this.voltVault.underlyingAssetMint);
    };
    // entropy get methods
    VoltSDK.prototype.getTvlWithoutPending = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getTvlWithoutPendingInDepositToken()];
                    case 1:
                        _b = (_a = (_c.sent())).mul;
                        return [4 /*yield*/, this.depositTokenPrice()];
                    case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    VoltSDK.prototype.getVaultMintSupplyWithBurnedWithdrawals = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var roundInfo, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getRoundByNumber(this.voltVault.roundNumber)];
                    case 1:
                        roundInfo = _b.sent();
                        _a = bn_js_1.default.bind;
                        return [4 /*yield*/, (0, spl_token_1.getMint)(this.sdk.readonlyProvider.connection, this.voltVault.vaultMint)];
                    case 2: return [2 /*return*/, new (_a.apply(bn_js_1.default, [void 0, (_b.sent()).supply.toString()]))().add(roundInfo.voltTokensFromPendingWithdrawals)];
                }
            });
        });
    };
    VoltSDK.prototype.getTvlStats = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var normFactor, totalVaultValueExcludingPendingDeposits, pendingDeposits, _a, pendingWithdrawals, _b, tvl, usdTvl, _c, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 1:
                        normFactor = _e.sent();
                        return [4 /*yield*/, this.getTvlWithoutPendingInDepositToken()];
                    case 2:
                        totalVaultValueExcludingPendingDeposits = _e.sent();
                        _a = decimal_js_1.Decimal.bind;
                        return [4 /*yield*/, this.getCurrentlyPendingDeposits()];
                    case 3:
                        pendingDeposits = new (_a.apply(decimal_js_1.Decimal, [void 0, (_e.sent()).toString()]))().div(normFactor);
                        _b = decimal_js_1.Decimal.bind;
                        return [4 /*yield*/, this.getCurrentlyPendingWithdrawals()];
                    case 4:
                        pendingWithdrawals = new (_b.apply(decimal_js_1.Decimal, [void 0, (_e.sent()).toString()]))().div(normFactor);
                        tvl = totalVaultValueExcludingPendingDeposits.add(pendingDeposits);
                        _d = (_c = tvl).mul;
                        return [4 /*yield*/, this.depositTokenPrice()];
                    case 5:
                        usdTvl = _d.apply(_c, [_e.sent()]);
                        return [2 /*return*/, {
                                tvl: tvl,
                                usdTvl: usdTvl,
                                strategyDeposits: totalVaultValueExcludingPendingDeposits,
                                pendingDeposits: pendingDeposits,
                                pendingWithdrawals: pendingWithdrawals,
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.depositMint = function () {
        return this.voltVault.underlyingAssetMint;
    };
    VoltSDK.prototype.getTvl = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var usdTvl;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTvlStats()];
                    case 1:
                        usdTvl = (_a.sent()).usdTvl;
                        return [2 /*return*/, usdTvl];
                }
            });
        });
    };
    VoltSDK.prototype.getTvlInDepositToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var tvl;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTvlStats()];
                    case 1:
                        tvl = (_a.sent()).tvl;
                        return [2 /*return*/, tvl];
                }
            });
        });
    };
    // entropy get methods
    VoltSDK.prototype.getTvlWithoutPendingInDepositToken = function (normFactor) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.getTvlWithoutPendingInDepositTokenWithNormFactor;
                        if (!(normFactor !== null && normFactor !== void 0)) return [3 /*break*/, 1];
                        _b = normFactor;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3: return [2 /*return*/, _a.apply(this, [_b])];
                }
            });
        });
    };
    VoltSDK.prototype.getTvlWithoutPendingInDepositTokenWithNormFactor = function (normFactor) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var voltType, mainStrategyTvl, res, voltDepositTokenBalance, voltWriterTokenBalance, estimatedTotalWithoutPendingDepositTokenAmount, _a, entropyGroup, entropyAccount, entropyCache, acctEquity, oraclePrice, acctValueInDepositToken, depositPoolBalance, entropyLendingTvl, err_3;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        voltType = this.voltType();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, , 11]);
                        mainStrategyTvl = new decimal_js_1.Decimal(0.0);
                        if (!(voltType === constants_1.VoltType.ShortOptions)) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalanceOrZeroStruct)(this.sdk.readonlyProvider.connection, this.voltVault.depositPool)];
                    case 2:
                        res = _b.sent();
                        voltDepositTokenBalance = new decimal_js_1.Decimal(res.balance.toString());
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalanceOrZero)(this.sdk.readonlyProvider.connection, this.voltVault.writerTokenPool)];
                    case 3:
                        voltWriterTokenBalance = _b.sent();
                        estimatedTotalWithoutPendingDepositTokenAmount = voltDepositTokenBalance
                            .plus(new decimal_js_1.Decimal(voltWriterTokenBalance.toString()).mul(new decimal_js_1.Decimal(this.voltVault.underlyingAmountPerContract.toString())))
                            .div(normFactor);
                        mainStrategyTvl = mainStrategyTvl.add(estimatedTotalWithoutPendingDepositTokenAmount);
                        return [3 /*break*/, 8];
                    case 4:
                        if (!(voltType === constants_1.VoltType.Entropy)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getEntropyObjectsForEvData()];
                    case 5:
                        _a = _b.sent(), entropyGroup = _a.entropyGroup, entropyAccount = _a.entropyAccount, entropyCache = _a.entropyCache;
                        acctEquity = new decimal_js_1.Decimal(entropyAccount
                            .getHealthUnweighted(entropyGroup, entropyCache)
                            .toString());
                        oraclePrice = this.oraclePriceForDepositToken(entropyGroup, entropyCache);
                        acctValueInDepositToken = acctEquity.div(oraclePrice);
                        return [4 /*yield*/, (0, friktion_utils_1.getAccountBalance)(this.sdk.readonlyProvider.connection, this.voltVault.depositPool)];
                    case 6:
                        depositPoolBalance = _b.sent();
                        mainStrategyTvl = mainStrategyTvl.add(new decimal_js_1.Decimal(acctValueInDepositToken.toString())
                            .add(new decimal_js_1.Decimal(depositPoolBalance.toString()))
                            .div(normFactor));
                        return [3 /*break*/, 8];
                    case 7: throw new Error("volt type not recognized");
                    case 8: return [4 /*yield*/, this.getEntropyLendingTvlInDepositToken()];
                    case 9:
                        entropyLendingTvl = (_b.sent()).div(normFactor);
                        mainStrategyTvl = mainStrategyTvl.add(entropyLendingTvl);
                        return [2 /*return*/, mainStrategyTvl];
                    case 10:
                        err_3 = _b.sent();
                        console.error("could not load volt value: ", err_3);
                        throw new Error("could not load volt value");
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.getCurrentlyPendingDeposits = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data, _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = friktion_utils_1.getAccountBalanceOrZeroStruct;
                        _b = [this.sdk.readonlyProvider.connection];
                        return [4 /*yield*/, VoltSDK.findRoundUnderlyingTokensAddress(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_c.sent())[0]]))];
                    case 2:
                        data = _c.sent();
                        return [2 /*return*/, data.balance];
                }
            });
        });
    };
    VoltSDK.prototype.getCurrentlyPendingWithdrawals = function (totalValueValueExcludingPendingDeposits) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var roundForPendingWithdrawal, voltTokenSupply, pendingWithdrawalsInDepositToken;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoundByNumber(this.voltVault.roundNumber)];
                    case 1:
                        roundForPendingWithdrawal = _a.sent();
                        return [4 /*yield*/, this.getVaultMintSupplyWithBurnedWithdrawals()];
                    case 2:
                        voltTokenSupply = _a.sent();
                        if (!(totalValueValueExcludingPendingDeposits === undefined)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getTvlWithoutPendingInDepositToken()];
                    case 3:
                        totalValueValueExcludingPendingDeposits =
                            _a.sent();
                        _a.label = 4;
                    case 4:
                        pendingWithdrawalsInDepositToken = voltTokenSupply.eqn(0)
                            ? new bn_js_1.default(0)
                            : new bn_js_1.default(new decimal_js_1.Decimal(roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString())
                                .mul(totalValueValueExcludingPendingDeposits)
                                .div(new decimal_js_1.Decimal(voltTokenSupply.toString()))
                                .toFixed(0));
                        return [2 /*return*/, pendingWithdrawalsInDepositToken];
                }
            });
        });
    };
    VoltSDK.prototype.getBalancesForUser = function (pubkey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var voltVault, connection, underlyingTokenMintInfo, vaultTokenMintInfo, normFactor, vaultNormFactor, totalVaultValueExcludingPendingDeposits, roundInfo, voltTokenSupply, vaultTokenAccount, userVoltTokens, _a, err_4, userValueExcludingPendingDeposits, pendingDepositInfo, err_5, userValueFromPendingDeposits, userMintableShares, roundForPendingDeposit, voltTokensForPendingDepositRound, _b, _c, _d, pendingwithdrawalInfo, err_6, userValueFromPendingWithdrawals, userClaimableUnderlying, roundForPendingWithdrawal, underlyingTokensForPendingWithdrawalRound, _e, _f, _g, totalUserValue;
            return tslib_1.__generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        voltVault = this.voltVault;
                        connection = this.sdk.readonlyProvider.connection;
                        return [4 /*yield*/, (0, spl_token_1.getMint)(connection, voltVault.underlyingAssetMint)];
                    case 1:
                        underlyingTokenMintInfo = _h.sent();
                        return [4 /*yield*/, (0, spl_token_1.getMint)(connection, voltVault.vaultMint)];
                    case 2:
                        vaultTokenMintInfo = _h.sent();
                        normFactor = new decimal_js_1.Decimal(10).pow(underlyingTokenMintInfo.decimals);
                        vaultNormFactor = new decimal_js_1.Decimal(10).pow(vaultTokenMintInfo.decimals);
                        return [4 /*yield*/, this.getTvlWithoutPendingInDepositToken(normFactor)];
                    case 3:
                        totalVaultValueExcludingPendingDeposits = (_h.sent()).mul(normFactor);
                        return [4 /*yield*/, this.getRoundByNumber(voltVault.roundNumber)];
                    case 4:
                        roundInfo = _h.sent();
                        voltTokenSupply = new decimal_js_1.Decimal(vaultTokenMintInfo.supply.toString()).add(new decimal_js_1.Decimal(roundInfo.voltTokensFromPendingWithdrawals.toString()));
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(voltVault.vaultMint, pubkey, true)];
                    case 5:
                        vaultTokenAccount = _h.sent();
                        userVoltTokens = new decimal_js_1.Decimal(0);
                        _h.label = 6;
                    case 6:
                        _h.trys.push([6, 8, , 9]);
                        _a = decimal_js_1.Decimal.bind;
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.sdk.readonlyProvider.connection, vaultTokenAccount)];
                    case 7:
                        userVoltTokens = new (_a.apply(decimal_js_1.Decimal, [void 0, (_h.sent()).amount.toString()]))();
                        return [3 /*break*/, 9];
                    case 8:
                        err_4 = _h.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        userValueExcludingPendingDeposits = voltTokenSupply.lte(0)
                            ? new decimal_js_1.Decimal(0)
                            : totalVaultValueExcludingPendingDeposits
                                .mul(userVoltTokens)
                                .div(voltTokenSupply);
                        pendingDepositInfo = null;
                        _h.label = 10;
                    case 10:
                        _h.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.getPendingDepositForGivenUser(pubkey)];
                    case 11:
                        pendingDepositInfo = _h.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        err_5 = _h.sent();
                        pendingDepositInfo = null;
                        return [3 /*break*/, 13];
                    case 13:
                        userValueFromPendingDeposits = new decimal_js_1.Decimal(0);
                        userMintableShares = new decimal_js_1.Decimal(0);
                        if (!(pendingDepositInfo !== null &&
                            pendingDepositInfo.numUnderlyingDeposited.gtn(0))) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.getRoundByNumber(pendingDepositInfo.roundNumber)];
                    case 14:
                        roundForPendingDeposit = _h.sent();
                        _b = decimal_js_1.Decimal.bind;
                        _c = spl_token_1.getAccount;
                        _d = [this.sdk.readonlyProvider.connection];
                        return [4 /*yield*/, VoltSDK.findRoundVoltTokensAddress(this.voltKey, roundForPendingDeposit.number, this.sdk.programs.Volt.programId)];
                    case 15: return [4 /*yield*/, _c.apply(void 0, _d.concat([(_h.sent())[0]]))];
                    case 16:
                        voltTokensForPendingDepositRound = new (_b.apply(decimal_js_1.Decimal, [void 0, (_h.sent()).amount.toString()]))();
                        userValueFromPendingDeposits =
                            voltTokenSupply.lte(0) ||
                                roundForPendingDeposit.underlyingFromPendingDeposits.lten(0)
                                ? new decimal_js_1.Decimal(0)
                                : pendingDepositInfo.roundNumber.eq(this.voltVault.roundNumber)
                                    ? new decimal_js_1.Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
                                    : new decimal_js_1.Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
                                        .mul(voltTokensForPendingDepositRound)
                                        .div(new decimal_js_1.Decimal(roundForPendingDeposit.underlyingFromPendingDeposits.toString()))
                                        .mul(totalVaultValueExcludingPendingDeposits)
                                        .div(voltTokenSupply);
                        userMintableShares =
                            voltTokenSupply.lte(0) ||
                                roundForPendingDeposit.underlyingFromPendingDeposits.lten(0) ||
                                pendingDepositInfo.roundNumber.gte(this.voltVault.roundNumber)
                                ? new decimal_js_1.Decimal(0)
                                : new decimal_js_1.Decimal(pendingDepositInfo.numUnderlyingDeposited.toString())
                                    .mul(voltTokensForPendingDepositRound)
                                    .div(new decimal_js_1.Decimal(roundForPendingDeposit.underlyingFromPendingDeposits.toString()));
                        _h.label = 17;
                    case 17:
                        pendingwithdrawalInfo = null;
                        _h.label = 18;
                    case 18:
                        _h.trys.push([18, 20, , 21]);
                        return [4 /*yield*/, this.getPendingWithdrawalForGivenUser(pubkey)];
                    case 19:
                        pendingwithdrawalInfo = _h.sent();
                        return [3 /*break*/, 21];
                    case 20:
                        err_6 = _h.sent();
                        pendingwithdrawalInfo = null;
                        return [3 /*break*/, 21];
                    case 21:
                        userValueFromPendingWithdrawals = new decimal_js_1.Decimal(0);
                        userClaimableUnderlying = new decimal_js_1.Decimal(0);
                        if (!(pendingwithdrawalInfo !== null &&
                            pendingwithdrawalInfo.numVoltRedeemed.gtn(0))) return [3 /*break*/, 25];
                        return [4 /*yield*/, this.getRoundByNumber(pendingwithdrawalInfo.roundNumber)];
                    case 22:
                        roundForPendingWithdrawal = _h.sent();
                        _e = decimal_js_1.Decimal.bind;
                        _f = spl_token_1.getAccount;
                        _g = [this.sdk.readonlyProvider.connection];
                        return [4 /*yield*/, VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(this.voltKey, roundForPendingWithdrawal.number, this.sdk.programs.Volt.programId)];
                    case 23: return [4 /*yield*/, _f.apply(void 0, _g.concat([(_h.sent())[0]]))];
                    case 24:
                        underlyingTokensForPendingWithdrawalRound = new (_e.apply(decimal_js_1.Decimal, [void 0, (_h.sent()).amount.toString()]))();
                        userValueFromPendingWithdrawals = voltTokenSupply.lte(0)
                            ? new decimal_js_1.Decimal(0)
                            : pendingwithdrawalInfo.roundNumber.eq(this.voltVault.roundNumber)
                                ? new decimal_js_1.Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
                                    .mul(new decimal_js_1.Decimal(totalVaultValueExcludingPendingDeposits.toString()))
                                    .div(voltTokenSupply)
                                : roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.lten(0)
                                    ? new decimal_js_1.Decimal(0)
                                    : new decimal_js_1.Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
                                        .mul(underlyingTokensForPendingWithdrawalRound)
                                        .div(new decimal_js_1.Decimal(roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()));
                        userClaimableUnderlying =
                            voltTokenSupply.lte(0) ||
                                pendingwithdrawalInfo.roundNumber.eq(this.voltVault.roundNumber)
                                ? new decimal_js_1.Decimal(0)
                                : roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.lten(0)
                                    ? new decimal_js_1.Decimal(0)
                                    : new decimal_js_1.Decimal(pendingwithdrawalInfo.numVoltRedeemed.toString())
                                        .mul(underlyingTokensForPendingWithdrawalRound)
                                        .div(new decimal_js_1.Decimal(roundForPendingWithdrawal.voltTokensFromPendingWithdrawals.toString()));
                        _h.label = 25;
                    case 25:
                        totalUserValue = userValueExcludingPendingDeposits
                            .add(userValueFromPendingDeposits)
                            .add(userValueFromPendingWithdrawals);
                        return [2 /*return*/, {
                                totalBalance: totalUserValue.div(normFactor),
                                normalBalance: userValueExcludingPendingDeposits.div(normFactor),
                                pendingDeposits: userValueFromPendingDeposits.div(normFactor),
                                pendingWithdrawals: userValueFromPendingWithdrawals.div(normFactor),
                                mintableShares: userMintableShares.div(normFactor),
                                claimableUnderlying: userClaimableUnderlying.div(normFactor),
                                normFactor: normFactor,
                                vaultNormFactor: vaultNormFactor,
                            }];
                }
            });
        });
    };
    /**
     * normalization factor based on # of decimals of underlying token
     */
    VoltSDK.prototype.getDepositTokenNormalizationFactor = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var underlyingAssetMintInfo, normFactor, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof window !== "undefined") {
                            throw new Error("You are NOT allowed to use getNormalizationFactor() from the browser");
                        }
                        if (this.normFactor !== undefined)
                            return [2 /*return*/, this.normFactor];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, spl_token_1.getMint)(this.sdk.readonlyProvider.connection, this.voltVault.underlyingAssetMint)];
                    case 2:
                        underlyingAssetMintInfo = _a.sent();
                        normFactor = new decimal_js_1.Decimal(10).toPower(new decimal_js_1.Decimal(underlyingAssetMintInfo.decimals.toString()));
                        this.normFactor = normFactor;
                        return [2 /*return*/, normFactor];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1 instanceof Error) {
                            throw new Error("getNormalizationFactor error: " + e_1.message);
                        }
                        throw e_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.findPermissionedMarketPremiumPoolAddress = function (voltKey, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([voltKey.toBuffer(), textEncoder.encode("permissionedMarketPremiumPool")], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findWhitelistTokenAccountAddress = function (voltKey, whitelistMintKey, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                whitelistMintKey.toBuffer(),
                                textEncoder.encode("whitelistTokenAccount"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findEpochInfoAddress = function (voltKey, roundNumber, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                new bn_js_1.default(roundNumber.toString()).toBuffer("le", 8),
                                textEncoder.encode("epochInfo"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findEntropyRoundInfoAddress = function (voltKey, roundNumber, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                new bn_js_1.default(roundNumber.toString()).toBuffer("le", 8),
                                textEncoder.encode("entropyRoundInfo"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findRoundInfoAddress = function (voltKey, roundNumber, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                new bn_js_1.default(roundNumber.toString()).toBuffer("le", 8),
                                textEncoder.encode("roundInfo"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findRoundVoltTokensAddress = function (voltKey, roundNumber, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                new bn_js_1.default(roundNumber.toString()).toBuffer("le", 8),
                                textEncoder.encode("roundVoltTokens"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findRoundUnderlyingTokensAddress = function (voltKey, roundNumber, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                new bn_js_1.default(roundNumber.toString()).toBuffer("le", 8),
                                textEncoder.encode("roundUnderlyingTokens"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress = function (voltKey, roundNumber, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                new bn_js_1.default(roundNumber.toString()).toBuffer("le", 8),
                                textEncoder.encode("roundUlPending"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findRoundAddresses = function (voltKey, roundNumber, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, roundInfoKey, roundInfoKeyBump, _b, roundUnderlyingTokensKey, roundUnderlyingTokensKeyBump, _c, roundVoltTokensKey, roundVoltTokensKeyBump, _d, roundUnderlyingPendingWithdrawalsKey, roundUnderlyingPendingWithdrawalsBump, _e, epochInfoKey, epochInfoBump, _f, entropyRoundInfoKey, entropyRoundInfoBump;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findRoundInfoAddress(voltKey, roundNumber, voltProgramId)];
                    case 1:
                        _a = _g.sent(), roundInfoKey = _a[0], roundInfoKeyBump = _a[1];
                        return [4 /*yield*/, VoltSDK.findRoundUnderlyingTokensAddress(voltKey, roundNumber, voltProgramId)];
                    case 2:
                        _b = _g.sent(), roundUnderlyingTokensKey = _b[0], roundUnderlyingTokensKeyBump = _b[1];
                        return [4 /*yield*/, VoltSDK.findRoundVoltTokensAddress(voltKey, roundNumber, voltProgramId)];
                    case 3:
                        _c = _g.sent(), roundVoltTokensKey = _c[0], roundVoltTokensKeyBump = _c[1];
                        return [4 /*yield*/, VoltSDK.findRoundUnderlyingPendingWithdrawalsAddress(voltKey, roundNumber, voltProgramId)];
                    case 4:
                        _d = _g.sent(), roundUnderlyingPendingWithdrawalsKey = _d[0], roundUnderlyingPendingWithdrawalsBump = _d[1];
                        return [4 /*yield*/, VoltSDK.findEpochInfoAddress(voltKey, roundNumber, voltProgramId)];
                    case 5:
                        _e = _g.sent(), epochInfoKey = _e[0], epochInfoBump = _e[1];
                        return [4 /*yield*/, VoltSDK.findEntropyRoundInfoAddress(voltKey, roundNumber, voltProgramId)];
                    case 6:
                        _f = _g.sent(), entropyRoundInfoKey = _f[0], entropyRoundInfoBump = _f[1];
                        return [2 /*return*/, {
                                roundInfoKey: roundInfoKey,
                                roundInfoKeyBump: roundInfoKeyBump,
                                roundUnderlyingTokensKey: roundUnderlyingTokensKey,
                                roundUnderlyingTokensKeyBump: roundUnderlyingTokensKeyBump,
                                roundVoltTokensKey: roundVoltTokensKey,
                                roundVoltTokensKeyBump: roundVoltTokensKeyBump,
                                roundUnderlyingPendingWithdrawalsKey: roundUnderlyingPendingWithdrawalsKey,
                                roundUnderlyingPendingWithdrawalsBump: roundUnderlyingPendingWithdrawalsBump,
                                entropyRoundInfoKey: entropyRoundInfoKey,
                                entropyRoundInfoBump: entropyRoundInfoBump,
                                epochInfoKey: epochInfoKey,
                                epochInfoBump: epochInfoBump,
                            }];
                }
            });
        });
    };
    VoltSDK.findUsefulAddresses = function (voltKey, voltVault, user, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var pendingDepositInfoKey, pendingWithdrawalInfoKey, extraVoltKey, _a, roundInfoKey, roundUnderlyingTokensKey, roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey, epochInfoKey, epochInfoBump;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findPendingDepositAddresses(voltKey, user, voltProgramId)];
                    case 1:
                        pendingDepositInfoKey = (_b.sent()).pendingDepositInfoKey;
                        return [4 /*yield*/, VoltSDK.findPendingWithdrawalInfoAddress(voltKey, user, voltProgramId)];
                    case 2:
                        pendingWithdrawalInfoKey = (_b.sent())[0];
                        return [4 /*yield*/, VoltSDK.findExtraVoltDataAddress(voltKey, voltProgramId)];
                    case 3:
                        extraVoltKey = (_b.sent())[0];
                        return [4 /*yield*/, VoltSDK.findRoundAddresses(voltKey, voltVault.roundNumber, voltProgramId)];
                    case 4:
                        _a = _b.sent(), roundInfoKey = _a.roundInfoKey, roundUnderlyingTokensKey = _a.roundUnderlyingTokensKey, roundVoltTokensKey = _a.roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey = _a.roundUnderlyingPendingWithdrawalsKey, epochInfoKey = _a.epochInfoKey, epochInfoBump = _a.epochInfoBump;
                        return [2 /*return*/, {
                                extraVoltKey: extraVoltKey,
                                pendingDepositInfoKey: pendingDepositInfoKey,
                                roundInfoKey: roundInfoKey,
                                roundVoltTokensKey: roundVoltTokensKey,
                                roundUnderlyingTokensKey: roundUnderlyingTokensKey,
                                pendingWithdrawalInfoKey: pendingWithdrawalInfoKey,
                                roundUnderlyingPendingWithdrawalsKey: roundUnderlyingPendingWithdrawalsKey,
                                epochInfoKey: epochInfoKey,
                                epochInfoBump: epochInfoBump,
                            }];
                }
            });
        });
    };
    VoltSDK.findMostRecentVoltTokensAddress = function (voltKey, user, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                user.toBuffer(),
                                textEncoder.encode("mostRecentVoltTokens"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findPendingDepositInfoAddress = function (voltKey, user, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                user.toBuffer(),
                                textEncoder.encode("pendingDeposit"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findPendingDepositAddresses = function (voltKey, user, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, pendingDepositInfoKey, pendingDepositInfoKeyBump;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findPendingDepositInfoAddress(voltKey, user, voltProgramId)];
                    case 1:
                        _a = _b.sent(), pendingDepositInfoKey = _a[0], pendingDepositInfoKeyBump = _a[1];
                        return [2 /*return*/, {
                                pendingDepositInfoKey: pendingDepositInfoKey,
                                pendingDepositInfoKeyBump: pendingDepositInfoKeyBump,
                            }];
                }
            });
        });
    };
    VoltSDK.findPendingWithdrawalInfoAddress = function (voltKey, user, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                user.toBuffer(),
                                textEncoder.encode("pendingWithdrawal"),
                            ], voltProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.findSetNextOptionAddresses = function (voltKey, optionMint, writerTokenMint, voltProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder, _a, optionPoolKey, optionPoolBump, _b, writerTokenPoolKey, writerTokenPoolBump;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                optionMint.toBuffer(),
                                textEncoder.encode("optionPool"),
                            ], voltProgramId)];
                    case 1:
                        _a = _c.sent(), optionPoolKey = _a[0], optionPoolBump = _a[1];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                voltKey.toBuffer(),
                                writerTokenMint.toBuffer(),
                                textEncoder.encode("writerTokenPool"),
                            ], voltProgramId)];
                    case 2:
                        _b = _c.sent(), writerTokenPoolKey = _b[0], writerTokenPoolBump = _b[1];
                        return [2 /*return*/, {
                                optionPoolKey: optionPoolKey,
                                optionPoolBump: optionPoolBump,
                                writerTokenPoolKey: writerTokenPoolKey,
                                writerTokenPoolBump: writerTokenPoolBump,
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.findVaultAuthorityPermissionedOpenOrdersKey = function (serumMarketKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var openOrdersSeed, _a, openOrdersKey, openOrdersBump;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        openOrdersSeed = Buffer.from([
                            111, 112, 101, 110, 45, 111, 114, 100, 101, 114, 115,
                        ]);
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                openOrdersSeed,
                                this.sdk.net.SERUM_DEX_PROGRAM_ID.toBuffer(),
                                serumMarketKey.toBuffer(),
                                this.voltVault.vaultAuthority.toBuffer(),
                            ], this.sdk.programs.Volt.programId)];
                    case 1:
                        _a = _b.sent(), openOrdersKey = _a[0], openOrdersBump = _a[1];
                        return [2 /*return*/, { openOrdersKey: openOrdersKey, openOrdersBump: openOrdersBump }];
                }
            });
        });
    };
    VoltSDK.findPermissionedOpenOrdersKey = function (middlewareProgramId, user, serumMarketKey, dexProgramId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var openOrdersSeed, _a, openOrdersKey, openOrdersBump;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        openOrdersSeed = Buffer.from([
                            111, 112, 101, 110, 45, 111, 114, 100, 101, 114, 115,
                        ]);
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                openOrdersSeed,
                                dexProgramId.toBuffer(),
                                serumMarketKey.toBuffer(),
                                user.toBuffer(),
                            ], middlewareProgramId)];
                    case 1:
                        _a = _b.sent(), openOrdersKey = _a[0], openOrdersBump = _a[1];
                        return [2 /*return*/, { openOrdersKey: openOrdersKey, openOrdersBump: openOrdersBump }];
                }
            });
        });
    };
    VoltSDK.prototype.getEpochInfoByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.programs.Volt.account.friktionEpochInfo.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.prototype.getEpochInfoByNumber = function (roundNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findEpochInfoAddress(this.voltKey, roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [4 /*yield*/, this.getEpochInfoByKey(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getCurrentEpochInfo = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEpochInfoByNumber(this.voltVault.roundNumber)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyRoundByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.programs.Volt.account.entropyRound.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyRoundByNumber = function (roundNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findEntropyRoundInfoAddress(this.voltKey, roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [4 /*yield*/, this.getEntropyRoundByKey(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getCurrentEntropyRound = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEntropyRoundByNumber(this.voltVault.roundNumber)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getCurrentRound = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoundByNumber(this.voltVault.roundNumber)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getAllRounds = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var roundNumber, roundList, round;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        roundNumber = new bn_js_1.default(1);
                        roundList = [];
                        _a.label = 1;
                    case 1:
                        if (!roundNumber.lt(this.voltVault.roundNumber)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getRoundByNumber(roundNumber)];
                    case 2:
                        round = _a.sent();
                        roundList.push(round);
                        roundNumber = roundNumber.addn(1);
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, roundList];
                }
            });
        });
    };
    VoltSDK.prototype.getRoundByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.programs.Volt.account.round.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.prototype.getRoundByNumber = function (roundNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findRoundInfoAddress(this.voltKey, roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [2 /*return*/, this.getRoundByKey(key)];
                }
            });
        });
    };
    VoltSDK.prototype.loadInExtraVoltData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getExtraVoltData()];
                    case 1:
                        extraVoltData = _a.sent();
                        this.extraVoltData = extraVoltData;
                        return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.getExtraVoltData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key, acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findExtraVoltDataAddress(this.voltKey, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [4 /*yield*/, this.sdk.programs.Volt.account.extraVoltData.fetch(key)];
                    case 2:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyMetadata = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key, acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findEntropyMetadataAddress(this.voltKey, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [4 /*yield*/, this.sdk.programs.Volt.account.entropyMetadata.fetch(key)];
                    case 2:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.prototype.getAuctionMetadata = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getAuctionMetadataByKey;
                        return [4 /*yield*/, VoltSDK.findAuctionMetadataAddress(this.voltKey)];
                    case 1: return [4 /*yield*/, _a.apply(this, [(_b.sent())[0]])];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getAuctionMetadataByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.programs.Volt.account.auctionMetadata.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.prototype.getRoundVoltTokensByNumber = function (roundNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findRoundVoltTokensAddress(this.voltKey, roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_b.sent())[0];
                        _a = bn_js_1.default.bind;
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.sdk.readonlyProvider.connection, key)];
                    case 2: return [2 /*return*/, new (_a.apply(bn_js_1.default, [void 0, (_b.sent()).amount.toString()]))()];
                }
            });
        });
    };
    VoltSDK.prototype.getRoundUnderlyingTokensByNumber = function (roundNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findRoundUnderlyingTokensAddress(this.voltKey, roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_b.sent())[0];
                        _a = bn_js_1.default.bind;
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.sdk.readonlyProvider.connection, key)];
                    case 2: return [2 /*return*/, new (_a.apply(bn_js_1.default, [void 0, (_b.sent()).amount.toString()]))()];
                }
            });
        });
    };
    VoltSDK.prototype.getAllPendingDeposits = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.programs.Volt.account.pendingDeposit.all()];
                    case 1:
                        accts = (_a.sent());
                        return [2 /*return*/, accts.map(function (acct) { return (tslib_1.__assign(tslib_1.__assign({}, acct.account), { key: acct.publicKey })); })];
                }
            });
        });
    };
    VoltSDK.prototype.getPendingDepositByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.programs.Volt.account.pendingDeposit.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.prototype.getPendingDepositForGivenUser = function (user) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findPendingDepositInfoAddress(this.voltKey, user, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [4 /*yield*/, this.getPendingDepositByKey(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getPendingWithdrawalForGivenUser = function (user) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findPendingWithdrawalInfoAddress(this.voltKey, user, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [4 /*yield*/, this.getPendingWithdrawalByKey(key)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getAllPendingWithdrawals = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.programs.Volt.account.pendingWithdrawal.all()];
                    case 1:
                        accts = (_a.sent());
                        return [2 /*return*/, accts.map(function (acct) { return (tslib_1.__assign(tslib_1.__assign({}, acct.account), { key: acct.publicKey })); })];
                }
            });
        });
    };
    VoltSDK.prototype.getPendingWithdrawalByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.programs.Volt.account.pendingWithdrawal.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyAccountByKey = function (key, perpProtocol) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var programId, connection, client, entropyAccount;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!perpProtocol) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getPerpProtocolForKey(key)];
                    case 1:
                        perpProtocol = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (perpProtocol === "Entropy") {
                            programId = constants_1.ENTROPY_PROGRAM_ID;
                        }
                        else if (perpProtocol === "Mango") {
                            programId = constants_1.MANGO_PROGRAM_ID;
                        }
                        else {
                            throw new Error("options protocol not supported");
                        }
                        connection = this.sdk.readonlyProvider.connection;
                        client = new entropy_client_1.EntropyClient(connection, programId);
                        return [4 /*yield*/, client.getEntropyAccount(key, this.sdk.net.SERUM_DEX_PROGRAM_ID)];
                    case 3:
                        entropyAccount = _a.sent();
                        return [2 /*return*/, {
                                account: entropyAccount,
                                perpProtocol: perpProtocol,
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.getOptionsContractByKey = function (key, optionsProtocol) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.getOptionMarketByKey(key, optionsProtocol)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getRootAndNodeBank = function (entropyGroup) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var connection, banks, rootBank, nodeBank;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        connection = this.sdk.readonlyProvider.connection;
                        return [4 /*yield*/, entropyGroup.loadRootBanks(connection)];
                    case 1:
                        banks = _b.sent();
                        rootBank = banks[entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)];
                        return [4 /*yield*/, (rootBank === null || rootBank === void 0 ? void 0 : rootBank.loadNodeBanks(connection))];
                    case 2:
                        nodeBank = (_a = (_b.sent())) === null || _a === void 0 ? void 0 : _a[0];
                        if (!rootBank || !nodeBank) {
                            throw new Error("root bank or node bank was undefined");
                        }
                        return [2 /*return*/, {
                                rootBank: rootBank,
                                nodeBank: nodeBank,
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.getOptionsProtocolForKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.getOptionsProtocolForKey(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getPerpProtocolForKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accountInfo;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sdk.readonlyProvider.connection.getAccountInfo(key)];
                    case 1:
                        accountInfo = _a.sent();
                        if (!accountInfo) {
                            throw new Error("account does not exist, can't determine perp protocol owner");
                        }
                        if (accountInfo.owner.toString() === constants_1.ENTROPY_PROGRAM_ID.toString()) {
                            return [2 /*return*/, "Entropy"];
                        }
                        else if (accountInfo.owner.toString() === constants_1.MANGO_PROGRAM_ID.toString()) {
                            return [2 /*return*/, "Mango"];
                        }
                        else {
                            throw new Error("owner is not a supported perp protocol");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyGroup = function (entropyProgramId, entropyGroupKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var connection, client, entropyGroup;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (entropyProgramId.toString() !== constants_1.ENTROPY_PROGRAM_ID.toString() &&
                            entropyProgramId.toString() !== constants_1.MANGO_PROGRAM_ID.toString())
                            throw new Error("given program id must match entropy or mango");
                        connection = this.sdk.readonlyProvider.connection;
                        client = new entropy_client_1.EntropyClient(connection, entropyProgramId);
                        return [4 /*yield*/, client.getEntropyGroup(entropyGroupKey)];
                    case 1:
                        entropyGroup = _a.sent();
                        return [2 /*return*/, {
                                entropyClient: client,
                                entropyGroup: entropyGroup,
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyObjects = function (entropyProgramId, entropyGroupKey, entropyAccountKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var connection, client, entropyGroup, entropyAccount, entropyCache;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (entropyProgramId.toString() !== constants_1.ENTROPY_PROGRAM_ID.toString() &&
                            entropyProgramId.toString() !== constants_1.MANGO_PROGRAM_ID.toString())
                            throw new Error("given program id must match entropy or mango");
                        connection = this.sdk.readonlyProvider.connection;
                        client = new entropy_client_1.EntropyClient(connection, entropyProgramId);
                        return [4 /*yield*/, client.getEntropyGroup(entropyGroupKey)];
                    case 1:
                        entropyGroup = _a.sent();
                        return [4 /*yield*/, client.getEntropyAccount(entropyAccountKey, this.sdk.net.SERUM_DEX_PROGRAM_ID)];
                    case 2:
                        entropyAccount = _a.sent();
                        return [4 /*yield*/, entropyGroup.loadCache(connection)];
                    case 3:
                        entropyCache = _a.sent();
                        return [2 /*return*/, {
                                entropyClient: client,
                                entropyGroup: entropyGroup,
                                entropyAccount: entropyAccount,
                                entropyCache: entropyCache,
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyLendingTvl = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var entropyGroup, entropyAccount, entropyCache, err_7, acctEquity, oraclePrice, acctValueInDepositToken;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getEntropyLendingObjects()];
                    case 1:
                        (_a = _b.sent(), entropyGroup = _a.entropyGroup, entropyAccount = _a.entropyAccount, entropyCache = _a.entropyCache);
                        return [3 /*break*/, 3];
                    case 2:
                        err_7 = _b.sent();
                        return [2 /*return*/, {
                                tvlDepositToken: new decimal_js_1.Decimal(0),
                                tvlUsd: new decimal_js_1.Decimal(0),
                            }];
                    case 3:
                        acctEquity = new decimal_js_1.Decimal(entropyAccount.computeValue(entropyGroup, entropyCache).toString());
                        oraclePrice = this.oraclePriceForDepositToken(entropyGroup, entropyCache);
                        acctValueInDepositToken = acctEquity.div(oraclePrice);
                        console.log("acct equity = ", acctEquity.toString(), oraclePrice.toString());
                        return [2 /*return*/, {
                                tvlDepositToken: new decimal_js_1.Decimal(acctValueInDepositToken.toString()),
                                tvlUsd: new decimal_js_1.Decimal(acctEquity.toString()),
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyLendingTvlInDepositToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var tokens;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEntropyLendingTvl()];
                    case 1:
                        tokens = (_a.sent()).tvlDepositToken;
                        return [2 /*return*/, tokens];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyLendingKeys = function (entropyGroupGivenKey, entropyProgramGivenKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var entropyLendingProgramKey, entropyLendingGroupKey, _a, entropyLendingClient, entropyLendingAccount, err_8, entropyLendingAccountKey;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        entropyLendingProgramKey = entropyProgramGivenKey;
                        entropyLendingGroupKey = entropyGroupGivenKey;
                        if (!(entropyLendingGroupKey === undefined ||
                            entropyLendingProgramKey === undefined)) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getEntropyLendingObjects()];
                    case 2:
                        _a = _b.sent(), entropyLendingClient = _a.entropyClient, entropyLendingAccount = _a.entropyAccount;
                        entropyLendingProgramKey = entropyLendingClient.programId;
                        entropyLendingGroupKey = entropyLendingAccount.entropyGroup;
                        return [3 /*break*/, 4];
                    case 3:
                        err_8 = _b.sent();
                        entropyLendingProgramKey = constants_1.MANGO_PROGRAM_ID;
                        entropyLendingGroupKey = this.sdk.net.MANGO_GROUP;
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, VoltSDK.findEntropyLendingAccountAddress(this.voltKey)];
                    case 5:
                        entropyLendingAccountKey = (_b.sent())[0];
                        return [2 /*return*/, {
                                entropyLendingProgramKey: entropyLendingProgramKey,
                                entropyLendingGroupKey: entropyLendingGroupKey,
                                entropyLendingAccountKey: entropyLendingAccountKey,
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyLendingObjects = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var entropyLendingAccountKey, perpProtocol, entropyProgramId, tempAccount;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK.findEntropyLendingAccountAddress(this.voltKey)];
                    case 1:
                        entropyLendingAccountKey = (_a.sent())[0];
                        return [4 /*yield*/, this.getPerpProtocolForKey(entropyLendingAccountKey)];
                    case 2:
                        perpProtocol = _a.sent();
                        entropyProgramId = (0, utils_1.getProgramIdForPerpProtocol)(perpProtocol);
                        return [4 /*yield*/, this.getEntropyAccountByKey(entropyLendingAccountKey, perpProtocol)];
                    case 3:
                        tempAccount = (_a.sent()).account;
                        return [4 /*yield*/, this.getEntropyObjects(entropyProgramId, tempAccount.entropyGroup, entropyLendingAccountKey)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getEntropyObjectsForEvData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getExtraVoltData()];
                    case 1:
                        extraVoltData = _a.sent();
                        return [4 /*yield*/, this.getEntropyObjects(extraVoltData.entropyProgramId, extraVoltData.entropyGroup, extraVoltData.entropyAccount)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.getGroupAndBanks = function (client, entropyGroupKey, mint) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var connection, entropyGroup, banks, bankIndex, rootBank, nodeBank, quoteRootBank, quoteNodeBank;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        connection = client.connection;
                        return [4 /*yield*/, client.getEntropyGroup(entropyGroupKey)];
                    case 1:
                        entropyGroup = _c.sent();
                        return [4 /*yield*/, entropyGroup.loadRootBanks(connection)];
                    case 2:
                        banks = _c.sent();
                        bankIndex = entropyGroup.tokens.findIndex(function (ti) { return ti.mint.toString() === mint.toString(); });
                        rootBank = banks[bankIndex];
                        return [4 /*yield*/, (rootBank === null || rootBank === void 0 ? void 0 : rootBank.loadNodeBanks(connection))];
                    case 3:
                        nodeBank = (_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a[0];
                        quoteRootBank = banks[entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)];
                        return [4 /*yield*/, (quoteRootBank === null || quoteRootBank === void 0 ? void 0 : quoteRootBank.loadNodeBanks(connection))];
                    case 4:
                        quoteNodeBank = (_b = (_c.sent())) === null || _b === void 0 ? void 0 : _b[0];
                        if (bankIndex === undefined) {
                            if (mint.toString() === entropyGroup.getQuoteTokenInfo().mint.toString()) {
                                rootBank = quoteRootBank;
                                nodeBank = quoteNodeBank;
                            }
                            else {
                                throw new Error("bank index not found for mint = " + mint.toString());
                            }
                        }
                        return [2 /*return*/, {
                                entropyGroup: entropyGroup,
                                rootBank: rootBank,
                                nodeBank: nodeBank,
                                quoteRootBank: quoteRootBank,
                                quoteNodeBank: quoteNodeBank,
                                depositIndex: bankIndex,
                            }];
                }
            });
        });
    };
    VoltSDK.prototype.getGroupAndBanksForEvData = function (client, mint) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.extraVoltData)
                            throw new Error("extra volt data must be defined");
                        return [4 /*yield*/, VoltSDK.getGroupAndBanks(client, this.extraVoltData.entropyGroup, mint)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getPnlForEpoch = function (roundNumber, subtractFees) {
        if (subtractFees === void 0) { subtractFees = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var epochInfo, pnlForRound, _a, _b, _c, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getEpochInfoByNumber(roundNumber)];
                    case 1:
                        epochInfo = _e.sent();
                        if (epochInfo.number.eqn(0)) {
                            throw new Error("epoch info deprecated for this epoch. Try a newer epoch number");
                        }
                        if (!(this.voltType() === constants_1.VoltType.ShortOptions)) return [3 /*break*/, 3];
                        pnlForRound = epochInfo.underlyingPostSettle.sub(epochInfo.underlyingPreEnter);
                        if (subtractFees && pnlForRound.gtn(0))
                            pnlForRound = pnlForRound.sub(VoltSDK.performanceFeeAmount(pnlForRound));
                        _b = (_a = new decimal_js_1.Decimal(pnlForRound.toString())).div;
                        return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 2: return [2 /*return*/, _b.apply(_a, [_e.sent()])];
                    case 3:
                        if (!(this.voltType() === constants_1.VoltType.Entropy)) return [3 /*break*/, 5];
                        _d = (_c = new decimal_js_1.Decimal(epochInfo.pnl.toString())
                            .sub(new decimal_js_1.Decimal(epochInfo.performanceFees.toString())))
                            .div;
                        return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 4: return [2 /*return*/, _d.apply(_c, [_e.sent()])];
                    case 5: throw new Error("invalid volt type");
                }
            });
        });
    };
    // only works beginning with epoch on april 7
    VoltSDK.prototype.getApportionedPnlForEpoch = function (roundNumber, getApportionedPnlForRound, subtractFees) {
        if (subtractFees === void 0) { subtractFees = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var epochInfo, pnlForRound, voltTokenSupplyForRound, normFactor, participatingPnl;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEpochInfoByNumber(roundNumber)];
                    case 1:
                        epochInfo = _a.sent();
                        if (epochInfo.number.eqn(0)) {
                            throw new Error("epoch info deprecated for this epoch. Try a newer epoch number");
                        }
                        return [4 /*yield*/, this.getPnlForEpoch(roundNumber, subtractFees)];
                    case 2:
                        pnlForRound = _a.sent();
                        voltTokenSupplyForRound = epochInfo.voltTokenSupply;
                        return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 3:
                        normFactor = _a.sent();
                        participatingPnl = pnlForRound
                            .mul(new decimal_js_1.Decimal(getApportionedPnlForRound.toString()).div(normFactor))
                            .div(new decimal_js_1.Decimal(voltTokenSupplyForRound.toString()).div(normFactor));
                        return [2 /*return*/, new decimal_js_1.Decimal(participatingPnl.toString())];
                }
            });
        });
    };
    VoltSDK.prototype.getUserPendingDepositUnderlying = function (user) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, pendingDeposits;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBalancesForUser(user)];
                    case 1:
                        result = _a.sent();
                        if (!result)
                            throw new Error("can't find data for user");
                        pendingDeposits = result.pendingDeposits;
                        return [2 /*return*/, pendingDeposits];
                }
            });
        });
    };
    VoltSDK.prototype.getUserMintableShares = function (user) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.getUserMintableSharesForRound(user, this.voltVault.roundNumber)];
            });
        });
    };
    VoltSDK.prototype.getUserMintableSharesForRound = function (user, roundNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var pendingDepositInfo, err_9, result, mintableShares, err_10;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getPendingDepositForGivenUser(user)];
                    case 1:
                        pendingDepositInfo = _a.sent();
                        if (pendingDepositInfo.roundNumber >= roundNumber) {
                            return [2 /*return*/, new bn_js_1.default(0)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_9 = _a.sent();
                        return [2 /*return*/, new bn_js_1.default(0)];
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getBalancesForUser(user)];
                    case 4:
                        result = _a.sent();
                        if (!result)
                            return [2 /*return*/, new bn_js_1.default(0)];
                        mintableShares = result.mintableShares;
                        return [2 /*return*/, new bn_js_1.default(mintableShares.toFixed(0))];
                    case 5:
                        err_10 = _a.sent();
                        console.log(err_10);
                        return [2 /*return*/, new bn_js_1.default(0)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    VoltSDK.prototype.getCurrentMarketAndAuthorityInfo = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMarketAndAuthorityInfo(this.voltVault.optionMarket)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoltSDK.prototype.getMarketAndAuthorityInfo = function (optionMarketKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder, _a, serumMarketKey, _serumMarketBump, _b, marketAuthority, marketAuthorityBump;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, VoltSDK.findSerumMarketAddress(this.voltKey, this.sdk.net.MM_TOKEN_MINT, optionMarketKey)];
                    case 1:
                        _a = _c.sent(), serumMarketKey = _a[0], _serumMarketBump = _a[1];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                textEncoder.encode("open-orders-init"),
                                this.sdk.net.SERUM_DEX_PROGRAM_ID.toBuffer(),
                                serumMarketKey.toBuffer(),
                            ], this.sdk.programs.Volt.programId)];
                    case 2:
                        _b = _c.sent(), marketAuthority = _b[0], marketAuthorityBump = _b[1];
                        return [2 /*return*/, { serumMarketKey: serumMarketKey, marketAuthority: marketAuthority, marketAuthorityBump: marketAuthorityBump }];
                }
            });
        });
    };
    return VoltSDK;
}());
exports.VoltSDK = VoltSDK;
