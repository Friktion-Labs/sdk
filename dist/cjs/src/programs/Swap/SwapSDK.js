"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapSDK = exports.DefaultSwapSDKOpts = void 0;
var tslib_1 = require("tslib");
var friktion_utils_1 = require("@friktion-labs/friktion-utils");
var anchor_1 = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var constants_1 = require("../../constants");
exports.DefaultSwapSDKOpts = {
    network: "mainnet-beta",
};
var SwapSDK = /** @class */ (function () {
    function SwapSDK(swapOrder, swapOrderKey, opts) {
        var defaultedOpts = Object.assign({}, opts, exports.DefaultSwapSDKOpts);
        this.readonlyProvider = (0, friktion_utils_1.providerToAnchorProvider)(defaultedOpts.provider);
        this.network = !opts.network
            ? "mainnet-beta"
            : opts.network === "testnet" || opts.network === "localnet"
                ? "mainnet-beta"
                : opts.network;
        var SimpleSwap = new anchor_1.Program(constants_1.OTHER_IDLS.SimpleSwap, constants_1.SIMPLE_SWAP_PROGRAM_ID, this.readonlyProvider);
        this.program = SimpleSwap;
        this.swapOrder = swapOrder;
        this.swapOrderKey = swapOrderKey;
    }
    SwapSDK.prototype.getUserOrdersByKey = function (key) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var acct, ret;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.program.account.userOrders.fetch(key)];
                    case 1:
                        acct = _a.sent();
                        ret = tslib_1.__assign(tslib_1.__assign({}, acct), { key: key });
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    SwapSDK.findSwapOrderAddress = function (user, orderId, swapProgramId) {
        if (swapProgramId === void 0) { swapProgramId = constants_1.SIMPLE_SWAP_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([
                                textEncoder.encode("swapOrder"),
                                user.toBuffer(),
                                orderId.toBuffer("le", 8),
                            ], swapProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SwapSDK.findGivePoolAddress = function (swapOrderKey, swapProgramId) {
        if (swapProgramId === void 0) { swapProgramId = constants_1.SIMPLE_SWAP_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([textEncoder.encode("givePool"), swapOrderKey.toBuffer()], swapProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SwapSDK.findReceivePoolAddress = function (swapOrderKey, swapProgramId) {
        if (swapProgramId === void 0) { swapProgramId = constants_1.SIMPLE_SWAP_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([textEncoder.encode("receivePool"), swapOrderKey.toBuffer()], swapProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SwapSDK.findUserOrdersAddress = function (user, swapProgramId) {
        if (swapProgramId === void 0) { swapProgramId = constants_1.SIMPLE_SWAP_PROGRAM_ID; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var textEncoder;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        textEncoder = new TextEncoder();
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([textEncoder.encode("userOrders"), user.toBuffer()], swapProgramId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SwapSDK.create = function (sdk, user, giveMint, receiveMint, creatorGivePool, giveSize, receiveSize, expiry, counterparty, whitelistTokenMint) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var orderId, userOrdersKey, userOrders, err_1, swapOrderKey, givePoolKey, receivePoolKey, accounts, instruction;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, SwapSDK.findUserOrdersAddress(user)];
                    case 1:
                        userOrdersKey = (_c.sent())[0];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, sdk.loadUserOrdersByKey(userOrdersKey)];
                    case 3:
                        userOrders = _c.sent();
                        orderId = new anchor_1.BN(userOrders.currOrderId);
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _c.sent();
                        console.log(err_1);
                        orderId = new anchor_1.BN(0);
                        return [3 /*break*/, 5];
                    case 5:
                        console.log("order id = ", orderId.toString());
                        return [4 /*yield*/, SwapSDK.findSwapOrderAddress(user, orderId)];
                    case 6:
                        swapOrderKey = (_c.sent())[0];
                        return [4 /*yield*/, SwapSDK.findGivePoolAddress(swapOrderKey)];
                    case 7:
                        givePoolKey = (_c.sent())[0];
                        return [4 /*yield*/, SwapSDK.findReceivePoolAddress(swapOrderKey)];
                    case 8:
                        receivePoolKey = (_c.sent())[0];
                        accounts = {
                            payer: user,
                            authority: user,
                            userOrders: userOrdersKey,
                            swapOrder: swapOrderKey,
                            givePool: givePoolKey,
                            receivePool: receivePoolKey,
                            giveMint: giveMint,
                            receiveMint: receiveMint,
                            creatorGivePool: creatorGivePool,
                            counterparty: counterparty !== null && counterparty !== void 0 ? counterparty : web3_js_1.SystemProgram.programId,
                            whitelistTokenMint: whitelistTokenMint !== null && whitelistTokenMint !== void 0 ? whitelistTokenMint : constants_1.GLOBAL_MM_TOKEN_MINT,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        };
                        return [4 /*yield*/, ((_b = (_a = sdk.programs.SimpleSwap.methods).create) === null || _b === void 0 ? void 0 : _b.call(_a, giveSize, receiveSize, new anchor_1.BN(expiry), counterparty !== undefined, whitelistTokenMint !== undefined).accounts(accounts).instruction())];
                    case 9:
                        instruction = (_c.sent());
                        Object.entries(accounts).forEach(function (e) { var _a; return console.log(e[0].toString(), " = ", (_a = e[1]) === null || _a === void 0 ? void 0 : _a.toString()); });
                        return [2 /*return*/, {
                                instruction: instruction,
                                swapOrderKey: swapOrderKey,
                            }];
                }
            });
        });
    };
    SwapSDK.prototype.exec = function (user, giveTokenAccount, receiveTokenAccount, whitelistTokenAccount) {
        if (whitelistTokenAccount === undefined) {
            if (this.swapOrder.isWhitelisted) {
                throw new Error("whitelist token account must be given if swap order is whitelisted");
            }
            whitelistTokenAccount = web3_js_1.SystemProgram.programId;
        }
        var execAccounts = {
            authority: user,
            swapOrder: this.swapOrderKey,
            givePool: this.swapOrder.givePool,
            receivePool: this.swapOrder.receivePool,
            counterpartyReceivePool: receiveTokenAccount,
            counterpartyGivePool: giveTokenAccount,
            whitelistTokenAccount: whitelistTokenAccount,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        };
        return this.program.instruction.exec({
            accounts: execAccounts,
        });
    };
    SwapSDK.prototype.claim = function (user, giveTokenAccount, receiveTokenAccount) {
        var claimAccounts = {
            givePool: this.swapOrder.givePool,
            receivePool: this.swapOrder.receivePool,
            authority: user,
            swapOrder: this.swapOrderKey,
            creatorGivePool: giveTokenAccount,
            creatorReceivePool: receiveTokenAccount,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        };
        return this.program.instruction.claim({
            accounts: claimAccounts,
        });
    };
    SwapSDK.prototype.cancel = function (user, giveTokenAccount) {
        var cancelAccounts = {
            givePool: this.swapOrder.givePool,
            receivePool: this.swapOrder.receivePool,
            authority: user,
            swapOrder: this.swapOrderKey,
            creatorGivePool: giveTokenAccount,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        };
        return this.program.instruction.cancel({
            accounts: cancelAccounts,
        });
    };
    return SwapSDK;
}());
exports.SwapSDK = SwapSDK;
