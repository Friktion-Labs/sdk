"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirstSetOfAccounts = exports.getMarketAndAuthorityInfo = exports.Validation = exports.openOrdersSeed = exports.getVaultOwnerAndNonce = exports.marketLoader = exports.marketLoaderFunction = void 0;
var tslib_1 = require("tslib");
var anchor_1 = require("@project-serum/anchor");
var serum_1 = require("@project-serum/serum");
var web3_js_1 = require("@solana/web3.js");
var VoltSDK_1 = require("./VoltSDK");
/**
 * Create a MarketProxy
 *
 * @param program - Friktion program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns
 */
var marketLoaderFunction = function (sdk, whitelistTokenAccountKey) {
    return function (serumMarketKey) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var optionMarketKey, marketKey, auctionMetadataKey, marketAuthorityBump;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    optionMarketKey = sdk.voltVault.optionMarket;
                    return [4 /*yield*/, VoltSDK_1.VoltSDK.findSerumMarketAddress(sdk.voltKey, sdk.sdk.net.MM_TOKEN_MINT, optionMarketKey)];
                case 1:
                    marketKey = (_a.sent())[0];
                    if (marketKey.toString() !== serumMarketKey.toString())
                        throw new Error("serum market should equal the PDA based on current option");
                    return [4 /*yield*/, VoltSDK_1.VoltSDK.findAuctionMetadataAddress(sdk.voltKey)];
                case 2:
                    auctionMetadataKey = (_a.sent())[0];
                    return [4 /*yield*/, sdk.getMarketAndAuthorityInfo(optionMarketKey)];
                case 3:
                    marketAuthorityBump = (_a.sent()).marketAuthorityBump;
                    return [2 /*return*/, new serum_1.MarketProxyBuilder()
                            .middleware(new serum_1.OpenOrdersPda({
                            proxyProgramId: sdk.sdk.programs.Volt.programId,
                            dexProgramId: sdk.sdk.net.SERUM_DEX_PROGRAM_ID,
                        }))
                            .middleware(new serum_1.ReferralFees())
                            .middleware(new Validation(auctionMetadataKey, optionMarketKey, whitelistTokenAccountKey, marketAuthorityBump))
                            .middleware(new serum_1.Logger())
                            .load({
                            connection: sdk.sdk.readonlyProvider.connection,
                            market: marketKey,
                            dexProgramId: sdk.sdk.net.SERUM_DEX_PROGRAM_ID,
                            proxyProgramId: sdk.sdk.programs.Volt.programId,
                            options: { commitment: "recent" },
                        })];
            }
        });
    }); };
};
exports.marketLoaderFunction = marketLoaderFunction;
/**
 * Create a MarketProxy
 *
 * @param middlewareProgram - Friktion program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns
 */
