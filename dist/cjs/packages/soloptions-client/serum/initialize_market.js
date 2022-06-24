"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeMarket = void 0;
var tslib_1 = require("tslib");
var anchor_1 = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var friktion_sdk_1 = require("@friktion-labs/friktion-sdk");
var spl_token_2 = require("@solana/spl-token");
var getProgramAddresses = function (program, optionContract, serumDex) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, serumMarket, serumMarketBump, _b, requestQueue, requestQueueBump;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([optionContract.toBuffer(), Buffer.from("serumMarket")], program.programId)];
            case 1:
                _a = _c.sent(), serumMarket = _a[0], serumMarketBump = _a[1];
                return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([optionContract.toBuffer(), Buffer.from("requestQueue")], program.programId)];
            case 2:
                _b = _c.sent(), requestQueue = _b[0], requestQueueBump = _b[1];
                return [2 /*return*/, { requestQueue: requestQueue, requestQueueBump: requestQueueBump, serumMarket: serumMarket, serumMarketBump: serumMarketBump }];
        }
    });
}); };
var initializeMarket = function (program, provider, params) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, requestQueue, requestQueueBump, serumMarket, serumMarketBump, _b, vaultOwner, vaultSignerNonce, baseVault, quoteVault, eventQueue, asks, bids, wallet, instructions, signers, eventQueueKeys, ix, _c, _d, bidsKeys, ix, _e, _f, asksKeys, ix, _g, _h, accounts, baseLotSize, tx;
    var _j, _k, _l;
    return tslib_1.__generator(this, function (_m) {
        switch (_m.label) {
            case 0: return [4 /*yield*/, getProgramAddresses(program, params.optionContract, params.serumProgram)];
            case 1:
                _a = _m.sent(), requestQueue = _a.requestQueue, requestQueueBump = _a.requestQueueBump, serumMarket = _a.serumMarket, serumMarketBump = _a.serumMarketBump;
                return [4 /*yield*/, (0, friktion_sdk_1.getVaultOwnerAndNonce)(serumMarket, params.serumProgram)];
            case 2:
                _b = _m.sent(), vaultOwner = _b[0], vaultSignerNonce = _b[1];
                return [4 /*yield*/, (0, spl_token_2.getAssociatedTokenAddress)(params.optionMint, vaultOwner, true)];
            case 3:
                baseVault = _m.sent();
                return [4 /*yield*/, (0, spl_token_2.getAssociatedTokenAddress)(params.quoteCurrencyMint, vaultOwner, true)];
            case 4:
                quoteVault = _m.sent();
                eventQueue = params.eventQueue, asks = params.asks, bids = params.bids;
                wallet = provider.wallet;
                instructions = [];
                signers = [];
                if (!!eventQueue) return [3 /*break*/, 6];
                eventQueueKeys = new web3_js_1.Keypair();
                eventQueue = eventQueueKeys.publicKey;
                _d = (_c = web3_js_1.SystemProgram).createAccount;
                _j = {
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: eventQueue
                };
                return [4 /*yield*/, program.provider.connection.getMinimumBalanceForRentExemption(262144 + 12)];
            case 5:
                ix = _d.apply(_c, [(_j.lamports = _m.sent(),
                        _j.space = 262144 + 12,
                        _j.programId = params.serumProgram,
                        _j)]);
                instructions.push(ix);
                signers.push(eventQueueKeys);
                _m.label = 6;
            case 6:
                if (!!bids) return [3 /*break*/, 8];
                bidsKeys = new web3_js_1.Keypair();
                bids = bidsKeys.publicKey;
                _f = (_e = web3_js_1.SystemProgram).createAccount;
                _k = {
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: bids
                };
                return [4 /*yield*/, program.provider.connection.getMinimumBalanceForRentExemption(65536 + 12)];
            case 7:
                ix = _f.apply(_e, [(_k.lamports = _m.sent(),
                        _k.space = 65536 + 12,
                        _k.programId = params.serumProgram,
                        _k)]);
                instructions.push(ix);
                signers.push(bidsKeys);
                _m.label = 8;
            case 8:
                if (!!asks) return [3 /*break*/, 10];
                asksKeys = new web3_js_1.Keypair();
                asks = asksKeys.publicKey;
                _h = (_g = web3_js_1.SystemProgram).createAccount;
                _l = {
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: asks
                };
                return [4 /*yield*/, program.provider.connection.getMinimumBalanceForRentExemption(65536 + 12)];
            case 9:
                ix = _h.apply(_g, [(_l.lamports = _m.sent(),
                        _l.space = 65536 + 12,
                        _l.programId = params.serumProgram,
                        _l)]);
                instructions.push(ix);
                signers.push(asksKeys);
                _m.label = 10;
            case 10:
                accounts = {
                    payer: wallet.publicKey,
                    contract: params.optionContract,
                    serumMarket: serumMarket,
                    dexProgram: params.serumProgram,
                    quoteMint: params.quoteCurrencyMint,
                    optionMint: params.optionMint,
                    requestQueue: requestQueue,
                    eventQueue: eventQueue,
                    bids: bids,
                    asks: asks,
                    optionVault: baseVault,
                    quoteVault: quoteVault,
                    serumMarketAuthority: serumMarket,
                    vaultSigner: vaultOwner,
                    rent: anchor_1.web3.SYSVAR_RENT_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                };
                baseLotSize = new anchor_1.BN(1);
                return [4 /*yield*/, program.rpc.createSerumMarket(vaultSignerNonce, baseLotSize, params.quoteCurrencyLotSize, params.quoteCurrencyDustLimit, {
                        accounts: {
                            payer: wallet.publicKey,
                            contract: params.optionContract,
                            serumMarket: serumMarket,
                            dexProgram: params.serumProgram,
                            quoteMint: params.quoteCurrencyMint,
                            optionMint: params.optionMint,
                            requestQueue: requestQueue,
                            eventQueue: eventQueue,
                            bids: bids,
                            asks: asks,
                            optionVault: baseVault,
                            quoteVault: quoteVault,
                            serumMarketAuthority: serumMarket,
                            vaultSigner: vaultOwner,
                            rent: anchor_1.web3.SYSVAR_RENT_PUBKEY,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                        },
                        signers: signers,
                        instructions: instructions,
                    })];
            case 11:
                tx = _m.sent();
                return [2 /*return*/, tslib_1.__assign(tslib_1.__assign({}, params), { tx: tx, serumMarket: serumMarket, eventQueue: eventQueue, bids: bids, asks: asks, quoteVault: quoteVault })];
        }
    });
}); };
exports.initializeMarket = initializeMarket;
