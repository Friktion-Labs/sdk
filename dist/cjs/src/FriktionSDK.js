"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriktionSDK = exports.DefaultFriktionSDKOpts = void 0;
var tslib_1 = require("tslib");
var friktion_utils_1 = require("@friktion-labs/friktion-utils");
var anchor_1 = require("@project-serum/anchor");
var web3_js_1 = require("@solana/web3.js");
var _1 = require(".");
var constants_1 = require("./constants");
var errorCodes_1 = require("./errorCodes");
var inertiaUtils_1 = require("./programs/Inertia/inertiaUtils");
var soloptionsUtils_1 = require("./programs/Soloptions/soloptionsUtils");
var spreadsUtils_1 = require("./programs/Spreads/spreadsUtils");
var SwapSDK_1 = require("./programs/Swap/SwapSDK");
exports.DefaultFriktionSDKOpts = {
    network: "mainnet-beta",
};
/**
 * sdk is stateless and readonly unless a signer is loaded.
 */
var FriktionSDK = /** @class */ (function () {
    function FriktionSDK(opts) {
        var defaultedOpts = Object.assign({}, opts, exports.DefaultFriktionSDKOpts);
        this.readonlyProvider = (0, friktion_utils_1.providerToAnchorProvider)(defaultedOpts.provider);
        this.testingOpts = opts.testingOpts;
        this.network = !opts.network
            ? "mainnet-beta"
            : opts.network === "testnet" || opts.network === "localnet"
                ? "mainnet-beta"
                : opts.network;
        var voltIdl = constants_1.FRIKTION_IDLS.Volt;
        if (!voltIdl) {
            console.error("FRIKTION_IDLS", constants_1.FRIKTION_IDLS);
            // this used to be a big bug
            throw new Error("Unable to load FriktionSDK because idl is missing");
        }
        var soloptionsIdl = _1.OTHER_IDLS.Soloptions;
        if (!soloptionsIdl) {
            console.error("OTHER_IDLS", _1.OTHER_IDLS);
            // this used to be a big bug
            throw new Error("Unable to load FriktionSDK because Soloptions idl is missing");
        }
        var inertiaIdl = _1.OTHER_IDLS.Inertia;
        if (!inertiaIdl) {
            throw new Error("Unable to load FriktionSDK because Inertia idl is missing");
        }
        var swapIdl = _1.OTHER_IDLS.SimpleSwap;
        if (!swapIdl)
            throw new Error("Unable to load FriktionSDK because SimpleSwap idl is missing");
        var spreadsIdl = _1.OTHER_IDLS.Spreads;
        if (!spreadsIdl) {
            throw new Error("Unable to load FriktionSDK because Inertia idl is missing");
        }
        var voltProgramIdForNetwork = null;
        if (this.network === "mainnet-beta") {
            voltProgramIdForNetwork = constants_1.FRIKTION_PROGRAM_ID;
        }
        else if (this.network === "devnet") {
            voltProgramIdForNetwork = constants_1.FRIKTION_PROGRAM_ID;
        }
        else {
            throw new Error("Unknown network. No public key for network id ".concat(JSON.stringify(this.network)));
        }
        var Volt = new anchor_1.Program(voltIdl, voltProgramIdForNetwork, this.readonlyProvider);
        var Soloptions = new anchor_1.Program(soloptionsIdl, _1.OPTIONS_PROGRAM_IDS.Soloptions.toString(), this.readonlyProvider);
        var Inertia = new anchor_1.Program(inertiaIdl, _1.OPTIONS_PROGRAM_IDS.Inertia.toString(), this.readonlyProvider);
        var SimpleSwap = new anchor_1.Program(swapIdl, constants_1.SIMPLE_SWAP_PROGRAM_ID.toString(), this.readonlyProvider);
        var Spreads = new anchor_1.Program(spreadsIdl, _1.OPTIONS_PROGRAM_IDS.Spreads.toString(), this.readonlyProvider);
        this.programs = {
            Volt: Volt,
            Soloptions: Soloptions,
            Inertia: Inertia,
            SimpleSwap: SimpleSwap,
            Spreads: Spreads,
        };
        this.legacyAnchorPrograms = {
            Volt: Volt,
            Soloptions: Soloptions,
            Inertia: Inertia,
        };
    }
    FriktionSDK.prototype.loadVolt = function (voltVault, voltKey) {
        return new _1.VoltSDK(this, voltVault, voltKey);
    };
    FriktionSDK.prototype.loadVoltAndExtraData = function (voltVault, voltKey, extraVoltData) {
        return new _1.VoltSDK(this, voltVault, voltKey, extraVoltData);
    };
    Object.defineProperty(FriktionSDK.prototype, "net", {
        // Keep all network specific items in here
        /**
         * Returns constants for the current network
         */
        get: function () {
            var _a, _b;
            if (this.network === "mainnet-beta") {
                return tslib_1.__assign(tslib_1.__assign({}, constants_1.USE_SDK_NET_TO_GET_CONSTANTS_MAINNET), ((_b = (_a = this.testingOpts) === null || _a === void 0 ? void 0 : _a.netOpts) !== null && _b !== void 0 ? _b : {}));
            }
            else {
                return constants_1.USE_SDK_NET_TO_GET_CONSTANTS_DEVNET;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FriktionSDK.prototype, "devnet", {
        get: function () {
            return constants_1.USE_SDK_NET_TO_GET_CONSTANTS_DEVNET;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FriktionSDK.prototype, "mainnet", {
        get: function () {
            throw new Error("Don't do this. Use sdk.net");
        },
        enumerable: false,
        configurable: true
    });
    FriktionSDK.prototype.loadUserOrdersByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.programs.SimpleSwap.account.userOrders.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    FriktionSDK.prototype.loadSwapByKey = function (swapOrderKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var swapData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.programs.SimpleSwap.account.swapOrder.fetch(swapOrderKey)];
                    case 1:
                        swapData = _a.sent();
                        return [2 /*return*/, new SwapSDK_1.SwapSDK(swapData, swapOrderKey, {
                                provider: this.readonlyProvider,
                                network: this.network,
                            })];
                }
            });
        });
    };
    /**
     * Please memo this.
     *
     * Automatically loads the volt for you by doing a RPC call. You may want to
     * load it yourself using sail, because loadVoltByKey doesn't have ANY
     * cacheing, so you could end up calling this 100 times.
     */
    FriktionSDK.prototype.loadVoltByKey = function (voltKey, extraVoltData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var voltVaultData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!voltKey) {
                            throw new Error("falsy voltKey passed into loadVoltByKey");
                        }
                        return [4 /*yield*/, this.programs.Volt.account.voltVault.fetch(voltKey)];
                    case 1:
                        voltVaultData = _a.sent();
                        return [2 /*return*/, extraVoltData
                                ? this.loadVoltAndExtraData(voltVaultData, voltKey, extraVoltData)
                                : this.loadVolt(voltVaultData, voltKey)];
                }
            });
        });
    };
    FriktionSDK.prototype.loadVoltAndExtraDataByKey = function (voltKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var voltVaultData, extraVoltKey, extraVoltData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!voltKey) {
                            throw new Error("falsy voltKey passed into loadVoltByKey");
                        }
                        return [4 /*yield*/, this.programs.Volt.account.voltVault.fetch(voltKey)];
                    case 1:
                        voltVaultData = _a.sent();
                        return [4 /*yield*/, _1.VoltSDK.findExtraVoltDataAddress(voltKey)];
                    case 2:
                        extraVoltKey = (_a.sent())[0];
                        return [4 /*yield*/, this.programs.Volt.account.extraVoltData.fetch(extraVoltKey)];
                    case 3:
                        extraVoltData = _a.sent();
                        return [2 /*return*/, this.loadVoltAndExtraData(voltVaultData, voltKey, extraVoltData)];
                }
            });
        });
    };
    FriktionSDK.prototype.getExtraVoltDataKey = function (voltKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var extraVoltKey;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _1.VoltSDK.findExtraVoltDataAddress(voltKey)];
                    case 1:
                        extraVoltKey = (_a.sent())[0];
                        return [2 /*return*/, extraVoltKey];
                }
            });
        });
    };
    FriktionSDK.prototype.getAllVoltVaults = function () {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accts;
            var _this = this;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, ((_c = (_b = (_a = this.programs.Volt) === null || _a === void 0 ? void 0 : _a.account) === null || _b === void 0 ? void 0 : _b.voltVault) === null || _c === void 0 ? void 0 : _c.all())];
                    case 1:
                        accts = (_d.sent());
                        return [2 /*return*/, accts.map(function (acct) {
                                return _this.loadVolt(acct.account, acct.publicKey);
                            })];
                }
            });
        });
    };
    FriktionSDK.prototype.getAllVoltVaultsWithExtraVoltData = function () {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accts;
            var _this = this;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, ((_c = (_b = (_a = this.programs.Volt) === null || _a === void 0 ? void 0 : _a.account) === null || _b === void 0 ? void 0 : _b.voltVault) === null || _c === void 0 ? void 0 : _c.all())];
                    case 1:
                        accts = (_d.sent());
                        return [4 /*yield*/, Promise.all(accts.map(function (acct) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var voltSdk;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            voltSdk = this.loadVolt(acct.account, acct.publicKey);
                                            return [4 /*yield*/, voltSdk.loadInExtraVoltData()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, voltSdk];
                                    }
                                });
                            }); }))];
                    case 2: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    FriktionSDK.prototype.getOptionsProtocolForKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accountInfo;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readonlyProvider.connection.getAccountInfo(key)];
                    case 1:
                        accountInfo = _a.sent();
                        if (!accountInfo) {
                            throw new Error("account does not exist, can't determine options protocol owner");
                        }
                        if (accountInfo.owner.toString() === _1.OPTIONS_PROGRAM_IDS.Inertia.toString()) {
                            return [2 /*return*/, "Inertia"];
                        }
                        else if (accountInfo.owner.toString() === _1.OPTIONS_PROGRAM_IDS.Soloptions.toString()) {
                            return [2 /*return*/, "Soloptions"];
                        }
                        else if (accountInfo.owner.toString() === _1.OPTIONS_PROGRAM_IDS.Spreads.toString()) {
                            return [2 /*return*/, "Spreads"];
                        }
                        else {
                            throw new Error("owner is not a supported options protocol");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FriktionSDK.prototype.getOptionMarketByKey = function (key, optionsProtocol) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!optionsProtocol) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getOptionsProtocolForKey(key)];
                    case 1:
                        optionsProtocol = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(optionsProtocol === "Inertia")) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, inertiaUtils_1.getInertiaMarketByKey)(this.programs.Inertia, key)];
                    case 3:
                        optionMarket = _b.sent();
                        return [3 /*break*/, 9];
                    case 4:
                        if (!(optionsProtocol === "Soloptions")) return [3 /*break*/, 6];
                        return [4 /*yield*/, _1.SoloptionsSDK.getOptionMarketByKey(this.programs.Soloptions, key)];
                    case 5:
                        optionMarket = _b.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        if (!(optionsProtocol === "Spreads")) return [3 /*break*/, 8];
                        _a = spreadsUtils_1.convertSpreadsContractToOptionMarket;
                        return [4 /*yield*/, _1.SpreadsSDK.getSpreadsContractByKey(this.programs.Spreads, key)];
                    case 7:
                        optionMarket = _a.apply(void 0, [_b.sent()]);
                        return [3 /*break*/, 9];
                    case 8: throw new Error("options protocol not supported");
                    case 9:
                        if (!optionMarket) {
                            throw new Error("option market does not exist");
                        }
                        return [2 /*return*/, optionMarket];
                }
            });
        });
    };
    FriktionSDK.prototype.loadOptionsSDKByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var optionMarket, rawContractWithKey, protocol;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getOptionMarketByKey(key)];
                    case 1:
                        optionMarket = _a.sent();
                        rawContractWithKey = tslib_1.__assign({ key: optionMarket.key }, optionMarket.rawContract);
                        protocol = optionMarket.protocol;
                        if (protocol === "Inertia") {
                            return [2 /*return*/, new _1.InertiaSDK(rawContractWithKey, {
                                    provider: this.readonlyProvider,
                                })];
                        }
                        else if (protocol === "Soloptions") {
                            return [2 /*return*/, this.loadSoloptionsSDK(rawContractWithKey)];
                        }
                        else if (protocol === "Spreads") {
                            return [2 /*return*/, new _1.SpreadsSDK(rawContractWithKey, {
                                    provider: this.readonlyProvider,
                                })];
                        }
                        else {
                            throw new Error("option markets protocol not supported");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FriktionSDK.prototype.loadSpreadsSDK = function (spreadsContract) {
        return new _1.SpreadsSDK(spreadsContract, {
            provider: this.readonlyProvider,
            network: this.network,
        });
    };
    FriktionSDK.prototype.loadSpreadsSDKBykey = function (spreadsContractKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var spreadsContract, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = [{}];
                        return [4 /*yield*/, (0, spreadsUtils_1.getSpreadsContractByKey)(this.programs.Spreads, spreadsContractKey)];
                    case 1:
                        spreadsContract = tslib_1.__assign.apply(void 0, [tslib_1.__assign.apply(void 0, _a.concat([(_b.sent())])), { key: spreadsContractKey }]);
                        return [2 /*return*/, this.loadSpreadsSDK(spreadsContract)];
                }
            });
        });
    };
    FriktionSDK.prototype.loadInertiaSDK = function (inertiaContract) {
        return new _1.InertiaSDK(inertiaContract, {
            provider: this.readonlyProvider,
            network: this.network,
        });
    };
    FriktionSDK.prototype.loadInertiaSDKByKey = function (optionContractKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var inertiaContract, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = [{}];
                        return [4 /*yield*/, (0, inertiaUtils_1.getInertiaContractByKey)(this.programs.Inertia, optionContractKey)];
                    case 1:
                        inertiaContract = tslib_1.__assign.apply(void 0, [tslib_1.__assign.apply(void 0, _a.concat([(_b.sent())])), { key: optionContractKey }]);
                        return [2 /*return*/, this.loadInertiaSDK(inertiaContract)];
                }
            });
        });
    };
    FriktionSDK.prototype.loadSoloptionsSDK = function (soloptionsContract) {
        return new _1.SoloptionsSDK(this, soloptionsContract);
    };
    FriktionSDK.prototype.loadSoloptionsSDKByKey = function (optionMarketKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var soloptionsContract, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = [{}];
                        return [4 /*yield*/, (0, soloptionsUtils_1.getSoloptionsContractByKey)(this.programs.Soloptions, optionMarketKey)];
                    case 1:
                        soloptionsContract = tslib_1.__assign.apply(void 0, [tslib_1.__assign.apply(void 0, _a.concat([(_b.sent())])), { key: optionMarketKey }]);
                        return [2 /*return*/, this.loadSoloptionsSDK(soloptionsContract)];
                }
            });
        });
    };
    FriktionSDK.prototype.getAllSoloptionsSDKs = function () {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accts;
            var _this = this;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, ((_c = (_b = (_a = this.programs.Soloptions) === null || _a === void 0 ? void 0 : _a.account) === null || _b === void 0 ? void 0 : _b.optionsContract) === null || _c === void 0 ? void 0 : _c.all())];
                    case 1:
                        accts = (_d.sent());
                        return [2 /*return*/, accts.map(function (acct) {
                                return _this.loadSoloptionsSDK(tslib_1.__assign(tslib_1.__assign({}, acct.account), { key: acct.publicKey }));
                            })];
                }
            });
        });
    };
    FriktionSDK.prototype.getWhitelist = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var whitelist;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.programs.Volt.account.whitelist.fetch(key)];
                    case 1:
                        whitelist = _a.sent();
                        return [2 /*return*/, whitelist];
                }
            });
        });
    };
    FriktionSDK.prototype.initWhitelist = function (user, seed) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder, _a, whitelistKey, _whitelistBump, initWhitelistAccounts, instruction;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        // If desired, change the SDK to allow custom seed
                        if (!seed)
                            seed = new web3_js_1.Keypair().publicKey;
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([seed.toBuffer(), textEncoder.encode("whitelist")], this.programs.Volt.programId)];
                    case 1:
                        _a = _b.sent(), whitelistKey = _a[0], _whitelistBump = _a[1];
                        initWhitelistAccounts = {
                            authority: user,
                            seed: seed,
                            whitelist: whitelistKey,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                            systemProgram: web3_js_1.SystemProgram.programId,
                        };
                        instruction = this.programs.Volt.instruction.initWhitelist({
                            accounts: initWhitelistAccounts,
                        });
                        return [2 /*return*/, {
                                instruction: instruction,
                                whitelistKey: whitelistKey,
                            }];
                }
            });
        });
    };
    FriktionSDK.prototype.addWhitelist = function (user, whitelistKey, keyToAdd) {
        var addWhitelistAccounts = {
            authority: user,
            whitelist: whitelistKey,
            accountToAdd: keyToAdd,
            systemProgram: web3_js_1.SystemProgram.programId,
        };
        var instruction = this.programs.Volt.instruction.addWhitelist({
            accounts: addWhitelistAccounts,
        });
        return instruction;
    };
    FriktionSDK.prototype.removeWhitelist = function (user, whitelistKey, keyToRemove) {
        var removeWhitelistAccounts = {
            authority: user,
            whitelist: whitelistKey,
            accountToRemove: keyToRemove,
            systemProgram: web3_js_1.SystemProgram.programId,
        };
        var instruction = this.programs.Volt.instruction.removeWhitelist({
            accounts: removeWhitelistAccounts,
        });
        return instruction;
    };
    /**
     * Parses Solana transaction logs and searches for error codes. Searches through
     * the IDL and also through the Anchor error codes.
     *
     * TODO: Solana program error  codes
     *
     * Example log:
     * const logs = [
     *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb invoke [1]",
     *   "Program log: blah blah",
     *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb consumed 85219 of 200000 compute units",
     *   "Program eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb failed: custom program error: 0x137",
     * ];
     *
     * Example output: Program error in "foobar": some human readable error message from the idl (eXG25BiDGSeGJet8PhShgwxCy9gvSVRBDL4um2LfSQb 0x137 = 311)
     */
    FriktionSDK.parseError = function (logs) {
        for (var _i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
            var log = logs_1[_i];
            var customProgramErrorMatch = log.match(/Program ([a-zA-Z0-9]{43,44}) failed: custom program error: (0x[0-9a-z]*)/);
            if (customProgramErrorMatch &&
                customProgramErrorMatch[1] &&
                customProgramErrorMatch[2]) {
                var programId = customProgramErrorMatch[1];
                var errorCodeHex = customProgramErrorMatch[2];
                var errorCodeDec = Number(errorCodeHex);
                var anchorErrorMessage = (0, errorCodes_1.checkAnchorErrorCode)(errorCodeDec);
                if (anchorErrorMessage) {
                    var idl_1 = constants_1.FRIKTION_IDLS[programId];
                    var prefix = idl_1
                        ? "Program error in \"".concat(idl_1.name)
                        : "Program error in unknown program";
                    var mainMessage = "".concat(prefix, ": ").concat(anchorErrorMessage);
                    var extraDetails = "".concat(programId, " error code ").concat(errorCodeHex, " = ").concat(errorCodeDec);
                    return {
                        fullMessage: "".concat(mainMessage, " (").concat(extraDetails, ")"),
                        mainMessage: mainMessage,
                        extraDetails: extraDetails,
                    };
                }
                var idl = constants_1.FRIKTION_IDLS["Volt"]; // VOLT2: Support multiple volts
                if (idl && idl.errors) {
                    for (var _a = 0, _b = idl.errors; _a < _b.length; _a++) {
                        var error = _b[_a];
                        if (error.code === errorCodeDec && error.msg) {
                            var mainMessage = "Program error in \"".concat(idl.name, "\": ").concat(error.msg);
                            var extraDetails = "".concat(programId, " erred with ").concat(errorCodeHex, " = ").concat(errorCodeDec);
                            return {
                                fullMessage: "".concat(mainMessage, " (").concat(extraDetails, ")"),
                                mainMessage: mainMessage,
                                extraDetails: extraDetails,
                            };
                        }
                    }
                }
            }
        }
        return null;
    };
    return FriktionSDK;
}());
exports.FriktionSDK = FriktionSDK;
