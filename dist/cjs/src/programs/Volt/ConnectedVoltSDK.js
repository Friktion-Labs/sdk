"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectedVoltSDK = void 0;
var tslib_1 = require("tslib");
var entropy_client_1 = require("@friktion-labs/entropy-client");
var friktion_utils_1 = require("@friktion-labs/friktion-utils");
var serum_1 = require("@project-serum/serum");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var bn_js_1 = tslib_1.__importDefault(require("bn.js"));
var decimal_js_1 = tslib_1.__importDefault(require("decimal.js"));
var __1 = require("../..");
var constants_1 = require("../../constants");
var serum_2 = require("./serum");
var VoltSDK_1 = require("./VoltSDK");
/// NOTE: the following instructions currently consume > 200k CUs (forced to compile with opt-level Z in order to fit in program account size)
/// easy fix is to add a compute budget program request for 400k units (more than enough for any of these)
// 1. rebalanceEntropy
// 2. rebalanceSpotEntropy
// 3. setupRebalanceEntropy
// 4. takePerformanceFeesEntropy
// 5. initializeVolt (initialize for volt 1 & 2)
// MAYBE:
// 1. depositWithClaim (when it claims or cancels and does instant deposit)
// 2. withdrawWithClaim (same as above)
var ConnectedVoltSDK = /** @class */ (function (_super) {
    tslib_1.__extends(ConnectedVoltSDK, _super);
    function ConnectedVoltSDK(connection, user, voltSDK, daoAuthority) {
        var _this = _super.call(this, voltSDK.sdk, voltSDK.voltVault, voltSDK.voltKey, voltSDK.extraVoltData) || this;
        _this.connection = connection;
        _this.wallet = user;
        // = providerToContribProvider(providerMut);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        _this.daoAuthority = daoAuthority;
        // There is an obscure bug where the wallet.publicKey was a naked BN and not
        // a PublicKey. Please use this.user instead of this.providerMut.wallet.publicKey
        _this.wallet = new web3_js_1.PublicKey(_this.wallet);
        return _this;
    }
    ConnectedVoltSDK.prototype.refresh = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = ConnectedVoltSDK.bind;
                        _b = [void 0, this.connection,
                            this.wallet];
                        return [4 /*yield*/, this.sdk.loadVoltAndExtraDataByKey(this.voltKey)];
                    case 1: return [2 /*return*/, new (_a.apply(ConnectedVoltSDK, _b.concat([_c.sent(), this.daoAuthority])))()];
                }
            });
        });
    };
    /**
     * humanDepositAmount: human readable amount of underlying token to deposit (e.g 1.1 USDC, 0.0004 BTC). this is normalized by the 10^(num decimals)
     * underlyingTokenSource: address of token account used to deposit tokens
     * vaultTokenDestination: if instant transfers are enabled, the token acccount that should receive the new vault tokens (shares of volt)
     * daoAuthority: special field designated for use cases that require a different tx fee & rent payer vs. underlyingTokenSource authority. If this is used
     **/
    ConnectedVoltSDK.prototype.deposit = function (humanDepositAmount, underlyingTokenSource, vaultTokenDestination, daoAuthority, decimals) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _o, roundInfoKey, roundUnderlyingTokensKey, roundVoltTokensKey, pendingDepositInfoKey, epochInfoKey, normFactor, _p, normalizedDepositAmount, extraVoltKey, depositAccountsStruct;
            return tslib_1.__generator(this, function (_q) {
                switch (_q.label) {
                    case 0:
                        if (daoAuthority === undefined)
                            daoAuthority = this.daoAuthority;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, daoAuthority !== undefined ? daoAuthority : this.wallet, this.sdk.programs.Volt.programId)];
                    case 1:
                        _o = _q.sent(), roundInfoKey = _o.roundInfoKey, roundUnderlyingTokensKey = _o.roundUnderlyingTokensKey, roundVoltTokensKey = _o.roundVoltTokensKey, pendingDepositInfoKey = _o.pendingDepositInfoKey, epochInfoKey = _o.epochInfoKey;
                        if (!decimals) return [3 /*break*/, 2];
                        _p = new decimal_js_1.default(Math.pow(10, decimals));
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 3:
                        _p = _q.sent();
                        _q.label = 4;
                    case 4:
                        normFactor = _p;
                        normalizedDepositAmount = new bn_js_1.default(humanDepositAmount.mul(normFactor).toString());
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 5:
                        extraVoltKey = (_q.sent())[0];
                        depositAccountsStruct = {
                            // tx fee + rent payer, optionally authority on underlyingTokenSource token account
                            authority: this.wallet,
                            // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
                            daoAuthority: daoAuthority !== undefined
                                ? daoAuthority
                                : ((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.isForDao)
                                    ? this.extraVoltData.daoAuthority
                                    : web3_js_1.SystemProgram.programId,
                            // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
                            authorityCheck: daoAuthority !== undefined
                                ? daoAuthority
                                : ((_b = this.extraVoltData) === null || _b === void 0 ? void 0 : _b.isForDao)
                                    ? this.extraVoltData.daoAuthority
                                    : this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            whitelist: (_d = (_c = this.extraVoltData) === null || _c === void 0 ? void 0 : _c.whitelist) !== null && _d !== void 0 ? _d : web3_js_1.SystemProgram.programId,
                            vaultMint: this.voltVault.vaultMint,
                            depositPool: this.voltVault.depositPool,
                            writerTokenPool: this.voltVault.writerTokenPool,
                            underlyingTokenSource: underlyingTokenSource,
                            vaultTokenDestination: vaultTokenDestination,
                            roundInfo: roundInfoKey,
                            roundVoltTokens: roundVoltTokensKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            pendingDepositInfo: pendingDepositInfoKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            // required to calculate total $ value of volts integrated w/ entropy or mango
                            entropyGroup: (_f = (_e = this.extraVoltData) === null || _e === void 0 ? void 0 : _e.entropyGroup) !== null && _f !== void 0 ? _f : web3_js_1.SystemProgram.programId,
                            entropyAccount: (_h = (_g = this.extraVoltData) === null || _g === void 0 ? void 0 : _g.entropyAccount) !== null && _h !== void 0 ? _h : web3_js_1.SystemProgram.programId,
                            entropyCache: (_k = (_j = this.extraVoltData) === null || _j === void 0 ? void 0 : _j.entropyCache) !== null && _k !== void 0 ? _k : web3_js_1.SystemProgram.programId,
                            entropyProgram: (_m = (_l = this.extraVoltData) === null || _l === void 0 ? void 0 : _l.entropyProgramId) !== null && _m !== void 0 ? _m : web3_js_1.SystemProgram.programId,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.deposit(normalizedDepositAmount, {
                                accounts: depositAccountsStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.depositWithClaim = function (trueDepositAmount, underlyingTokenSource, vaultTokenDestination, shouldTransferSol, solTransferAuthority, daoAuthority, decimals) {
        var _a, _b, _c;
        if (shouldTransferSol === void 0) { shouldTransferSol = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _d, roundInfoKey, roundUnderlyingTokensKey, epochInfoKey, pendingDepositInfoKey, normFactor, _e, normalizedDepositAmount, pendingDepositInfo, err_1, extraVoltKey, _f, pendingDepositRoundInfoKey, pendingDepositRoundVoltTokensKey, pendingDepositRoundUnderlyingTokensKey, depositWithClaimAccounts;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (daoAuthority === undefined)
                            daoAuthority = this.daoAuthority;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, daoAuthority !== undefined ? daoAuthority : this.wallet, this.sdk.programs.Volt.programId)];
                    case 1:
                        _d = _g.sent(), roundInfoKey = _d.roundInfoKey, roundUnderlyingTokensKey = _d.roundUnderlyingTokensKey, epochInfoKey = _d.epochInfoKey, pendingDepositInfoKey = _d.pendingDepositInfoKey;
                        if (!decimals) return [3 /*break*/, 2];
                        _e = new decimal_js_1.default(Math.pow(10, decimals));
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getDepositTokenNormalizationFactor()];
                    case 3:
                        _e = _g.sent();
                        _g.label = 4;
                    case 4:
                        normFactor = _e;
                        normalizedDepositAmount = new bn_js_1.default(trueDepositAmount.mul(normFactor).toString());
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.getPendingDepositByKey(pendingDepositInfoKey)];
                    case 6:
                        pendingDepositInfo = _g.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_1 = _g.sent();
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 9:
                        extraVoltKey = (_g.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, (_a = pendingDepositInfo === null || pendingDepositInfo === void 0 ? void 0 : pendingDepositInfo.roundNumber) !== null && _a !== void 0 ? _a : new bn_js_1.default(0), this.sdk.programs.Volt.programId)];
                    case 10:
                        _f = _g.sent(), pendingDepositRoundInfoKey = _f.roundInfoKey, pendingDepositRoundVoltTokensKey = _f.roundVoltTokensKey, pendingDepositRoundUnderlyingTokensKey = _f.roundUnderlyingTokensKey;
                        depositWithClaimAccounts = {
                            authority: this.wallet,
                            daoAuthority: daoAuthority !== undefined
                                ? daoAuthority
                                : ((_b = this.extraVoltData) === null || _b === void 0 ? void 0 : _b.isForDao)
                                    ? this.extraVoltData.daoAuthority
                                    : web3_js_1.SystemProgram.programId,
                            authorityCheck: daoAuthority !== undefined
                                ? daoAuthority
                                : ((_c = this.extraVoltData) === null || _c === void 0 ? void 0 : _c.isForDao)
                                    ? this.extraVoltData.daoAuthority
                                    : this.wallet,
                            solTransferAuthority: solTransferAuthority
                                ? solTransferAuthority
                                : this.wallet,
                            // underlyingAssetMint: this.voltVault.underlyingAssetMint,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            // whitelist: this?.extraVoltData?.whitelist ?? SystemProgram.programId,
                            vaultMint: this.voltVault.vaultMint,
                            depositPool: this.voltVault.depositPool,
                            writerTokenPool: this.voltVault.writerTokenPool,
                            underlyingTokenSource: underlyingTokenSource,
                            vaultTokenDestination: vaultTokenDestination,
                            roundInfo: roundInfoKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            epochInfo: epochInfoKey,
                            pendingDepositInfo: pendingDepositInfoKey,
                            pendingDepositRoundInfo: pendingDepositRoundInfoKey,
                            pendingDepositRoundVoltTokens: pendingDepositRoundVoltTokensKey,
                            pendingDepositRoundUnderlyingTokens: pendingDepositRoundUnderlyingTokensKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.depositWithClaim(normalizedDepositAmount, shouldTransferSol, {
                                accounts: depositWithClaimAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getFeeTokenAccount = function (forPerformanceFees) {
        var _a;
        if (forPerformanceFees === void 0) { forPerformanceFees = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(!(this.voltType() === constants_1.VoltType.ShortOptions &&
                            forPerformanceFees &&
                            !((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.dovPerformanceFeesInUnderlying))
                            ? this.voltVault.underlyingAssetMint
                            : this.voltVault.permissionedMarketPremiumMint, constants_1.REFERRAL_AUTHORITY)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getSoloptionsMintFeeAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(this.voltVault.underlyingAssetMint, __1.SOLOPTIONS_FEE_OWNER)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getInertiaMintFeeAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(this.voltVault.underlyingAssetMint, __1.INERTIA_FEE_OWNER)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getSoloptionsExerciseFeeAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __1.SoloptionsSDK.getGenericSoloptionsExerciseFeeAccount(this.voltVault.quoteAssetMint)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getInertiaExerciseFeeAccount = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __1.InertiaSDK.getGenericInertiaExerciseFeeAccount(this.voltVault.quoteAssetMint)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Do not provide withdrawAmount in num of vault tokens. Provide human amount.
     * you must normalize yourself
     */
    ConnectedVoltSDK.prototype.withdrawHumanAmount = function (withdrawAmount, userVaultTokens, underlyingTokenDestination, daoAuthority, normFactor, withClaim) {
        if (withClaim === void 0) { withClaim = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var estimatedTotalWithoutPendingDepositTokenAmount, roundInfo, _a, userVoltTokenBalance, _b, vaultMintSupply, humanAmount, withdrawalAmountVaultTokens, withdrawalAmountVaultTokensDec, withdrawRatio;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getTvlWithoutPendingInDepositToken(normFactor)];
                    case 1:
                        estimatedTotalWithoutPendingDepositTokenAmount = _c.sent();
                        _a = this.getRoundByKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundInfoAddress(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 2: return [4 /*yield*/, _a.apply(this, [(_c.sent())[0]])];
                    case 3:
                        roundInfo = _c.sent();
                        _b = decimal_js_1.default.bind;
                        return [4 /*yield*/, (0, friktion_utils_1.getBalanceOrZero)(this.connection, userVaultTokens)];
                    case 4:
                        userVoltTokenBalance = new (_b.apply(decimal_js_1.default, [void 0, (_c.sent()).toString()]))();
                        return [4 /*yield*/, (0, friktion_utils_1.getMintSupplyOrZero)(this.connection, this.voltVault.vaultMint)];
                    case 5:
                        vaultMintSupply = (_c.sent()).add(new decimal_js_1.default(roundInfo.voltTokensFromPendingWithdrawals.toString()));
                        humanAmount = new decimal_js_1.default(withdrawAmount.toString());
                        withdrawalAmountVaultTokens = humanAmount
                            .mul(vaultMintSupply)
                            .div(new decimal_js_1.default(estimatedTotalWithoutPendingDepositTokenAmount.toString()))
                            .toFixed(0);
                        /** If user's is withdrawing between 99.8-102%, we set withdrawal to 100.0% */
                        if (userVoltTokenBalance) {
                            withdrawalAmountVaultTokensDec = new decimal_js_1.default(withdrawalAmountVaultTokens);
                            withdrawRatio = withdrawalAmountVaultTokensDec
                                .div(userVoltTokenBalance)
                                .toNumber();
                            if (withdrawRatio > 0.998 && withdrawRatio < 1.02) {
                                withdrawalAmountVaultTokens = userVoltTokenBalance.toString();
                            }
                        }
                        if (!withClaim) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.withdrawWithClaim(new bn_js_1.default(withdrawalAmountVaultTokens), userVaultTokens, underlyingTokenDestination, daoAuthority)];
                    case 6: return [2 /*return*/, _c.sent()];
                    case 7: return [4 /*yield*/, this.withdraw(new bn_js_1.default(withdrawalAmountVaultTokens), userVaultTokens, underlyingTokenDestination, daoAuthority)];
                    case 8: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    /**
     * withdrawAmount is in vault tokens, where 1 = smallest unit of token
     * userVaultTokens: token account for volt tokens (shares). Used to redeem underlying in volt
     * underlyingTokenDestination: token account to receive redeemed underlying tokens
     * daoAuthority: special field designated for use cases that require a different tx fee & rent payer vs. underlyingTokenSource authority. If this is used
     */
    ConnectedVoltSDK.prototype.withdraw = function (withdrawAmount, userVaultTokens, underlyingTokenDestination, daoAuthority) {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _e, roundInfoKey, roundUnderlyingTokensKey, pendingWithdrawalInfoKey, epochInfoKey, extraVoltKey, withdrawAccountsStruct;
            var _f;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!daoAuthority)
                            daoAuthority = this.daoAuthority;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, daoAuthority !== undefined ? daoAuthority : this.wallet, this.sdk.programs.Volt.programId)];
                    case 1:
                        _e = _g.sent(), roundInfoKey = _e.roundInfoKey, roundUnderlyingTokensKey = _e.roundUnderlyingTokensKey, pendingWithdrawalInfoKey = _e.pendingWithdrawalInfoKey, epochInfoKey = _e.epochInfoKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_g.sent())[0];
                        _f = {
                            // tx fee + rent payer, optionally authority on underlyingTokenSource token account
                            authority: this.wallet,
                            // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
                            daoAuthority: daoAuthority !== undefined
                                ? daoAuthority
                                : ((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.isForDao)
                                    ? this.extraVoltData.daoAuthority
                                    : web3_js_1.SystemProgram.programId,
                            // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
                            authorityCheck: daoAuthority !== undefined
                                ? daoAuthority
                                : ((_b = this.extraVoltData) === null || _b === void 0 ? void 0 : _b.isForDao)
                                    ? this.extraVoltData.daoAuthority
                                    : this.wallet,
                            vaultMint: this.voltVault.vaultMint,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltKey,
                            whitelist: ((_c = this.extraVoltData) === null || _c === void 0 ? void 0 : _c.isWhitelisted) && ((_d = this.extraVoltData) === null || _d === void 0 ? void 0 : _d.whitelist)
                                ? this.extraVoltData.whitelist
                                : web3_js_1.SystemProgram.programId,
                            depositPool: this.voltVault.depositPool,
                            underlyingTokenDestination: underlyingTokenDestination,
                            vaultTokenSource: userVaultTokens,
                            roundInfo: roundInfoKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            pendingWithdrawalInfo: pendingWithdrawalInfoKey,
                            epochInfo: epochInfoKey
                        };
                        return [4 /*yield*/, this.getFeeTokenAccount()];
                    case 3:
                        withdrawAccountsStruct = (_f.feeAcct = _g.sent(),
                            _f.systemProgram = web3_js_1.SystemProgram.programId,
                            _f.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _f.rent = web3_js_1.SYSVAR_RENT_PUBKEY,
                            _f);
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.withdraw(withdrawAmount, {
                                accounts: withdrawAccountsStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.withdrawWithClaim = function (withdrawAmount, userVaultTokens, underlyingTokenDestination, daoAuthority) {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _d, roundInfoKey, roundUnderlyingTokensKey, pendingWithdrawalInfoKey, epochInfoKey, extraVoltKey, pendingWithdrawalInfo, err_2, _e, pendingWithdrawalRoundInfoKey, pendingWithdrawalRoundUnderlyingForPendingKey, withdrawWithClaimAccountsStruct;
            var _f;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!daoAuthority)
                            daoAuthority = this.daoAuthority;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, daoAuthority !== undefined ? daoAuthority : this.wallet, this.sdk.programs.Volt.programId)];
                    case 1:
                        _d = _g.sent(), roundInfoKey = _d.roundInfoKey, roundUnderlyingTokensKey = _d.roundUnderlyingTokensKey, pendingWithdrawalInfoKey = _d.pendingWithdrawalInfoKey, epochInfoKey = _d.epochInfoKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_g.sent())[0];
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getPendingWithdrawalByKey(pendingWithdrawalInfoKey)];
                    case 4:
                        pendingWithdrawalInfo = _g.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _g.sent();
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, (_a = pendingWithdrawalInfo === null || pendingWithdrawalInfo === void 0 ? void 0 : pendingWithdrawalInfo.roundNumber) !== null && _a !== void 0 ? _a : new bn_js_1.default(0), this.sdk.programs.Volt.programId)];
                    case 7:
                        _e = _g.sent(), pendingWithdrawalRoundInfoKey = _e.roundInfoKey, pendingWithdrawalRoundUnderlyingForPendingKey = _e.roundUnderlyingPendingWithdrawalsKey;
                        _f = {
                            // tx fee + rent payer, optionally authority on underlyingTokenSource token account
                            authority: this.wallet,
                            // NOTE: daoAuthority must be a signer on this instruction if it is the owner of underlyingTokenSource token account
                            daoAuthority: daoAuthority !== undefined
                                ? daoAuthority
                                : ((_b = this.extraVoltData) === null || _b === void 0 ? void 0 : _b.isForDao)
                                    ? this.extraVoltData.daoAuthority
                                    : web3_js_1.SystemProgram.programId,
                            // NOTE: this field must match the address that is the authority on underlyingTokenSource token account. It is used to generate the pending deposit PDA.
                            authorityCheck: daoAuthority !== undefined
                                ? daoAuthority
                                : ((_c = this.extraVoltData) === null || _c === void 0 ? void 0 : _c.isForDao)
                                    ? this.extraVoltData.daoAuthority
                                    : this.wallet,
                            vaultMint: this.voltVault.vaultMint,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltKey,
                            depositPool: this.voltVault.depositPool,
                            vaultTokenSource: userVaultTokens,
                            underlyingTokenDestination: underlyingTokenDestination,
                            roundInfo: roundInfoKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            epochInfo: epochInfoKey,
                            pendingWithdrawalInfo: pendingWithdrawalInfoKey,
                            pendingWithdrawalRoundInfo: pendingWithdrawalRoundInfoKey,
                            pendingWithdrawalRoundUnderlyingTokensForPws: pendingWithdrawalRoundUnderlyingForPendingKey
                        };
                        return [4 /*yield*/, this.getFeeTokenAccount()];
                    case 8:
                        withdrawWithClaimAccountsStruct = (_f.feeAcct = _g.sent(),
                            _f.systemProgram = web3_js_1.SystemProgram.programId,
                            _f.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _f.rent = web3_js_1.SYSVAR_RENT_PUBKEY,
                            _f);
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.withdrawWithClaim(withdrawAmount, {
                                accounts: withdrawWithClaimAccountsStruct,
                            })];
                }
            });
        });
    };
    /**
     * cancel pending withdrawal
     */
    ConnectedVoltSDK.prototype.cancelPendingWithdrawal = function (userVaultTokens) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var authority, _a, roundInfoKey, pendingWithdrawalInfoKey, epochInfoKey, extraVoltKey, cancelPendingWithdrawalAccountsStruct;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        authority = this.daoAuthority !== undefined ? this.daoAuthority : this.wallet;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, authority, this.sdk.programs.Volt.programId)];
                    case 1:
                        _a = _b.sent(), roundInfoKey = _a.roundInfoKey, pendingWithdrawalInfoKey = _a.pendingWithdrawalInfoKey, epochInfoKey = _a.epochInfoKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_b.sent())[0];
                        cancelPendingWithdrawalAccountsStruct = {
                            authority: authority,
                            vaultMint: this.voltVault.vaultMint,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            vaultTokenDestination: userVaultTokens,
                            roundInfo: roundInfoKey,
                            pendingWithdrawalInfo: pendingWithdrawalInfoKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.cancelPendingWithdrawal({
                                accounts: cancelPendingWithdrawalAccountsStruct,
                            })];
                }
            });
        });
    };
    /**
     * cancel pending deposit
     */
    ConnectedVoltSDK.prototype.cancelPendingDeposit = function (userUnderlyingTokens) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var authority, _a, roundInfoKey, roundUnderlyingTokensKey, pendingDepositInfoKey, epochInfoKey, extraVoltKey, cancelPendingDepositAccountsStruct;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        authority = this.daoAuthority !== undefined ? this.daoAuthority : this.wallet;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, authority, this.sdk.programs.Volt.programId)];
                    case 1:
                        _a = _b.sent(), roundInfoKey = _a.roundInfoKey, roundUnderlyingTokensKey = _a.roundUnderlyingTokensKey, pendingDepositInfoKey = _a.pendingDepositInfoKey, epochInfoKey = _a.epochInfoKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_b.sent())[0];
                        cancelPendingDepositAccountsStruct = {
                            authority: authority,
                            vaultMint: this.voltVault.vaultMint,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            underlyingTokenDestination: userUnderlyingTokens,
                            roundInfo: roundInfoKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            pendingDepositInfo: pendingDepositInfoKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.cancelPendingDeposit({
                                accounts: cancelPendingDepositAccountsStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.claimPendingWithoutSigning = function (vaultTokenDestination, replacementAuthority) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ix;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.claimPending(vaultTokenDestination, replacementAuthority)];
                    case 1:
                        ix = _a.sent();
                        if (ix.keys[0] === undefined)
                            throw new Error("eat my ass");
                        ix.keys[0].isSigner = false;
                        return [2 /*return*/, ix];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.claimPendingWithdrawalWithoutSigning = function (underlyingTokenDestinationKey, replacementAuthority) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ix;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.claimPendingWithdrawal(underlyingTokenDestinationKey, replacementAuthority)];
                    case 1:
                        ix = _a.sent();
                        if (ix.keys[0] === undefined)
                            throw new Error("eat my ass");
                        ix.keys[0].isSigner = false;
                        return [2 /*return*/, ix];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.claimPending = function (vaultTokenDestination, replacementAuthority
    // additionalSigners?: Signer[]
    ) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var authority, pendingDepositInfoKey, pendingDeposit, _a, roundInfoKey, roundVoltTokensKey, _b, _c, _d, extraVoltKey, claimPendingStruct;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        authority = replacementAuthority
                            ? replacementAuthority
                            : this.daoAuthority
                                ? this.daoAuthority
                                : this.wallet;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, authority, this.sdk.programs.Volt.programId)];
                    case 1:
                        pendingDepositInfoKey = (_e.sent()).pendingDepositInfoKey;
                        pendingDeposit = this.getPendingDepositByKey(pendingDepositInfoKey);
                        _c = (_b = VoltSDK_1.VoltSDK).findRoundAddresses;
                        _d = [this.voltKey];
                        return [4 /*yield*/, pendingDeposit];
                    case 2: return [4 /*yield*/, _c.apply(_b, _d.concat([(_e.sent()).roundNumber,
                            this.sdk.programs.Volt.programId]))];
                    case 3:
                        _a = _e.sent(), roundInfoKey = _a.roundInfoKey, roundVoltTokensKey = _a.roundVoltTokensKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 4:
                        extraVoltKey = (_e.sent())[0];
                        claimPendingStruct = {
                            authority: authority,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            pendingDepositRoundInfo: roundInfoKey,
                            pendingDepositRoundVoltTokens: roundVoltTokensKey,
                            pendingDepositInfo: pendingDepositInfoKey,
                            userVaultTokens: vaultTokenDestination,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.claimPending({
                                accounts: claimPendingStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.claimPendingWithdrawal = function (underlyingTokenDestinationKey, replacementAuthority) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var authority, pendingWithdrawalInfoKey, pendingWithdrawal, _a, roundInfoKey, roundUnderlyingPendingWithdrawalsKey, extraVoltKey, claimPendingWithdrawalStruct;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        authority = replacementAuthority
                            ? replacementAuthority
                            : this.daoAuthority
                                ? this.daoAuthority
                                : this.wallet;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findPendingWithdrawalInfoAddress(this.voltKey, authority, this.sdk.programs.Volt.programId)];
                    case 1:
                        pendingWithdrawalInfoKey = (_b.sent())[0];
                        return [4 /*yield*/, this.getPendingWithdrawalByKey(pendingWithdrawalInfoKey)];
                    case 2:
                        pendingWithdrawal = _b.sent();
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, pendingWithdrawal.roundNumber, this.sdk.programs.Volt.programId)];
                    case 3:
                        _a = _b.sent(), roundInfoKey = _a.roundInfoKey, roundUnderlyingPendingWithdrawalsKey = _a.roundUnderlyingPendingWithdrawalsKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 4:
                        extraVoltKey = (_b.sent())[0];
                        claimPendingWithdrawalStruct = {
                            authority: authority,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            vaultMint: this.voltVault.vaultMint,
                            pendingWithdrawalRoundInfo: roundInfoKey,
                            roundUnderlyingTokensForPendingWithdrawals: roundUnderlyingPendingWithdrawalsKey,
                            pendingWithdrawalInfo: pendingWithdrawalInfoKey,
                            underlyingTokenDestination: underlyingTokenDestinationKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.claimPendingWithdrawal({
                                accounts: claimPendingWithdrawalStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.turnOffDepositsAndWithdrawals = function (code) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltKey, turnOffDepositsAndWithdrawalsAccounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (code === undefined)
                            code = new bn_js_1.default(0);
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltKey = (_a.sent())[0];
                        turnOffDepositsAndWithdrawalsAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.turnOffDepositsAndWithdrawals(code, {
                                accounts: turnOffDepositsAndWithdrawalsAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.changeQuoteMint = function (newQuoteMint) {
        var changeQuoteMintAccounts = {
            authority: this.wallet,
            voltVault: this.voltKey,
            vaultAuthority: this.voltVault.vaultAuthority,
            newQuoteMint: newQuoteMint,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        };
        return this.sdk.programs.Volt.instruction.changeQuoteMint({
            accounts: changeQuoteMintAccounts,
        });
    };
    // async adjustPendingDeposit(
    //   newPdAmount: BN,
    //   targetUser: PublicKey
    // ): Promise<TransactionInstruction> {
    //   const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    //   const { roundInfoKey } = await VoltSDK.findRoundAddresses(
    //     this.voltKey,
    //     this.voltVault.roundNumber,
    //     this.sdk.programs.Volt.programId
    //   );
    //   const [pendingDepositInfoKey] = await VoltSDK.findPendingDepositInfoAddress(
    //     this.voltKey,
    //     targetUser,
    //     this.sdk.programs.Volt.programId
    //   );
    //   const adjustPendingDepositAccounts: Parameters<
    //     VoltProgram["instruction"]["adjustPendingDeposit"]["accounts"]
    //   >[0] = {
    //     authority: this.wallet,
    //     voltVault: this.voltKey,
    //     vaultAuthority: this.voltVault.vaultAuthority,
    //     targetUser: targetUser,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     extraVoltData: extraVoltKey,
    //     vaultMint: this.voltVault.vaultMint,
    //     roundInfo: roundInfoKey,
    //     pendingDepositInfo: pendingDepositInfoKey,
    //     rent: SYSVAR_RENT_PUBKEY,
    //   };
    //   return this.sdk.programs.Volt.instruction.adjustPendingDeposit(
    //     newPdAmount,
    //     {
    //       accounts: adjustPendingDepositAccounts,
    //     }
    //   );
    // }
    ConnectedVoltSDK.prototype.bypassSettlement = function (userWriterTokenAccount) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, _a, roundInfoKey, epochInfoKey, bypassSettlementAccounts;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1:
                        optionMarket = _b.sent();
                        if (optionMarket === null)
                            throw new Error("option market on volt vault does not exist");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 2:
                        _a = _b.sent(), roundInfoKey = _a.roundInfoKey, epochInfoKey = _a.epochInfoKey;
                        bypassSettlementAccounts = {
                            authority: this.wallet,
                            soloptionsProgram: __1.OPTIONS_PROGRAM_IDS.Soloptions,
                            inertiaProgram: __1.OPTIONS_PROGRAM_IDS.Inertia,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            vaultMint: this.voltVault.vaultMint,
                            depositPool: this.voltVault.depositPool,
                            premiumPool: this.voltVault.premiumPool,
                            writerTokenPool: this.voltVault.writerTokenPool,
                            permissionedMarketPremiumPool: this.voltVault.permissionedMarketPremiumPool,
                            rawDerivsContract: this.voltVault.optionMarket,
                            writerTokenMint: this.voltVault.writerTokenMint,
                            userWriterTokenAccount: userWriterTokenAccount,
                            quoteAssetPool: optionMarket.quoteAssetPool,
                            underlyingAssetPool: optionMarket.underlyingAssetPool,
                            roundInfo: roundInfoKey,
                            epochInfo: epochInfoKey,
                            feeOwner: __1.INERTIA_FEE_OWNER,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.bypassSettlement({
                                accounts: bypassSettlementAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.changeDecimalsByFactor = function (factor) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltKey, epochInfoKey, changeDecimalsByFactorAccounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltKey = (_a.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber.subn(1), this.sdk.programs.Volt.programId)];
                    case 2:
                        epochInfoKey = (_a.sent()).epochInfoKey;
                        changeDecimalsByFactorAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            extraVoltData: extraVoltKey,
                            epochInfo: epochInfoKey,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.changeDecimalsByFactor(factor, {
                                accounts: changeDecimalsByFactorAccounts,
                            })];
                }
            });
        });
    };
    // async reduceDecimalsByFactor(factor: BN): Promise<TransactionInstruction> {
    //   const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    //   const { roundInfoKey, epochInfoKey } = await VoltSDK.findRoundAddresses(
    //     this.voltKey,
    //     this.voltVault.roundNumber,
    //     this.sdk.programs.Volt.programId
    //   );
    //   const reduceDecimalsByFactorAccounts: Parameters<
    //     VoltProgram["instruction"]["reduceDecimalsByFactor"]["accounts"]
    //   >[0] = {
    //     authority: this.wallet,
    //     voltVault: this.voltKey,
    //     vaultAuthority: this.voltVault.vaultAuthority,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     extraVoltData: extraVoltKey,
    //     roundInfo: roundInfoKey,
    //     epochInfo: epochInfoKey,
    //   };
    //   return this.sdk.programs.Volt.instruction.reduceDecimalsByFactor(factor, {
    //     accounts: reduceDecimalsByFactorAccounts,
    //   });
    // }
    ConnectedVoltSDK.prototype.changeCapacity = function (capacity, individualCapacity) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var roundInfo, changeCapacityAccounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundInfoAddress(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        roundInfo = (_a.sent())[0];
                        changeCapacityAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            roundInfo: roundInfo,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.changeCapacity(capacity, individualCapacity, {
                                accounts: changeCapacityAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.changeFees = function (performanceFeeBps, withdrawalFeeBps, dovTakeFeesInUnderlying, useCustomFees) {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltKey, changeFeesAccounts;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!(dovTakeFeesInUnderlying === undefined || useCustomFees === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadInExtraVoltData()];
                    case 1:
                        _e.sent();
                        if (dovTakeFeesInUnderlying === undefined)
                            dovTakeFeesInUnderlying =
                                (_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.dovPerformanceFeesInUnderlying;
                        if (useCustomFees === undefined)
                            useCustomFees =
                                ((_d = (_c = (_b = this.extraVoltData) === null || _b === void 0 ? void 0 : _b.useCustomFees) === null || _c === void 0 ? void 0 : _c.toNumber()) !== null && _d !== void 0 ? _d : 0) > 0;
                        _e.label = 2;
                    case 2: return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, this.wallet, this.sdk.programs.Volt.programId)];
                    case 3:
                        extraVoltKey = (_e.sent()).extraVoltKey;
                        changeFeesAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.changeFees(performanceFeeBps, withdrawalFeeBps, dovTakeFeesInUnderlying, useCustomFees, {
                                accounts: changeFeesAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.changeAdmin = function (newAdmin) {
        var changeAdminAccounts = {
            authority: this.wallet,
            voltVault: this.voltKey,
            vaultAuthority: this.voltVault.vaultAuthority,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        };
        return this.sdk.programs.Volt.instruction.changeAdmin(newAdmin, {
            accounts: changeAdminAccounts,
        });
    };
    ConnectedVoltSDK.prototype.changeAuctionParams = function (permissionlessAuctions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var auctionMetadataKey, extraVoltDataKey, changeAuctionParamsAccounts, param;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findAuctionMetadataAddress(this.voltKey)];
                    case 1:
                        auctionMetadataKey = (_a.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltDataKey = (_a.sent())[0];
                        changeAuctionParamsAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltDataKey,
                            auctionMetadata: auctionMetadataKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        param = permissionlessAuctions ? new bn_js_1.default(1) : new bn_js_1.default(0);
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.changeAuctionParams(param, {
                                accounts: changeAuctionParamsAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.startRound = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, roundInfoKey, roundUnderlyingTokensKey, roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey, epochInfoKey, extraVoltKey, startRoundStruct;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber.addn(1), this.sdk.programs.Volt.programId)];
                    case 1:
                        _a = _b.sent(), roundInfoKey = _a.roundInfoKey, roundUnderlyingTokensKey = _a.roundUnderlyingTokensKey, roundVoltTokensKey = _a.roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey = _a.roundUnderlyingPendingWithdrawalsKey, epochInfoKey = _a.epochInfoKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_b.sent())[0];
                        startRoundStruct = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            depositPool: this.voltVault.depositPool,
                            underlyingAssetMint: this.voltVault.underlyingAssetMint,
                            vaultMint: this.voltVault.vaultMint,
                            roundInfo: roundInfoKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            roundVoltTokens: roundVoltTokensKey,
                            roundUnderlyingTokensForPendingWithdrawals: roundUnderlyingPendingWithdrawalsKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.startRound({
                                accounts: startRoundStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.startRoundEntropy = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, roundInfoKey, roundUnderlyingTokensKey, roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey, epochInfoKey, entropyRoundInfoKey, extraVoltKey, startRoundEntropyStruct;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.extraVoltData)
                            throw new Error("extra volt data must be set");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber.addn(1), this.sdk.programs.Volt.programId)];
                    case 1:
                        _a = _b.sent(), roundInfoKey = _a.roundInfoKey, roundUnderlyingTokensKey = _a.roundUnderlyingTokensKey, roundVoltTokensKey = _a.roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey = _a.roundUnderlyingPendingWithdrawalsKey, epochInfoKey = _a.epochInfoKey, entropyRoundInfoKey = _a.entropyRoundInfoKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_b.sent())[0];
                        startRoundEntropyStruct = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            depositPool: this.voltVault.depositPool,
                            underlyingAssetMint: this.voltVault.underlyingAssetMint,
                            vaultMint: this.voltVault.vaultMint,
                            entropyProgram: this.extraVoltData.entropyProgramId,
                            entropyGroup: this.extraVoltData.entropyGroup,
                            entropyAccount: this.extraVoltData.entropyAccount,
                            entropyCache: this.extraVoltData.entropyCache,
                            entropyRound: entropyRoundInfoKey,
                            roundInfo: roundInfoKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            roundVoltTokens: roundVoltTokensKey,
                            roundUnderlyingTokensForPendingWithdrawals: roundUnderlyingPendingWithdrawalsKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.startRoundEntropy({
                                accounts: startRoundEntropyStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.takePerformanceFeesEntropy = function () {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, epochInfoKey, entropyRoundInfoKey, roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey, extraVoltKey, entropyMetadataKey, client, entropyGroup, banks, rootBank, nodeBank, entropySpotOpenOrders, takePerformanceFeesEntropyAccounts;
            var _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.extraVoltData)
                            throw new Error("extra volt data must be set");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        _b = _d.sent(), epochInfoKey = _b.epochInfoKey, entropyRoundInfoKey = _b.entropyRoundInfoKey, roundVoltTokensKey = _b.roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey = _b.roundUnderlyingPendingWithdrawalsKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_d.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyMetadataAddress(this.voltKey)];
                    case 3:
                        entropyMetadataKey = (_d.sent())[0];
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, client.getEntropyGroup(this.extraVoltData.entropyGroup)];
                    case 4:
                        entropyGroup = _d.sent();
                        return [4 /*yield*/, entropyGroup.loadRootBanks(this.connection)];
                    case 5:
                        banks = _d.sent();
                        rootBank = banks[entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)];
                        return [4 /*yield*/, (rootBank === null || rootBank === void 0 ? void 0 : rootBank.loadNodeBanks(this.connection))];
                    case 6:
                        nodeBank = (_a = (_d.sent())) === null || _a === void 0 ? void 0 : _a[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyOpenOrdersAddress(this.voltKey, this.extraVoltData.hedgingSpotMarket)];
                    case 7:
                        entropySpotOpenOrders = (_d.sent())[0];
                        _c = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            entropyProgram: this.extraVoltData.entropyProgramId,
                            entropyGroup: this.extraVoltData.entropyGroup,
                            entropyAccount: this.extraVoltData.entropyAccount,
                            entropyCache: this.extraVoltData.entropyCache,
                            entropyRound: entropyRoundInfoKey,
                            vaultMint: this.voltVault.vaultMint,
                            roundVoltTokens: roundVoltTokensKey,
                            roundUnderlyingTokensForPendingWithdrawals: roundUnderlyingPendingWithdrawalsKey,
                            epochInfo: epochInfoKey,
                            entropyMetadata: entropyMetadataKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            openOrders: entropySpotOpenOrders,
                            rootBank: rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey,
                            nodeBank: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey,
                            vault: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.vault,
                            signer: entropyGroup.signerKey,
                            dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID
                        };
                        return [4 /*yield*/, this.getFeeTokenAccount()];
                    case 8:
                        takePerformanceFeesEntropyAccounts = (_c.feeAccount = _d.sent(),
                            _c);
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.takePerformanceFeesEntropy({
                                accounts: takePerformanceFeesEntropyAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.endRound = function (bypassCode) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, roundInfoKey, roundUnderlyingTokensKey, roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey, epochInfoKey, extraVoltKey, _b, entropyLendingProgramKey, entropyLendingGroupKey, entropyLendingAccountKey, endRoundStruct;
            var _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (bypassCode === undefined)
                            bypassCode = new bn_js_1.default(0);
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, this.wallet, this.sdk.programs.Volt.programId)];
                    case 1:
                        _a = _d.sent(), roundInfoKey = _a.roundInfoKey, roundUnderlyingTokensKey = _a.roundUnderlyingTokensKey, roundVoltTokensKey = _a.roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey = _a.roundUnderlyingPendingWithdrawalsKey, epochInfoKey = _a.epochInfoKey, extraVoltKey = _a.extraVoltKey;
                        return [4 /*yield*/, this.getEntropyLendingKeys()];
                    case 2:
                        _b = _d.sent(), entropyLendingProgramKey = _b.entropyLendingProgramKey, entropyLendingGroupKey = _b.entropyLendingGroupKey, entropyLendingAccountKey = _b.entropyLendingAccountKey;
                        _c = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltKey,
                            vaultMint: this.voltVault.vaultMint,
                            depositPool: this.voltVault.depositPool,
                            roundInfo: roundInfoKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            roundVoltTokens: roundVoltTokensKey,
                            roundUnderlyingTokensForPendingWithdrawals: roundUnderlyingPendingWithdrawalsKey,
                            epochInfo: epochInfoKey
                        };
                        return [4 /*yield*/, this.getFeeTokenAccount()];
                    case 3:
                        endRoundStruct = (_c.feeAcct = _d.sent(),
                            _c.entropyLendingProgram = entropyLendingProgramKey,
                            _c.entropyLendingGroup = entropyLendingGroupKey,
                            _c.entropyLendingAccount = entropyLendingAccountKey,
                            _c.systemProgram = web3_js_1.SystemProgram.programId,
                            _c.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _c.clock = web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            _c.rent = web3_js_1.SYSVAR_RENT_PUBKEY,
                            _c.premiumPool = this.voltVault.premiumPool,
                            _c.permissionedMarketPremiumPool = this.voltVault.permissionedMarketPremiumPool,
                            _c);
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.endRound(bypassCode, {
                                accounts: endRoundStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.takePendingWithdrawalFees = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, roundUnderlyingPendingWithdrawalsKey, epochInfoKey, takePendingWithdrawalFeesStruct;
            var _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findUsefulAddresses(this.voltKey, this.voltVault, this.wallet, this.sdk.programs.Volt.programId)];
                    case 1:
                        _a = _c.sent(), roundUnderlyingPendingWithdrawalsKey = _a.roundUnderlyingPendingWithdrawalsKey, epochInfoKey = _a.epochInfoKey;
                        _b = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            roundUnderlyingTokensForPendingWithdrawals: roundUnderlyingPendingWithdrawalsKey,
                            epochInfo: epochInfoKey
                        };
                        return [4 /*yield*/, this.getFeeTokenAccount()];
                    case 2:
                        takePendingWithdrawalFeesStruct = (_b.feeAcct = _c.sent(),
                            _b.systemProgram = web3_js_1.SystemProgram.programId,
                            _b.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _b);
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.takePendingWithdrawalFees({
                                accounts: takePendingWithdrawalFeesStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.setNextOption = function (newOptionMarketKey, optionsProtocol) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, marketAuthorityBump, optionSerumMarketKey, openOrdersBump, _a, roundInfoKey, epochInfoKey, _b, optionPoolKey, writerTokenPoolKey, setNextOptionStruct;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(newOptionMarketKey, optionsProtocol)];
                    case 1:
                        optionMarket = _c.sent();
                        return [4 /*yield*/, this.getMarketAndAuthorityInfo(newOptionMarketKey)];
                    case 2:
                        marketAuthorityBump = (_c.sent()).marketAuthorityBump;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findSerumMarketAddress(this.voltKey, this.sdk.net.MM_TOKEN_MINT, optionMarket.key)];
                    case 3:
                        optionSerumMarketKey = (_c.sent())[0];
                        return [4 /*yield*/, this.findVaultAuthorityPermissionedOpenOrdersKey(optionSerumMarketKey)];
                    case 4:
                        openOrdersBump = (_c.sent()).openOrdersBump;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 5:
                        _a = _c.sent(), roundInfoKey = _a.roundInfoKey, epochInfoKey = _a.epochInfoKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findSetNextOptionAddresses(this.voltKey, optionMarket.optionMint, optionMarket.writerTokenMint, this.sdk.programs.Volt.programId)];
                    case 6:
                        _b = _c.sent(), optionPoolKey = _b.optionPoolKey, writerTokenPoolKey = _b.writerTokenPoolKey;
                        setNextOptionStruct = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            vaultMint: this.voltVault.vaultMint,
                            depositPool: this.voltVault.depositPool,
                            optionPool: optionPoolKey,
                            writerTokenPool: writerTokenPoolKey,
                            rawDerivsContract: newOptionMarketKey,
                            underlyingAssetMint: this.voltVault.underlyingAssetMint,
                            optionMint: optionMarket.optionMint,
                            writerTokenMint: optionMarket.writerTokenMint,
                            roundInfo: roundInfoKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.setNextOption(openOrdersBump, marketAuthorityBump, {
                                accounts: setNextOptionStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.resetOptionMarket = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, _a, backupOptionPoolKey, backupWriterTokenPoolKey, resetOptionMarketAccounts;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1:
                        optionMarket = _b.sent();
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findBackupPoolAddresses(this.voltKey, this.voltVault)];
                    case 2:
                        _a = _b.sent(), backupOptionPoolKey = _a.backupOptionPoolKey, backupWriterTokenPoolKey = _a.backupWriterTokenPoolKey;
                        resetOptionMarketAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            inertiaProgram: __1.OPTIONS_PROGRAM_IDS.Inertia,
                            depositPool: this.voltVault.depositPool,
                            optionPool: this.voltVault.optionPool,
                            writerTokenPool: this.voltVault.writerTokenPool,
                            rawDerivsContract: this.voltVault.optionMarket,
                            optionMint: optionMarket.optionMint,
                            writerTokenMint: optionMarket.writerTokenMint,
                            backupOptionPool: backupOptionPoolKey,
                            backupWriterTokenPool: backupWriterTokenPoolKey,
                            underlyingAssetPool: optionMarket.underlyingAssetPool,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.resetOptionMarket({
                                accounts: resetOptionMarketAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.rebalancePrepare = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, optionsProtocol, feeDestinationKey, remainingAccounts, epochInfoKey, rebalancePrepareStruct;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1:
                        optionMarket = _a.sent();
                        return [4 /*yield*/, this.getOptionsProtocolForKey(this.voltVault.optionMarket)];
                    case 2:
                        optionsProtocol = _a.sent();
                        remainingAccounts = [];
                        if (!(optionsProtocol === "Inertia")) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(this.voltVault.underlyingAssetMint, __1.INERTIA_FEE_OWNER)];
                    case 3:
                        feeDestinationKey = _a.sent();
                        return [3 /*break*/, 9];
                    case 4:
                        if (!(optionsProtocol === "Soloptions")) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(this.voltVault.underlyingAssetMint, __1.SOLOPTIONS_FEE_OWNER)];
                    case 5:
                        feeDestinationKey = _a.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        if (!(optionsProtocol === "Spreads")) return [3 /*break*/, 8];
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(this.voltVault.underlyingAssetMint, constants_1.SPREADS_FEE_OWNER)];
                    case 7:
                        feeDestinationKey = _a.sent();
                        return [3 /*break*/, 9];
                    case 8: throw new Error("Unsupported options protocol");
                    case 9: return [4 /*yield*/, VoltSDK_1.VoltSDK.findEpochInfoAddress(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 10:
                        epochInfoKey = (_a.sent())[0];
                        rebalancePrepareStruct = {
                            authority: this.wallet,
                            inertiaProgram: __1.OPTIONS_PROGRAM_IDS.Inertia,
                            soloptionsProgram: __1.OPTIONS_PROGRAM_IDS.Soloptions,
                            spreadsProgram: __1.OPTIONS_PROGRAM_IDS.Spreads,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            depositPool: this.voltVault.depositPool,
                            optionPool: this.voltVault.optionPool,
                            writerTokenPool: this.voltVault.writerTokenPool,
                            rawDerivsContract: this.voltVault.optionMarket,
                            underlyingAssetMint: this.voltVault.underlyingAssetMint,
                            quoteAssetMint: this.voltVault.quoteAssetMint,
                            optionMint: this.voltVault.optionMint,
                            writerTokenMint: this.voltVault.writerTokenMint,
                            underlyingAssetPool: optionMarket.underlyingAssetPool,
                            optionProtocolFeeDestination: feeDestinationKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.rebalancePrepare({
                                accounts: rebalancePrepareStruct,
                                remainingAccounts: remainingAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getPermissionedMarketReferrerPremiumAcct = function () {
        var referrerPremiumMintAcct = this.sdk.net.SERUM_REFERRER_IDS[this.voltVault.permissionedMarketPremiumMint.toString()];
        if (!referrerPremiumMintAcct) {
            throw new Error("No referrer acct found for mint: " +
                this.voltVault.permissionedMarketPremiumMint.toString());
        }
        return referrerPremiumMintAcct;
    };
    ConnectedVoltSDK.prototype.getReferrerQuoteAcct = function (mint) {
        var referrerQuoteAcct = this.sdk.net.SERUM_REFERRER_IDS[mint.toString()];
        if (!referrerQuoteAcct) {
            throw new Error("No referrer acct found for mint: " +
                this.voltVault.quoteAssetMint.toString());
        }
        return referrerQuoteAcct;
    };
    ConnectedVoltSDK.prototype.rebalanceEnter = function (clientPrice, clientSize, referrerQuoteAcctReplacement, referralSRMAcctReplacement) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, whitelistTokenAccountKey, _a, marketAuthority, marketAuthorityBump, optionSerumMarketKey, extraVoltKey, optionSerumMarketProxy, optionSerumMarket, vaultOwner /*, nonce*/, _b, openOrdersKey, openOrdersBump, referrerQuoteAcct, srmReferralAcct, epochInfoKey, auctionMetadataKey, rebalanceEnterStruct;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1:
                        optionMarket = _c.sent();
                        if (optionMarket === null)
                            throw new Error("options contract on volt vault does not exist");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findWhitelistTokenAccountAddress(this.voltKey, this.sdk.net.MM_TOKEN_MINT, this.sdk.programs.Volt.programId)];
                    case 2:
                        whitelistTokenAccountKey = (_c.sent())[0];
                        return [4 /*yield*/, this.getCurrentMarketAndAuthorityInfo()];
                    case 3:
                        _a = _c.sent(), marketAuthority = _a.marketAuthority, marketAuthorityBump = _a.marketAuthorityBump;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findSerumMarketAddress(this.voltKey, this.sdk.net.MM_TOKEN_MINT, optionMarket.key)];
                    case 4:
                        optionSerumMarketKey = (_c.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 5:
                        extraVoltKey = (_c.sent())[0];
                        return [4 /*yield*/, (0, serum_2.marketLoader)(this, optionSerumMarketKey, whitelistTokenAccountKey)];
                    case 6:
                        optionSerumMarketProxy = _c.sent();
                        optionSerumMarket = optionSerumMarketProxy.market;
                        return [4 /*yield*/, (0, serum_2.getVaultOwnerAndNonce)(optionSerumMarketProxy.market.address, optionSerumMarketProxy.dexProgramId)];
                    case 7:
                        vaultOwner = (_c.sent())[0];
                        return [4 /*yield*/, this.findVaultAuthorityPermissionedOpenOrdersKey(optionSerumMarketKey)];
                    case 8:
                        _b = _c.sent(), openOrdersKey = _b.openOrdersKey, openOrdersBump = _b.openOrdersBump;
                        referrerQuoteAcct = referrerQuoteAcctReplacement ||
                            this.getPermissionedMarketReferrerPremiumAcct();
                        srmReferralAcct = referralSRMAcctReplacement || this.sdk.net.REFERRAL_SRM_OR_MSRM_ACCOUNT;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEpochInfoAddress(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 9:
                        epochInfoKey = (_c.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findAuctionMetadataAddress(this.voltKey)];
                    case 10:
                        auctionMetadataKey = (_c.sent())[0];
                        rebalanceEnterStruct = {
                            authority: this.wallet,
                            middlewareProgram: this.sdk.programs.Volt.programId,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltKey,
                            auctionMetadata: auctionMetadataKey,
                            optionPool: this.voltVault.optionPool,
                            rawDerivsContract: this.voltVault.optionMarket,
                            srmReferralAcct: srmReferralAcct,
                            pcReferrerWallet: referrerQuoteAcct,
                            serumVaultSigner: vaultOwner,
                            dexProgram: optionSerumMarketProxy.dexProgramId,
                            openOrders: openOrdersKey,
                            market: optionSerumMarketProxy.market.address,
                            serumMarketAuthority: marketAuthority,
                            whitelistTokenAccount: whitelistTokenAccountKey,
                            epochInfo: epochInfoKey,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            requestQueue: optionSerumMarket._decoded.requestQueue,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            eventQueue: optionSerumMarket._decoded.eventQueue,
                            marketBids: optionSerumMarket.bidsAddress,
                            marketAsks: optionSerumMarket.asksAddress,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            coinVault: optionSerumMarket._decoded.baseVault,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            pcVault: optionSerumMarket._decoded.quoteVault,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.rebalanceEnter(clientPrice, clientSize, openOrdersBump, marketAuthorityBump, {
                                accounts: rebalanceEnterStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.initSerumMarket = function (pcMint) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var middlewareProgram, _a, serumMarketKey, marketAuthority, marketAuthorityBump, _b, createFirstAccountsInstructions, signers, bids, asks, eventQueue, auctionMetadataKey, textEncoder, _c, requestQueue, _requestQueueBump, _d, coinVault, _coinVaultBump, _e, pcVault, _pcVaultBump, _f, vaultOwner, vaultSignerNonce, initSerumAccounts, coinLotSize, pcLotSize, pcDustThreshold, instructions;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this.extraVoltData)
                            throw new Error("extraVoltData must be defined");
                        middlewareProgram = this.sdk.programs.Volt;
                        return [4 /*yield*/, this.getCurrentMarketAndAuthorityInfo()];
                    case 1:
                        _a = _g.sent(), serumMarketKey = _a.serumMarketKey, marketAuthority = _a.marketAuthority, marketAuthorityBump = _a.marketAuthorityBump;
                        return [4 /*yield*/, (0, serum_2.createFirstSetOfAccounts)({
                                connection: middlewareProgram.provider.connection,
                                userKey: this.wallet,
                                dexProgramId: this.sdk.net.SERUM_DEX_PROGRAM_ID,
                            })];
                    case 2:
                        _b = _g.sent(), createFirstAccountsInstructions = _b.instructions, signers = _b.signers, bids = _b.bids, asks = _b.asks, eventQueue = _b.eventQueue;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findAuctionMetadataAddress(this.voltKey)];
                    case 3:
                        auctionMetadataKey = (_g.sent())[0];
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                this.sdk.net.MM_TOKEN_MINT.toBuffer(),
                                this.voltVault.optionMarket.toBuffer(),
                                auctionMetadataKey.toBuffer(),
                                textEncoder.encode("requestQueue"),
                            ], middlewareProgram.programId)];
                    case 4:
                        _c = _g.sent(), requestQueue = _c[0], _requestQueueBump = _c[1];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                this.sdk.net.MM_TOKEN_MINT.toBuffer(),
                                this.voltVault.optionMarket.toBuffer(),
                                auctionMetadataKey.toBuffer(),
                                textEncoder.encode("coinVault"),
                            ], middlewareProgram.programId)];
                    case 5:
                        _d = _g.sent(), coinVault = _d[0], _coinVaultBump = _d[1];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                this.sdk.net.MM_TOKEN_MINT.toBuffer(),
                                this.voltVault.optionMarket.toBuffer(),
                                auctionMetadataKey.toBuffer(),
                                textEncoder.encode("pcVault"),
                            ], middlewareProgram.programId)];
                    case 6:
                        _e = _g.sent(), pcVault = _e[0], _pcVaultBump = _e[1];
                        return [4 /*yield*/, (0, serum_2.getVaultOwnerAndNonce)(serumMarketKey, this.sdk.net.SERUM_DEX_PROGRAM_ID)];
                    case 7:
                        _f = _g.sent(), vaultOwner = _f[0], vaultSignerNonce = _f[1];
                        initSerumAccounts = {
                            authority: this.wallet,
                            whitelist: this.sdk.net.MM_TOKEN_MINT,
                            serumMarket: serumMarketKey,
                            voltVault: this.voltKey,
                            auctionMetadata: auctionMetadataKey,
                            dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,
                            pcMint: pcMint,
                            optionMint: this.voltVault.optionMint,
                            requestQueue: requestQueue,
                            eventQueue: eventQueue.publicKey,
                            bids: bids.publicKey,
                            asks: asks.publicKey,
                            coinVault: coinVault,
                            pcVault: pcVault,
                            vaultSigner: vaultOwner,
                            marketAuthority: marketAuthority,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        };
                        coinLotSize = new bn_js_1.default(1);
                        pcLotSize = new bn_js_1.default(1);
                        pcDustThreshold = new bn_js_1.default(1);
                        instructions = createFirstAccountsInstructions.concat([
                            middlewareProgram.instruction.initSerumMarket(
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                            new bn_js_1.default(serum_1.MARKET_STATE_LAYOUT_V3.span), vaultSignerNonce, coinLotSize, pcLotSize, pcDustThreshold, {
                                accounts: initSerumAccounts,
                            }),
                        ]);
                        return [2 /*return*/, {
                                serumMarketKey: serumMarketKey,
                                vaultOwner: vaultOwner,
                                marketAuthority: marketAuthority,
                                marketAuthorityBump: marketAuthorityBump,
                                instructions: instructions,
                                signers: signers,
                            }];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.rebalanceSettle = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, _a, roundInfoKey, epochInfoKey, rebalanceSettleStruct;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1:
                        optionMarket = _b.sent();
                        if (optionMarket === null)
                            throw new Error("option market on volt vault does not exist");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 2:
                        _a = _b.sent(), roundInfoKey = _a.roundInfoKey, epochInfoKey = _a.epochInfoKey;
                        rebalanceSettleStruct = {
                            authority: this.wallet,
                            soloptionsProgram: __1.OPTIONS_PROGRAM_IDS.Soloptions,
                            inertiaProgram: __1.OPTIONS_PROGRAM_IDS.Inertia,
                            spreadsProgram: __1.OPTIONS_PROGRAM_IDS.Spreads,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            vaultMint: this.voltVault.vaultMint,
                            depositPool: this.voltVault.depositPool,
                            premiumPool: this.voltVault.premiumPool,
                            writerTokenPool: this.voltVault.writerTokenPool,
                            permissionedMarketPremiumPool: this.voltVault.permissionedMarketPremiumPool,
                            rawDerivsContract: this.voltVault.optionMarket,
                            writerTokenMint: this.voltVault.writerTokenMint,
                            underlyingAssetMint: this.voltVault.underlyingAssetMint,
                            quoteAssetMint: this.voltVault.quoteAssetMint,
                            quoteAssetPool: optionMarket.quoteAssetPool,
                            underlyingAssetPool: optionMarket.underlyingAssetPool,
                            roundInfo: roundInfoKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.rebalanceSettle({
                                accounts: rebalanceSettleStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.rebalanceSwapPremium = function (spotSerumMarketKey, clientPrice, clientSize, usePermissionedMarketPremium, referrerQuoteAcctReplacement, referralSRMAcctReplacement) {
        if (usePermissionedMarketPremium === void 0) { usePermissionedMarketPremium = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, _a, ulOpenOrdersKey, ulOpenOrdersBump, ulOpenOrdersMetadataKey, spotSerumMarket, ask, askSize, err_3, vaultOwner, _b, roundInfoKey, epochInfoKey, referrerQuoteAcct, srmReferralAcct, rebalanceSwapPremiumStruct;
            var _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1:
                        optionMarket = _d.sent();
                        if (optionMarket === null)
                            throw new Error("option market on volt vault does not exist");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUnderlyingOpenOrdersAddress(this.voltKey, spotSerumMarketKey, this.sdk.programs.Volt.programId)];
                    case 2:
                        _a = _d.sent(), ulOpenOrdersKey = _a[0], ulOpenOrdersBump = _a[1];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUnderlyingOpenOrdersMetadataAddress(this.voltKey, spotSerumMarketKey, this.sdk.programs.Volt.programId)];
                    case 3:
                        ulOpenOrdersMetadataKey = (_d.sent())[0];
                        return [4 /*yield*/, serum_1.Market.load(this.connection, spotSerumMarketKey, {}, this.sdk.net.SERUM_DEX_PROGRAM_ID)];
                    case 4:
                        spotSerumMarket = _d.sent();
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.getBidAskLimitsForSpot(spotSerumMarket, undefined, clientPrice)];
                    case 6:
                        (_c = _d.sent(), ask = _c.ask, askSize = _c.askSize);
                        return [3 /*break*/, 8];
                    case 7:
                        err_3 = _d.sent();
                        ask = new bn_js_1.default(0);
                        askSize = new bn_js_1.default(0);
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, (0, serum_2.getVaultOwnerAndNonce)(spotSerumMarket.address, spotSerumMarket.programId)];
                    case 9:
                        vaultOwner = (_d.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 10:
                        _b = _d.sent(), roundInfoKey = _b.roundInfoKey, epochInfoKey = _b.epochInfoKey;
                        referrerQuoteAcct = referrerQuoteAcctReplacement ||
                            this.getReferrerQuoteAcct(spotSerumMarket.quoteMintAddress);
                        srmReferralAcct = referralSRMAcctReplacement || this.sdk.net.REFERRAL_SRM_OR_MSRM_ACCOUNT;
                        rebalanceSwapPremiumStruct = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            vaultMint: this.voltVault.vaultMint,
                            depositPool: this.voltVault.depositPool,
                            tradingPool: !usePermissionedMarketPremium
                                ? this.voltVault.premiumPool
                                : this.voltVault.permissionedMarketPremiumPool,
                            srmReferralAcct: srmReferralAcct,
                            pcReferrerWallet: referrerQuoteAcct,
                            serumVaultSigner: vaultOwner,
                            dexProgram: spotSerumMarket.programId,
                            openOrders: ulOpenOrdersKey,
                            openOrdersMetadata: ulOpenOrdersMetadataKey,
                            market: spotSerumMarket.address,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            requestQueue: spotSerumMarket._decoded.requestQueue,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            eventQueue: spotSerumMarket._decoded.eventQueue,
                            marketBids: spotSerumMarket.bidsAddress,
                            marketAsks: spotSerumMarket.asksAddress,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            coinVault: spotSerumMarket._decoded.baseVault,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            pcVault: spotSerumMarket._decoded.quoteVault,
                            roundInfo: roundInfoKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.rebalanceSwapPremium(ask, askSize, ulOpenOrdersBump, {
                                accounts: rebalanceSwapPremiumStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.attachWhitelist = function (whitelistKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltKey, attachWhitelistAccounts, instruction;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltKey = (_a.sent())[0];
                        attachWhitelistAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            whitelist: whitelistKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        };
                        instruction = this.sdk.programs.Volt.instruction.attachWhitelist({
                            accounts: attachWhitelistAccounts,
                        });
                        return [2 /*return*/, instruction];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.attachDao = function (daoProgramId, daoAuthority) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltKey, attachDaoAccounts, instruction;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltKey = (_a.sent())[0];
                        attachDaoAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            daoProgram: daoProgramId,
                            daoAuthority: daoAuthority,
                        };
                        instruction = this.sdk.programs.Volt.instruction.attachDao({
                            accounts: attachDaoAccounts,
                        });
                        return [2 /*return*/, instruction];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.detachDao = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltKey, detachDaoAccounts, instruction;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltKey = (_a.sent())[0];
                        detachDaoAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                        };
                        instruction = this.sdk.programs.Volt.instruction.detachDao({
                            accounts: detachDaoAccounts,
                        });
                        return [2 /*return*/, instruction];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.settlePermissionedMarketPremiumFunds = function () {
        var settlePermissionedMarketPremiumFundsStruct = {
            authority: this.wallet,
            voltVault: this.voltKey,
            vaultAuthority: this.voltVault.vaultAuthority,
            depositPool: this.voltVault.depositPool,
            premiumPool: this.voltVault.premiumPool,
            permissionedMarketPremiumPool: this.voltVault.permissionedMarketPremiumPool,
            rawDerivsContract: this.voltVault.optionMarket,
            writerTokenMint: this.voltVault.writerTokenMint,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        };
        return this.sdk.programs.Volt.instruction.settlePermissionedMarketPremiumFunds({
            accounts: settlePermissionedMarketPremiumFundsStruct,
        });
    };
    ConnectedVoltSDK.prototype.settleEnterFunds = function (referrerQuoteAcctReplacement) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, whitelistTokenAccountKey, marketAuthority, optionSerumMarketKey, optionSerumMarketProxy, optionSerumMarket, openOrdersKey, vaultOwner, _a, roundInfoKey, epochInfoKey, referrerQuoteAcct, extraVoltDataKey, settleEnterFundsStruct;
            var _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1:
                        optionMarket = _c.sent();
                        if (optionMarket === null)
                            throw new Error("option market on volt vault does not exist");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findWhitelistTokenAccountAddress(this.voltKey, this.sdk.net.MM_TOKEN_MINT, this.sdk.programs.Volt.programId)];
                    case 2:
                        whitelistTokenAccountKey = (_c.sent())[0];
                        return [4 /*yield*/, this.getCurrentMarketAndAuthorityInfo()];
                    case 3:
                        marketAuthority = (_c.sent()).marketAuthority;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findSerumMarketAddress(this.voltKey, this.sdk.net.MM_TOKEN_MINT, optionMarket.key)];
                    case 4:
                        optionSerumMarketKey = (_c.sent())[0];
                        return [4 /*yield*/, (0, serum_2.marketLoader)(this, optionSerumMarketKey, whitelistTokenAccountKey)];
                    case 5:
                        optionSerumMarketProxy = _c.sent();
                        optionSerumMarket = optionSerumMarketProxy.market;
                        return [4 /*yield*/, this.findVaultAuthorityPermissionedOpenOrdersKey(optionSerumMarketKey)];
                    case 6:
                        openOrdersKey = (_c.sent()).openOrdersKey;
                        return [4 /*yield*/, (0, serum_2.getVaultOwnerAndNonce)(optionSerumMarketProxy.market.address, optionSerumMarketProxy.dexProgramId)];
                    case 7:
                        vaultOwner = (_c.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 8:
                        _a = _c.sent(), roundInfoKey = _a.roundInfoKey, epochInfoKey = _a.epochInfoKey;
                        referrerQuoteAcct = referrerQuoteAcctReplacement ||
                            this.getPermissionedMarketReferrerPremiumAcct();
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 9:
                        extraVoltDataKey = (_c.sent())[0];
                        _b = {
                            authority: this.wallet,
                            middlewareProgram: this.sdk.programs.Volt.programId,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            optionPool: this.voltVault.optionPool,
                            premiumPool: this.voltVault.premiumPool,
                            permissionedMarketPremiumPool: this.voltVault.permissionedMarketPremiumPool,
                            roundInfo: roundInfoKey,
                            pcReferrerWallet: referrerQuoteAcct,
                            serumVaultSigner: vaultOwner,
                            dexProgram: optionSerumMarketProxy.dexProgramId,
                            openOrders: openOrdersKey,
                            market: optionSerumMarketProxy.market.address,
                            serumMarketAuthority: marketAuthority,
                            extraVoltData: extraVoltDataKey,
                            epochInfo: epochInfoKey
                        };
                        return [4 /*yield*/, this.getFeeTokenAccount(true)];
                    case 10:
                        settleEnterFundsStruct = (_b.feeAcct = _c.sent(),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            _b.coinVault = optionSerumMarket._decoded.baseVault,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            _b.pcVault = optionSerumMarket._decoded.quoteVault,
                            _b.systemProgram = web3_js_1.SystemProgram.programId,
                            _b.tokenProgram = spl_token_1.TOKEN_PROGRAM_ID,
                            _b.rent = web3_js_1.SYSVAR_RENT_PUBKEY,
                            _b);
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.settleEnterFunds({
                                accounts: settleEnterFundsStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.settleSwapPremiumFunds = function (spotSerumMarketKey, referrerQuoteAcctReplacement) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, ulOpenOrdersKey, spotSerumMarket, vaultOwner, referrerQuoteAcct, settleSwapPremiumFundsStruct;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getOptionsContractByKey(this.voltVault.optionMarket)];
                    case 1:
                        optionMarket = _a.sent();
                        if (optionMarket === null)
                            throw new Error("option market on volt vault does not exist");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findUnderlyingOpenOrdersAddress(this.voltKey, spotSerumMarketKey, this.sdk.programs.Volt.programId)];
                    case 2:
                        ulOpenOrdersKey = (_a.sent())[0];
                        return [4 /*yield*/, serum_1.Market.load(this.connection, spotSerumMarketKey, {}, this.sdk.net.SERUM_DEX_PROGRAM_ID)];
                    case 3:
                        spotSerumMarket = _a.sent();
                        return [4 /*yield*/, (0, serum_2.getVaultOwnerAndNonce)(spotSerumMarket.address, spotSerumMarket.programId)];
                    case 4:
                        vaultOwner = (_a.sent())[0];
                        referrerQuoteAcct = referrerQuoteAcctReplacement ||
                            this.getReferrerQuoteAcct(spotSerumMarket.quoteMintAddress);
                        settleSwapPremiumFundsStruct = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            depositPool: this.voltVault.depositPool,
                            tradingPool: this.voltVault.quoteAssetMint === spotSerumMarket.quoteMintAddress
                                ? this.voltVault.premiumPool
                                : this.voltVault.permissionedMarketPremiumPool,
                            pcReferrerWallet: referrerQuoteAcct,
                            serumVaultSigner: vaultOwner,
                            dexProgram: spotSerumMarket.programId,
                            openOrders: ulOpenOrdersKey,
                            market: spotSerumMarket.address,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            coinVault: spotSerumMarket._decoded.baseVault,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            pcVault: spotSerumMarket._decoded.quoteVault,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.settleSwapPremiumFunds({
                                accounts: settleSwapPremiumFundsStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getPendingDepositForUser = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPendingDepositForGivenUser(this.wallet)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getPendingWithdrawalForUser = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findPendingWithdrawalInfoAddress(this.voltKey, this.wallet, this.sdk.programs.Volt.programId)];
                    case 1:
                        key = (_a.sent())[0];
                        return [2 /*return*/, this.getPendingWithdrawalByKey(key)];
                }
            });
        });
    };
    // Entropy Instructions
    /// NOTE: weird problme where hedgeWithSpot always set to true in ix data even when passed in as false
    ConnectedVoltSDK.prototype.changeHedging = function (shouldHedge, hedgeWithSpot, targetHedgeRatio, targetHedgeLenience) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltDataKey, entropyMetadataKey, changeHedgingAccounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltDataKey = (_a.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyMetadataAddress(this.voltKey)];
                    case 2:
                        entropyMetadataKey = (_a.sent())[0];
                        changeHedgingAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltDataKey,
                            entropyMetadata: entropyMetadataKey,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.changeHedging(shouldHedge, hedgeWithSpot, targetHedgeRatio, targetHedgeLenience, {
                                accounts: changeHedgingAccounts,
                            })];
                }
            });
        });
    };
    /// NOTE: weird problme where hedgeWithSpot always set to true in ix data even when passed in as false
    ConnectedVoltSDK.prototype.resetRebalancing = function (onlyResetHedge) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltDataKey, resetRebalancingAccounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltDataKey = (_a.sent())[0];
                        resetRebalancingAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltDataKey,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.resetRebalancing(onlyResetHedge, {
                                accounts: resetRebalancingAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.setStrategyParams = function (targetLeverageRatio, targetLeverageLenience, targetHedgeRatio, targetHedgeLenience) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltDataKey, entropyMetadataKey, setStrategyAccounts;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltDataKey = (_a.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyMetadataAddress(this.voltKey)];
                    case 2:
                        entropyMetadataKey = (_a.sent())[0];
                        setStrategyAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltDataKey,
                            entropyMetadata: entropyMetadataKey,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.setStrategyParams(targetLeverageRatio.toNumber(), targetLeverageLenience.toNumber(), targetHedgeRatio.toNumber(), targetHedgeLenience.toNumber(), {
                                accounts: setStrategyAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.rebalanceEntropy = function (clientBidPrice, clientAskPrice, maxQuotePosChange, forceHedgeFirst) {
        var _a, _b, _c;
        if (forceHedgeFirst === void 0) { forceHedgeFirst = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var client, _d, entropyGroup, rootBank, nodeBank, depositIndex, powerPerpBaseDecimals, quoteDecimals, powerPerpMarket, perpMarket, spotPerpIndex, spotPerpBaseDecimals, entropyMetadataKey, extraVoltKey, entropyRoundInfoKey, epochInfoKey, ulOpenOrders, rebalanceEntropyStruct;
            var _e;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be loaded");
                        }
                        if (((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.entropyProgramId) === web3_js_1.PublicKey.default) {
                            throw new Error("entropy program id must be set (currently default)");
                        }
                        if (maxQuotePosChange === undefined) {
                            maxQuotePosChange = new bn_js_1.default("18446744073709551615");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, this.getGroupAndBanksForEvData(client, this.extraVoltData.depositMint)];
                    case 1:
                        _d = _f.sent(), entropyGroup = _d.entropyGroup, rootBank = _d.rootBank, nodeBank = _d.nodeBank, depositIndex = _d.depositIndex;
                        powerPerpBaseDecimals = (_b = entropyGroup.tokens[depositIndex]) === null || _b === void 0 ? void 0 : _b.decimals;
                        if (powerPerpBaseDecimals === undefined)
                            throw new Error("power perp base decimnals is undefined, likely market index does not exist in the entropy group");
                        quoteDecimals = entropyGroup.getQuoteTokenInfo().decimals;
                        return [4 /*yield*/, client.getPerpMarket(this.extraVoltData.powerPerpMarket, powerPerpBaseDecimals, quoteDecimals)];
                    case 2:
                        powerPerpMarket = _f.sent();
                        perpMarket = powerPerpMarket;
                        if (!this.extraVoltData.doneRebalancingPowerPerp) return [3 /*break*/, 4];
                        spotPerpIndex = entropyGroup.getPerpMarketIndex(this.extraVoltData.hedgingSpotPerpMarket);
                        spotPerpBaseDecimals = (_c = entropyGroup.tokens[spotPerpIndex]) === null || _c === void 0 ? void 0 : _c.decimals;
                        return [4 /*yield*/, client.getPerpMarket(this.extraVoltData.hedgingSpotPerpMarket, spotPerpBaseDecimals, quoteDecimals)];
                    case 3:
                        perpMarket = _f.sent();
                        _f.label = 4;
                    case 4: return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyMetadataAddress(this.voltKey)];
                    case 5:
                        entropyMetadataKey = (_f.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 6:
                        extraVoltKey = (_f.sent())[0];
                        return [4 /*yield*/, this.getBidAskLimitsForEntropy(perpMarket, clientBidPrice, clientAskPrice)];
                    case 7:
                        (_e = _f.sent(), clientBidPrice = _e.bid, clientAskPrice = _e.ask);
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyRoundInfoAddress(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 8:
                        entropyRoundInfoKey = (_f.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEpochInfoAddress(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 9:
                        epochInfoKey = (_f.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyOpenOrdersAddress(this.voltKey, this.extraVoltData.hedgingSpotMarket)];
                    case 10:
                        ulOpenOrders = (_f.sent())[0];
                        rebalanceEntropyStruct = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltKey,
                            entropyMetadata: entropyMetadataKey,
                            entropyProgram: this.extraVoltData.entropyProgramId,
                            entropyGroup: this.extraVoltData.entropyGroup,
                            entropyAccount: this.extraVoltData.entropyAccount,
                            entropyCache: this.extraVoltData.entropyCache,
                            entropyRound: entropyRoundInfoKey,
                            spotPerpMarket: this.extraVoltData.hedgingSpotPerpMarket,
                            powerPerpEventQueue: powerPerpMarket.eventQueue,
                            powerPerpMarket: this.extraVoltData.powerPerpMarket,
                            rootBank: rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey,
                            nodeBank: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey,
                            eventQueue: perpMarket.eventQueue,
                            vault: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.vault,
                            bids: perpMarket.bids,
                            asks: perpMarket.asks,
                            openOrders: ulOpenOrders,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            epochInfo: epochInfoKey,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.rebalanceEntropy(clientBidPrice, clientAskPrice, maxQuotePosChange, forceHedgeFirst, {
                                accounts: rebalanceEntropyStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getBidAskLimitsForSpot = function (serumMarket, clientBidPrice, clientAskPrice) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var bidSize, askSize, asks, bestAsk, bestAskPrice, bestAskSize, bids, bestBid, bestBidPrice, bestBidSize;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bidSize = new bn_js_1.default(0);
                        askSize = new bn_js_1.default(0);
                        if (!!clientAskPrice) return [3 /*break*/, 2];
                        return [4 /*yield*/, serumMarket.loadAsks(this.connection)];
                    case 1:
                        asks = _a.sent();
                        console.log("asks = ", asks.getL2(10));
                        bestAsk = asks.getL2(10)[0];
                        bestAskPrice = bestAsk === null || bestAsk === void 0 ? void 0 : bestAsk[2];
                        bestAskSize = bestAsk === null || bestAsk === void 0 ? void 0 : bestAsk[3];
                        if (bestAskPrice === undefined || bestAskSize === undefined) {
                            throw new Error("no ask exists on the orderbook");
                        }
                        clientAskPrice = bestAskPrice;
                        askSize = bestAskSize;
                        _a.label = 2;
                    case 2:
                        if (!!clientBidPrice) return [3 /*break*/, 4];
                        return [4 /*yield*/, serumMarket.loadBids(this.connection)];
                    case 3:
                        bids = _a.sent();
                        console.log("bids = ", bids.getL2(10));
                        bestBid = bids.getL2(10)[0];
                        bestBidPrice = bestBid === null || bestBid === void 0 ? void 0 : bestBid[2];
                        bestBidSize = bestBid === null || bestBid === void 0 ? void 0 : bestBid[3];
                        if (bestBidPrice === undefined || bestBidSize === undefined) {
                            // throw new Error("no bid exists on the orderbook");
                            clientBidPrice = clientAskPrice;
                        }
                        else {
                            clientBidPrice = bestBidPrice;
                            bidSize = bestBidSize;
                        }
                        _a.label = 4;
                    case 4:
                        console.log("client bid price = ", clientBidPrice.toString(), ", client ask price = ", clientAskPrice.toString());
                        return [2 /*return*/, {
                                bid: clientBidPrice,
                                ask: clientAskPrice,
                                bidSize: bidSize !== null && bidSize !== void 0 ? bidSize : new bn_js_1.default(0),
                                askSize: askSize !== null && askSize !== void 0 ? askSize : new bn_js_1.default(0),
                            }];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.getBidAskLimitsForEntropy = function (perpMarket, clientBidPrice, clientAskPrice) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var asks, bestAsk, bids, bestBid;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(clientAskPrice === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, perpMarket.loadAsks(this.connection)];
                    case 1:
                        asks = _a.sent();
                        bestAsk = asks.getBest();
                        if (bestAsk === undefined) {
                            throw new Error("no ask exists on the orderbook");
                        }
                        clientAskPrice = perpMarket.uiToNativePriceQuantity(bestAsk.price, bestAsk.size)[0];
                        _a.label = 2;
                    case 2:
                        if (!(clientBidPrice === undefined)) return [3 /*break*/, 4];
                        return [4 /*yield*/, perpMarket.loadBids(this.connection)];
                    case 3:
                        bids = _a.sent();
                        bestBid = bids.getBest();
                        if (bestBid === undefined) {
                            // throw new Error("no bid exists on the orderbook");
                            clientBidPrice = clientAskPrice;
                        }
                        else {
                            console.log("best bid = ", bestBid.price);
                            clientBidPrice = perpMarket.uiToNativePriceQuantity(bestBid.price, bestBid.size)[0];
                        }
                        _a.label = 4;
                    case 4:
                        console.log("client bid price = ", clientBidPrice === null || clientBidPrice === void 0 ? void 0 : clientBidPrice.toString(), ", client ask price = ", clientAskPrice === null || clientAskPrice === void 0 ? void 0 : clientAskPrice.toString());
                        return [2 /*return*/, {
                                bid: clientBidPrice,
                                ask: clientAskPrice,
                            }];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.rebalanceSpotEntropy = function (clientBidPrice, clientAskPrice, maxQuotePosChange) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var client, spotMarket, ulOpenOrders, _b, entropyGroup, rootBank, nodeBank, quoteRootBank, quoteNodeBank, entropyMetadataKey, extraVoltKey, _c, bid, ask, dexSigner, rebalanceSpotEntropyAccounts;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be loaded");
                        }
                        if (((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.entropyProgramId) === web3_js_1.PublicKey.default) {
                            throw new Error("entropy program id must be set (currently default)");
                        }
                        if (maxQuotePosChange === undefined) {
                            maxQuotePosChange = new bn_js_1.default("18446744073709551615");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, serum_1.Market.load(this.connection, this.extraVoltData.hedgingSpotMarket, {}, this.sdk.net.SERUM_DEX_PROGRAM_ID)];
                    case 1:
                        spotMarket = _d.sent();
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyOpenOrdersAddress(this.voltKey, spotMarket.address)];
                    case 2:
                        ulOpenOrders = (_d.sent())[0];
                        return [4 /*yield*/, this.getGroupAndBanksForEvData(client, spotMarket.baseMintAddress)];
                    case 3:
                        _b = _d.sent(), entropyGroup = _b.entropyGroup, rootBank = _b.rootBank, nodeBank = _b.nodeBank, quoteRootBank = _b.quoteRootBank, quoteNodeBank = _b.quoteNodeBank;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyMetadataAddress(this.voltKey)];
                    case 4:
                        entropyMetadataKey = (_d.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 5:
                        extraVoltKey = (_d.sent())[0];
                        return [4 /*yield*/, this.getBidAskLimitsForSpot(spotMarket, clientBidPrice, clientAskPrice)];
                    case 6:
                        _c = _d.sent(), bid = _c.bid, ask = _c.ask;
                        return [4 /*yield*/, web3_js_1.PublicKey.createProgramAddress(
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            [
                                spotMarket.address.toBuffer(),
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                                spotMarket._decoded.vaultSignerNonce.toArrayLike(Buffer, "le", 8),
                            ], 
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            spotMarket._programId)];
                    case 7:
                        dexSigner = _d.sent();
                        rebalanceSpotEntropyAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            extraVoltData: extraVoltKey,
                            entropyMetadata: entropyMetadataKey,
                            entropyProgram: this.extraVoltData.entropyProgramId,
                            entropyGroup: this.extraVoltData.entropyGroup,
                            entropyAccount: this.extraVoltData.entropyAccount,
                            entropyCache: this.extraVoltData.entropyCache,
                            spotMarket: this.extraVoltData.hedgingSpotMarket,
                            dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,
                            bids: spotMarket.bidsAddress,
                            asks: spotMarket.asksAddress,
                            openOrders: ulOpenOrders,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                            dexRequestQueue: spotMarket._decoded.requestQueue,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                            dexEventQueue: spotMarket._decoded.eventQueue,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                            dexBase: spotMarket._decoded.baseVault,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                            dexQuote: spotMarket._decoded.quoteVault,
                            baseRootBank: rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey,
                            baseNodeBank: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey,
                            baseVault: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.vault,
                            quoteRootBank: quoteRootBank === null || quoteRootBank === void 0 ? void 0 : quoteRootBank.publicKey,
                            quoteNodeBank: quoteNodeBank === null || quoteNodeBank === void 0 ? void 0 : quoteNodeBank.publicKey,
                            quoteVault: quoteNodeBank === null || quoteNodeBank === void 0 ? void 0 : quoteNodeBank.vault,
                            signer: entropyGroup.signerKey,
                            dexSigner: dexSigner,
                            msrmOrSrmVault: entropyGroup.msrmVault,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.rebalanceSpotEntropy(bid, ask, maxQuotePosChange, {
                                accounts: rebalanceSpotEntropyAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.initSpotOpenOrdersEntropy = function () {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var client, entropyGroup, spotMarket, ulOpenOrders, entropyMetadataKey, extraVoltKey, dexSigner, initSpotOpenOrdersEntropyAccounts;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be loaded");
                        }
                        if (((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.entropyProgramId) === web3_js_1.PublicKey.default) {
                            throw new Error("entropy program id must be set (currently default)");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, client.getEntropyGroup(this.extraVoltData.entropyGroup)];
                    case 1:
                        entropyGroup = _b.sent();
                        return [4 /*yield*/, serum_1.Market.load(this.connection, this.extraVoltData.hedgingSpotMarket, {}, this.sdk.net.SERUM_DEX_PROGRAM_ID)];
                    case 2:
                        spotMarket = _b.sent();
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyOpenOrdersAddress(this.voltKey, spotMarket.address)];
                    case 3:
                        ulOpenOrders = (_b.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyMetadataAddress(this.voltKey)];
                    case 4:
                        entropyMetadataKey = (_b.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 5:
                        extraVoltKey = (_b.sent())[0];
                        return [4 /*yield*/, web3_js_1.PublicKey.createProgramAddress(
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            [
                                spotMarket.address.toBuffer(),
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                                spotMarket._decoded.vaultSignerNonce.toArrayLike(Buffer, "le", 8),
                            ], 
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            spotMarket._programId)];
                    case 6:
                        dexSigner = _b.sent();
                        initSpotOpenOrdersEntropyAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            entropyMetadata: entropyMetadataKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            entropyProgram: this.extraVoltData.entropyProgramId,
                            entropyGroup: this.extraVoltData.entropyGroup,
                            entropyAccount: this.extraVoltData.entropyAccount,
                            spotMarket: this.extraVoltData.hedgingSpotMarket,
                            dexProgram: this.sdk.net.SERUM_DEX_PROGRAM_ID,
                            openOrders: ulOpenOrders,
                            signer: entropyGroup.signerKey,
                            dexSigner: dexSigner,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.initSpotOpenOrdersEntropy({
                                accounts: initSpotOpenOrdersEntropyAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.cacheQuoteRootBank = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var client, entropyGroup, cacheIx;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be initiailzied");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, client.getEntropyGroup(this.extraVoltData.entropyGroup)];
                    case 1:
                        entropyGroup = _a.sent();
                        cacheIx = (0, entropy_client_1.makeCacheRootBankInstruction)(this.extraVoltData.entropyProgramId, entropyGroup.publicKey, entropyGroup.entropyCache, [entropyGroup.getQuoteTokenInfo().rootBank]);
                        return [2 /*return*/, cacheIx];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.cacheRelevantPrices = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var client, entropyGroup, oracles;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be initiailzied");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, client.getEntropyGroup(this.extraVoltData.entropyGroup)];
                    case 1:
                        entropyGroup = _a.sent();
                        oracles = [
                            entropyGroup.oracles[entropyGroup.getPerpMarketIndex(this.extraVoltData.powerPerpMarket)],
                            entropyGroup.oracles[entropyGroup.getPerpMarketIndex(this.extraVoltData.hedgingSpotPerpMarket)],
                        ];
                        return [2 /*return*/, (0, entropy_client_1.makeCachePricesInstruction)(this.extraVoltData.entropyProgramId, entropyGroup.publicKey, entropyGroup.entropyCache, oracles)];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.cacheRelevantPerpMarkets = function () {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var client, entropyGroup;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be initiailzied");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, client.getEntropyGroup(this.extraVoltData.entropyGroup)];
                    case 1:
                        entropyGroup = _c.sent();
                        return [2 /*return*/, (0, entropy_client_1.makeCachePerpMarketsInstruction)(this.extraVoltData.entropyProgramId, entropyGroup.publicKey, entropyGroup.entropyCache, [
                                (_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.powerPerpMarket,
                                (_b = this.extraVoltData) === null || _b === void 0 ? void 0 : _b.hedgingSpotPerpMarket,
                            ])];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.setupRebalanceEntropy = function (clientOraclePx) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, roundVoltTokensKey, roundUnderlyingTokensKey, roundInfoKey, roundUnderlyingPendingWithdrawalsKey, client, extraVoltKey, entropyGroup, entropyCache, _c, rootBank, nodeBank, entropyRoundInfoKey, entropyMetadataKey, epochInfoKey, setupRebalanceEntropyStruct;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        _b = _d.sent(), roundVoltTokensKey = _b.roundVoltTokensKey, roundUnderlyingTokensKey = _b.roundUnderlyingTokensKey, roundInfoKey = _b.roundInfoKey, roundUnderlyingPendingWithdrawalsKey = _b.roundUnderlyingPendingWithdrawalsKey;
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be loaded");
                        }
                        if (((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.entropyProgramId) === web3_js_1.PublicKey.default) {
                            throw new Error("entropy program id must be set (currently default)");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_d.sent())[0];
                        return [4 /*yield*/, client.getEntropyGroup(this.extraVoltData.entropyGroup)];
                    case 3:
                        entropyGroup = _d.sent();
                        return [4 /*yield*/, entropyGroup.loadCache(this.sdk.readonlyProvider.connection)];
                    case 4:
                        entropyCache = _d.sent();
                        return [4 /*yield*/, this.getGroupAndBanksForEvData(client, this.extraVoltData.depositMint)];
                    case 5:
                        _c = _d.sent(), rootBank = _c.rootBank, nodeBank = _c.nodeBank;
                        if (!clientOraclePx)
                            clientOraclePx = this.oraclePriceForDepositToken(entropyGroup, entropyCache);
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 6:
                        entropyRoundInfoKey = (_d.sent()).entropyRoundInfoKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyMetadataAddress(this.voltKey)];
                    case 7:
                        entropyMetadataKey = (_d.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEpochInfoAddress(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 8:
                        epochInfoKey = (_d.sent())[0];
                        setupRebalanceEntropyStruct = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            entropyMetadata: entropyMetadataKey,
                            vaultMint: this.voltVault.vaultMint,
                            depositPool: this.voltVault.depositPool,
                            roundInfo: roundInfoKey,
                            roundVoltTokens: roundVoltTokensKey,
                            roundUnderlyingTokens: roundUnderlyingTokensKey,
                            roundUnderlyingTokensForPendingWithdrawals: roundUnderlyingPendingWithdrawalsKey,
                            entropyRound: entropyRoundInfoKey,
                            dexProgram: this.extraVoltData.serumProgramId,
                            entropyProgram: this.extraVoltData.entropyProgramId,
                            entropyGroup: this.extraVoltData.entropyGroup,
                            entropyAccount: this.extraVoltData.entropyAccount,
                            entropyCache: this.extraVoltData.entropyCache,
                            spotPerpMarket: this.extraVoltData.hedgingSpotPerpMarket,
                            powerPerpMarket: this.extraVoltData.powerPerpMarket,
                            rootBank: rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey,
                            nodeBank: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey,
                            vault: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.vault,
                            signer: entropyGroup.signerKey,
                            epochInfo: epochInfoKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.setupRebalanceEntropy(clientOraclePx, {
                                accounts: setupRebalanceEntropyStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.depositDiscretionaryEntropy = function (adminUnderlyingTokens, depositAmount) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var client, extraVoltKey, entropyGroup, banks, rootBank, nodeBank, textEncoder, depositDiscretionaryKey, depositDiscretionaryEntropyAccounts;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be loaded");
                        }
                        if (((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.entropyProgramId) === web3_js_1.PublicKey.default) {
                            throw new Error("entropy program id must be set (currently default)");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 1:
                        extraVoltKey = (_c.sent())[0];
                        return [4 /*yield*/, client.getEntropyGroup(this.extraVoltData.entropyGroup)];
                    case 2:
                        entropyGroup = _c.sent();
                        return [4 /*yield*/, entropyGroup.loadRootBanks(this.connection)];
                    case 3:
                        banks = _c.sent();
                        rootBank = banks[entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)];
                        return [4 /*yield*/, (rootBank === null || rootBank === void 0 ? void 0 : rootBank.loadNodeBanks(this.connection))];
                    case 4:
                        nodeBank = (_b = (_c.sent())) === null || _b === void 0 ? void 0 : _b[0];
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                this.voltKey.toBuffer(),
                                textEncoder.encode("depositDiscretionaryAccount"),
                            ], this.sdk.programs.Volt.programId)];
                    case 5:
                        depositDiscretionaryKey = (_c.sent())[0];
                        depositDiscretionaryEntropyAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            adminDepositTokenAccount: adminUnderlyingTokens,
                            depositDiscretionaryTokens: depositDiscretionaryKey,
                            entropyProgram: this.extraVoltData.entropyProgramId,
                            entropyGroup: this.extraVoltData.entropyGroup,
                            entropyAccount: this.extraVoltData.entropyAccount,
                            entropyCache: this.extraVoltData.entropyCache,
                            spotPerpMarket: this.extraVoltData.hedgingSpotPerpMarket,
                            powerPerpMarket: this.extraVoltData.powerPerpMarket,
                            rootBank: rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey,
                            nodeBank: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey,
                            vault: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.vault,
                            signer: entropyGroup.signerKey,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            depositMint: this.extraVoltData.depositMint,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.depositDiscretionaryEntropy(depositAmount, {
                                accounts: depositDiscretionaryEntropyAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.transferDeposit = function (targetPool, underlyingDestination, amount) {
        var transferDepositAccounts = {
            authority: this.wallet,
            voltVault: this.voltKey,
            vaultAuthority: this.voltVault.vaultAuthority,
            underlyingUserAcct: underlyingDestination,
            targetPool: targetPool,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        };
        return this.sdk.programs.Volt.instruction.transferDeposit(amount, {
            accounts: transferDepositAccounts,
        });
    };
    ConnectedVoltSDK.prototype.moveAssetsToLendingAccount = function (targetPool, amount, entropyGroupGivenKey, entropyProgramGivenKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var entropyLendingAccountKey, err_4, entropyGroupKey, entropyProgramKey, _a, entropyClient_1, entropyGroup_1, _b, entropyClient, entropyGroup, _c, rootBank, nodeBank, _d, _e, _f, moveAssetsToLendingAccounts;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this.extraVoltData)
                            throw new Error("requires ev data");
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyLendingAccountAddress(this.voltKey)];
                    case 1:
                        entropyLendingAccountKey = (_g.sent())[0];
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.sdk.readonlyProvider.connection, entropyLendingAccountKey)];
                    case 3:
                        _g.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_4 = _g.sent();
                        if (entropyGroupGivenKey === undefined ||
                            entropyProgramGivenKey === undefined)
                            throw new Error("entropy account doesn't exist, must provide program id + group");
                        return [3 /*break*/, 5];
                    case 5:
                        if (!(entropyGroupGivenKey === undefined ||
                            entropyProgramGivenKey === undefined)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getEntropyLendingObjects()];
                    case 6:
                        _a = _g.sent(), entropyClient_1 = _a.entropyClient, entropyGroup_1 = _a.entropyGroup;
                        entropyGroupKey = entropyGroup_1.publicKey;
                        entropyProgramKey = entropyClient_1.programId;
                        return [3 /*break*/, 8];
                    case 7:
                        entropyGroupKey = entropyGroupGivenKey;
                        entropyProgramKey = entropyProgramGivenKey;
                        _g.label = 8;
                    case 8: return [4 /*yield*/, this.getEntropyGroup(entropyProgramKey, entropyGroupKey)];
                    case 9:
                        _b = _g.sent(), entropyClient = _b.entropyClient, entropyGroup = _b.entropyGroup;
                        _e = (_d = VoltSDK_1.VoltSDK).getGroupAndBanks;
                        _f = [entropyClient,
                            entropyGroup.publicKey];
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.sdk.readonlyProvider.connection, targetPool)];
                    case 10: return [4 /*yield*/, _e.apply(_d, _f.concat([(_g.sent()).mint]))];
                    case 11:
                        _c = _g.sent(), rootBank = _c.rootBank, nodeBank = _c.nodeBank;
                        console.log("root bank = ", rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey.toString(), "node bank = ", nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey.toString());
                        moveAssetsToLendingAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            targetPool: targetPool,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            entropyProgram: entropyClient.programId,
                            entropyGroup: entropyGroup.publicKey,
                            entropyAccount: entropyLendingAccountKey,
                            entropyCache: entropyGroup.entropyCache,
                            rootBank: rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey,
                            nodeBank: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey,
                            vault: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.vault,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.moveAssetsToLendingAccount(amount, {
                                accounts: moveAssetsToLendingAccounts,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.withdrawAssetsFromLendingAccount = function (targetPool, amount) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, entropyClient, entropyGroup, entropyAccount, _b, rootBank, nodeBank, withdrawAssetsFromLendingAccounts;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.extraVoltData)
                            throw new Error("requires ev data");
                        return [4 /*yield*/, this.getEntropyLendingObjects()];
                    case 1:
                        _a = _c.sent(), entropyClient = _a.entropyClient, entropyGroup = _a.entropyGroup, entropyAccount = _a.entropyAccount;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.getGroupAndBanks(entropyClient, entropyGroup.publicKey, this.voltVault.underlyingAssetMint)];
                    case 2:
                        _b = _c.sent(), rootBank = _b.rootBank, nodeBank = _b.nodeBank;
                        withdrawAssetsFromLendingAccounts = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            targetPool: targetPool,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            entropyProgram: entropyClient.programId,
                            entropyGroup: entropyGroup.publicKey,
                            entropyAccount: entropyAccount.publicKey,
                            entropyCache: entropyGroup.entropyCache,
                            rootBank: rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey,
                            nodeBank: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey,
                            vault: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.vault,
                            signer: entropyGroup.signerKey,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.withdrawAssetsFromLendingAccount(amount, {
                                accounts: withdrawAssetsFromLendingAccounts,
                            })];
                }
            });
        });
    };
    // async reinitializeMint(
    //   targetPool: PublicKey,
    //   newMint: PublicKey,
    //   underlyingDestination: PublicKey
    // ): Promise<TransactionInstruction> {
    //   const [extraVoltKey] = await VoltSDK.findExtraVoltDataAddress(this.voltKey);
    //   const reinitializeMintAccounts: Parameters<
    //     VoltProgram["instruction"]["reinitializeMint"]["accounts"]
    //   >[0] = {
    //     authority: this.wallet,
    //     voltVault: this.voltKey,
    //     vaultAuthority: this.voltVault.vaultAuthority,
    //     extraVoltData: extraVoltKey,
    //     targetPool: targetPool,
    //     oldMint: this.voltVault.underlyingAssetMint,
    //     newMint: newMint,
    //     userTokens: underlyingDestination,
    //     rent: SYSVAR_RENT_PUBKEY,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //   };
    //   return this.sdk.programs.Volt.instruction.reinitializeMint({
    //     accounts: reinitializeMintAccounts,
    //   });
    // }
    ConnectedVoltSDK.prototype.endRoundEntropy = function (bypassCode) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _c, roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey, client, extraVoltKey, entropyMetadataKey, entropyGroup, banks, rootBank, nodeBank, entropyRoundInfoKey, _d, entropyLendingProgramKey, entropyLendingGroupKey, entropyLendingAccountKey, entropySpotOpenOrders, endRoundEntropyStruct;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (bypassCode === undefined)
                            bypassCode = new bn_js_1.default(0);
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 1:
                        _c = _e.sent(), roundVoltTokensKey = _c.roundVoltTokensKey, roundUnderlyingPendingWithdrawalsKey = _c.roundUnderlyingPendingWithdrawalsKey;
                        if (!this.extraVoltData) {
                            throw new Error("extra volt data must be loaded");
                        }
                        if (((_a = this.extraVoltData) === null || _a === void 0 ? void 0 : _a.entropyProgramId) === web3_js_1.PublicKey.default) {
                            throw new Error("entropy program id must be set (currently default)");
                        }
                        client = new entropy_client_1.EntropyClient(this.connection, this.extraVoltData.entropyProgramId);
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findExtraVoltDataAddress(this.voltKey)];
                    case 2:
                        extraVoltKey = (_e.sent())[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyMetadataAddress(this.voltKey)];
                    case 3:
                        entropyMetadataKey = (_e.sent())[0];
                        return [4 /*yield*/, client.getEntropyGroup(this.extraVoltData.entropyGroup)];
                    case 4:
                        entropyGroup = _e.sent();
                        return [4 /*yield*/, entropyGroup.loadRootBanks(this.connection)];
                    case 5:
                        banks = _e.sent();
                        rootBank = banks[entropyGroup.getRootBankIndex(entropyGroup.getQuoteTokenInfo().rootBank)];
                        return [4 /*yield*/, (rootBank === null || rootBank === void 0 ? void 0 : rootBank.loadNodeBanks(this.connection))];
                    case 6:
                        nodeBank = (_b = (_e.sent())) === null || _b === void 0 ? void 0 : _b[0];
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findRoundAddresses(this.voltKey, this.voltVault.roundNumber, this.sdk.programs.Volt.programId)];
                    case 7:
                        entropyRoundInfoKey = (_e.sent()).entropyRoundInfoKey;
                        return [4 /*yield*/, this.getEntropyLendingKeys()];
                    case 8:
                        _d = _e.sent(), entropyLendingProgramKey = _d.entropyLendingProgramKey, entropyLendingGroupKey = _d.entropyLendingGroupKey, entropyLendingAccountKey = _d.entropyLendingAccountKey;
                        return [4 /*yield*/, VoltSDK_1.VoltSDK.findEntropyOpenOrdersAddress(this.voltKey, this.extraVoltData.hedgingSpotMarket)];
                    case 9:
                        entropySpotOpenOrders = (_e.sent())[0];
                        endRoundEntropyStruct = {
                            authority: this.wallet,
                            voltVault: this.voltKey,
                            extraVoltData: extraVoltKey,
                            entropyMetadata: entropyMetadataKey,
                            vaultAuthority: this.voltVault.vaultAuthority,
                            vaultMint: this.voltVault.vaultMint,
                            roundVoltTokens: roundVoltTokensKey,
                            roundUnderlyingTokensForPendingWithdrawals: roundUnderlyingPendingWithdrawalsKey,
                            signer: entropyGroup.signerKey,
                            entropyRound: entropyRoundInfoKey,
                            dexProgram: this.extraVoltData.serumProgramId,
                            openOrders: entropySpotOpenOrders,
                            entropyProgram: this.extraVoltData.entropyProgramId,
                            entropyGroup: this.extraVoltData.entropyGroup,
                            entropyAccount: this.extraVoltData.entropyAccount,
                            entropyCache: this.extraVoltData.entropyCache,
                            rootBank: rootBank === null || rootBank === void 0 ? void 0 : rootBank.publicKey,
                            nodeBank: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.publicKey,
                            vault: nodeBank === null || nodeBank === void 0 ? void 0 : nodeBank.vault,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            entropyLendingProgram: entropyLendingProgramKey,
                            entropyLendingGroup: entropyLendingGroupKey,
                            entropyLendingAccount: entropyLendingAccountKey,
                        };
                        return [2 /*return*/, this.sdk.programs.Volt.instruction.endRoundEntropy(bypassCode, {
                                accounts: endRoundEntropyStruct,
                            })];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.doFullDeposit = function (depositAmount, solTransferAuthorityReplacement) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = friktion_utils_1.sendInsList;
                        _b = [this.sdk.readonlyProvider];
                        return [4 /*yield*/, this.fullDepositInstructions(depositAmount, solTransferAuthorityReplacement)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.doFullWithdraw = function (withdrawAmount) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = friktion_utils_1.sendInsList;
                        _b = [this.sdk.readonlyProvider];
                        return [4 /*yield*/, this.fullWithdrawInstructions(withdrawAmount)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.fullDepositInstructions = function (depositAmount, solTransferAuthorityReplacement) {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var payer, authority, solTransferAuthority, voltVault, depositMint, vaultMint, isWrappedSol, depositInstructions, depositTokenAccountKey, vaultTokenAccountKey, numLamports, additionalLamportsRequired, err_5, err_6, pendingDepositInfo, err_7, _d, _e, _f, _g, _h, _j;
            return tslib_1.__generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        payer = this.wallet;
                        authority = this.daoAuthority ? this.daoAuthority : this.wallet;
                        solTransferAuthority = solTransferAuthorityReplacement !== null && solTransferAuthorityReplacement !== void 0 ? solTransferAuthorityReplacement : this.wallet;
                        voltVault = this.voltVault;
                        depositMint = voltVault.underlyingAssetMint;
                        vaultMint = voltVault.vaultMint;
                        isWrappedSol = depositMint.toString() === constants_1.WRAPPED_SOL_ADDRESS.toString();
                        depositInstructions = [];
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(depositMint, authority, true)];
                    case 1:
                        depositTokenAccountKey = _k.sent();
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(vaultMint, authority, true)];
                    case 2:
                        vaultTokenAccountKey = _k.sent();
                        if (!isWrappedSol) return [3 /*break*/, 7];
                        _k.label = 3;
                    case 3:
                        _k.trys.push([3, 6, , 7]);
                        // try to get account info
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.connection, depositTokenAccountKey)];
                    case 4:
                        // try to get account info
                        _k.sent();
                        return [4 /*yield*/, this.sdk.readonlyProvider.connection.getAccountInfo(depositTokenAccountKey)];
                    case 5:
                        numLamports = (_b = (_a = (_k.sent())) === null || _a === void 0 ? void 0 : _a.lamports) !== null && _b !== void 0 ? _b : 0;
                        additionalLamportsRequired = Math.max(depositAmount.toNumber() * constants_1.SOL_NORM_FACTOR - numLamports, 0);
                        if (additionalLamportsRequired > 0) {
                            depositInstructions.push(web3_js_1.SystemProgram.transfer({
                                fromPubkey: solTransferAuthority,
                                toPubkey: depositTokenAccountKey,
                                lamports: additionalLamportsRequired,
                            }));
                            depositInstructions.push((0, spl_token_1.createSyncNativeInstruction)(depositTokenAccountKey, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        err_5 = _k.sent();
                        depositInstructions.push(web3_js_1.SystemProgram.transfer({
                            fromPubkey: solTransferAuthority,
                            toPubkey: depositTokenAccountKey,
                            lamports: depositAmount.toNumber() * constants_1.SOL_NORM_FACTOR,
                        }));
                        depositInstructions.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer, depositTokenAccountKey, authority, depositMint));
                        return [3 /*break*/, 7];
                    case 7:
                        _k.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.connection, vaultTokenAccountKey)];
                    case 8:
                        _k.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        err_6 = _k.sent();
                        depositInstructions.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer, vaultTokenAccountKey, authority, vaultMint));
                        return [3 /*break*/, 10];
                    case 10:
                        if (!!voltVault.instantTransfersEnabled) return [3 /*break*/, 18];
                        pendingDepositInfo = void 0;
                        _k.label = 11;
                    case 11:
                        _k.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, this.getPendingDepositForGivenUser(authority)];
                    case 12:
                        pendingDepositInfo = _k.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        err_7 = _k.sent();
                        pendingDepositInfo = undefined;
                        return [3 /*break*/, 14];
                    case 14:
                        if (!(pendingDepositInfo &&
                            ((_c = pendingDepositInfo === null || pendingDepositInfo === void 0 ? void 0 : pendingDepositInfo.numUnderlyingDeposited) === null || _c === void 0 ? void 0 : _c.gtn(0)) &&
                            pendingDepositInfo.roundNumber.gtn(0))) return [3 /*break*/, 18];
                        if (!pendingDepositInfo.roundNumber.lt(voltVault.roundNumber)) return [3 /*break*/, 16];
                        _e = (_d = depositInstructions).push;
                        return [4 /*yield*/, this.claimPending(vaultTokenAccountKey)];
                    case 15:
                        _e.apply(_d, [_k.sent()]);
                        return [3 /*break*/, 18];
                    case 16:
                        _g = (_f = depositInstructions).push;
                        return [4 /*yield*/, this.cancelPendingDeposit(depositTokenAccountKey)];
                    case 17:
                        _g.apply(_f, [_k.sent()]);
                        _k.label = 18;
                    case 18:
                        _j = (_h = depositInstructions).push;
                        return [4 /*yield*/, this.deposit(depositAmount, depositTokenAccountKey, vaultTokenAccountKey, authority)];
                    case 19:
                        _j.apply(_h, [_k.sent()]);
                        if (isWrappedSol) {
                            // OPTIONAL: close account once done with it. Don't do this by default since ATA will be useful in future
                            // const closeWSolIx = createCloseAccountInstruction(
                            //   depositTokenAccountKey,
                            //   this.wallet, // Send any remaining SOL to the owner
                            //   this.wallet,
                            //   []
                            // );
                            // depositInstructions.push(closeWSolIx);
                        }
                        return [2 /*return*/, depositInstructions];
                }
            });
        });
    };
    ConnectedVoltSDK.prototype.fullWithdrawInstructions = function (
    // in deposit token
    withdrawAmount) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var payer, authority, voltVault, depositMint, vaultMint, withdrawalInstructions, depositTokenAccountKey, vaultTokenAccountKey, err_8, err_9, pendingWithdrawalInfo, err_10, _c, _d, _e, _f, _g, _h;
            return tslib_1.__generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        payer = this.wallet;
                        authority = this.daoAuthority ? this.daoAuthority : this.wallet;
                        voltVault = this.voltVault;
                        depositMint = voltVault.underlyingAssetMint;
                        vaultMint = voltVault.vaultMint;
                        withdrawalInstructions = [];
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(depositMint, authority)];
                    case 1:
                        depositTokenAccountKey = _j.sent();
                        return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(vaultMint, authority)];
                    case 2:
                        vaultTokenAccountKey = _j.sent();
                        _j.label = 3;
                    case 3:
                        _j.trys.push([3, 5, , 6]);
                        // try to get account info
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.connection, depositTokenAccountKey)];
                    case 4:
                        // try to get account info
                        _j.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_8 = _j.sent();
                        withdrawalInstructions.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer, depositTokenAccountKey, authority, depositMint));
                        return [3 /*break*/, 6];
                    case 6:
                        _j.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, (0, spl_token_1.getAccount)(this.connection, vaultTokenAccountKey)];
                    case 7:
                        _j.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_9 = _j.sent();
                        withdrawalInstructions.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer, vaultTokenAccountKey, authority, vaultMint));
                        return [3 /*break*/, 9];
                    case 9:
                        if (!!voltVault.instantTransfersEnabled) return [3 /*break*/, 17];
                        pendingWithdrawalInfo = void 0;
                        _j.label = 10;
                    case 10:
                        _j.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.getPendingWithdrawalForGivenUser(authority)];
                    case 11:
                        pendingWithdrawalInfo = _j.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        err_10 = _j.sent();
                        pendingWithdrawalInfo = undefined;
                        return [3 /*break*/, 13];
                    case 13:
                        if (!(pendingWithdrawalInfo &&
                            ((_a = pendingWithdrawalInfo === null || pendingWithdrawalInfo === void 0 ? void 0 : pendingWithdrawalInfo.numVoltRedeemed) === null || _a === void 0 ? void 0 : _a.gtn(0)) &&
                            ((_b = pendingWithdrawalInfo.roundNumber) === null || _b === void 0 ? void 0 : _b.gtn(0)))) return [3 /*break*/, 17];
                        if (!pendingWithdrawalInfo.roundNumber.lt(voltVault.roundNumber)) return [3 /*break*/, 15];
                        _d = (_c = withdrawalInstructions).push;
                        return [4 /*yield*/, this.claimPendingWithdrawal(depositTokenAccountKey)];
                    case 14:
                        _d.apply(_c, [_j.sent()]);
                        return [3 /*break*/, 17];
                    case 15:
                        _f = (_e = withdrawalInstructions).push;
                        return [4 /*yield*/, this.cancelPendingWithdrawal(vaultTokenAccountKey)];
                    case 16:
                        _f.apply(_e, [_j.sent()]);
                        _j.label = 17;
                    case 17:
                        _h = (_g = withdrawalInstructions).push;
                        return [4 /*yield*/, this.withdrawHumanAmount(withdrawAmount, vaultTokenAccountKey, depositTokenAccountKey, authority)];
                    case 18:
                        _h.apply(_g, [_j.sent()]);
                        return [2 /*return*/, withdrawalInstructions];
                }
            });
        });
    };
    return ConnectedVoltSDK;
}(VoltSDK_1.VoltSDK));
exports.ConnectedVoltSDK = ConnectedVoltSDK;