var marketLoader = function (sdk, serumMarketKey, whitelistTokenAccountKey) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.marketLoaderFunction)(sdk, whitelistTokenAccountKey)(serumMarketKey)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.marketLoader = marketLoader;
var getVaultOwnerAndNonce = function (marketPublicKey, dexProgramId) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var nonce, vaultOwner, e_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nonce = new anchor_1.BN(0);
                _a.label = 1;
            case 1:
                if (!(nonce.toNumber() < 255)) return [3 /*break*/, 6];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, web3_js_1.PublicKey.createProgramAddress([marketPublicKey.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)], dexProgramId)];
            case 3:
                vaultOwner = _a.sent();
                return [2 /*return*/, [vaultOwner, nonce]];
            case 4:
                e_1 = _a.sent();
                nonce.iaddn(1);
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 1];
            case 6: throw new Error("Unable to find nonce");
        }
    });
}); };
exports.getVaultOwnerAndNonce = getVaultOwnerAndNonce;
// b"open-orders"
exports.openOrdersSeed = Buffer.from([
    111, 112, 101, 110, 45, 111, 114, 100, 101, 114, 115,
]);
var Validation = /** @class */ (function () {
    function Validation(auctionMetadataKey, optionMarketKey, whitelistKey, marketAuthorityBump) {
        this.auctionMetadataKey = auctionMetadataKey;
        this.optionMarketKey = optionMarketKey;
        this.marketAuthorityBump = marketAuthorityBump;
        this.whitelistKey = whitelistKey;
    }
    Validation.prototype.initOpenOrders = function (ix) {
        ix.data = Buffer.concat([Buffer.from([0]), ix.data]);
        this.addPdaKeys(ix);
    };
    Validation.prototype.newOrderV3 = function (ix) {
        ix.data = Buffer.concat([Buffer.from([1]), ix.data]);
        this.addPdaKeys(ix);
    };
    Validation.prototype.cancelOrderV2 = function (ix) {
        ix.data = Buffer.concat([Buffer.from([2]), ix.data]);
    };
    Validation.prototype.cancelOrderByClientIdV2 = function (ix) {
        ix.data = Buffer.concat([Buffer.from([3]), ix.data]);
    };
    Validation.prototype.settleFunds = function (ix) {
        ix.data = Buffer.concat([Buffer.from([4]), ix.data]);
    };
    Validation.prototype.closeOpenOrders = function (ix) {
        ix.data = Buffer.concat([Buffer.from([5]), ix.data]);
    };
    Validation.prototype.prune = function (ix) {
        // prepend a discriminator and the marketAuthorityBump
        var bumpBuffer = new anchor_1.BN(this.marketAuthorityBump).toBuffer("le", 1);
        ix.data = Buffer.concat([Buffer.from([6]), bumpBuffer, ix.data]);
        // prepend the optionMarket key
        this.addPdaKeys(ix);
    };
    Validation.prototype.consumeEvents = function (_ix) {
        throw new Error("Not implemented");
    };
    Validation.prototype.consumeEventsPermissioned = function (_ix) {
        throw new Error("Not implemented");
    };
    Validation.prototype.addPdaKeys = function (ix) {
        ix.keys = tslib_1.__spreadArray([
            { pubkey: this.whitelistKey, isWritable: false, isSigner: false },
            { pubkey: this.optionMarketKey, isWritable: false, isSigner: false },
            { pubkey: this.auctionMetadataKey, isWritable: false, isSigner: false }
        ], ix.keys, true);
        return ix;
    };
    return Validation;
}());
exports.Validation = Validation;
var getMarketAndAuthorityInfo = function (sdk, optionMarketKey) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sdk.getMarketAndAuthorityInfo(optionMarketKey)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getMarketAndAuthorityInfo = getMarketAndAuthorityInfo;
var createFirstSetOfAccounts = function (_a) {
    var connection = _a.connection, userKey = _a.userKey, dexProgramId = _a.dexProgramId;
    return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var eventQueue, bids, asks, instructions, _b, _c, _d, _e, _f, _g, _h, signers;
        var _j, _k, _l;
        return tslib_1.__generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    eventQueue = new web3_js_1.Keypair();
                    bids = new web3_js_1.Keypair();
                    asks = new web3_js_1.Keypair();
                    _c = (_b = web3_js_1.SystemProgram).createAccount;
                    _j = {
                        fromPubkey: userKey,
                        newAccountPubkey: eventQueue.publicKey
                    };
                    return [4 /*yield*/, connection.getMinimumBalanceForRentExemption(262144 + 12)];
                case 1:
                    _d = [
                        _c.apply(_b, [(_j.lamports = _m.sent(),
                                _j.space = 262144 + 12,
                                _j.programId = dexProgramId,
                                _j)])
                    ];
                    _f = (_e = web3_js_1.SystemProgram).createAccount;
                    _k = {
                        fromPubkey: userKey,
                        newAccountPubkey: bids.publicKey
                    };
                    return [4 /*yield*/, connection.getMinimumBalanceForRentExemption(65536 + 12)];
                case 2:
                    _d = _d.concat([
                        _f.apply(_e, [(_k.lamports = _m.sent(),
                                _k.space = 65536 + 12,
                                _k.programId = dexProgramId,
                                _k)])
                    ]);
                    _h = (_g = web3_js_1.SystemProgram).createAccount;
                    _l = {
                        fromPubkey: userKey,
                        newAccountPubkey: asks.publicKey
                    };
                    return [4 /*yield*/, connection.getMinimumBalanceForRentExemption(65536 + 12)];
                case 3:
                    instructions = _d.concat([
                        _h.apply(_g, [(_l.lamports = _m.sent(),
                                _l.space = 65536 + 12,
                                _l.programId = dexProgramId,
                                _l)])
                    ]);
                    signers = [eventQueue, bids, asks];
                    return [2 /*return*/, { instructions: instructions, eventQueue: eventQueue, bids: bids, asks: asks, signers: signers }];
            }
        });
    });
};
exports.createFirstSetOfAccounts = createFirstSetOfAccounts;
