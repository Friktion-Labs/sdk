"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMint = exports.requestAndConfirmAirdrop = exports.getProgramAddress = exports.numToBigEndianByteArray = void 0;
var tslib_1 = require("tslib");
var anchor = tslib_1.__importStar(require("@project-serum/anchor"));
var web3_js_1 = require("@solana/web3.js");
var bn_js_1 = require("bn.js");
var spl_token_1 = require("@solana/spl-token");
var numToBigEndianByteArray = function (num, bits) {
    var bn = new anchor.BN(num);
    var numBuf = bn.toArrayLike(Buffer, "be");
    var buf = Buffer.alloc(bits / 8);
    numBuf.copy(buf, buf.length - numBuf.length);
    return buf;
};
exports.numToBigEndianByteArray = numToBigEndianByteArray;
var getProgramAddress = function (program, kind, underlyingMint, quoteMint, underlyingAmount, quoteAmount, expiry) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var textEncoder;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                textEncoder = new TextEncoder();
                return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([
                        textEncoder.encode(kind),
                        underlyingMint.toBuffer(),
                        quoteMint.toBuffer(),
                        new bn_js_1.BN(underlyingAmount.toString()).toBuffer("le", 8),
                        new bn_js_1.BN(quoteAmount.toString()).toBuffer("le", 8),
                        new bn_js_1.BN(expiry.toString()).toBuffer("le", 8),
                    ], program.programId)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getProgramAddress = getProgramAddress;
var requestAndConfirmAirdrop = function (connection, address, amount) {
    if (amount === void 0) { amount = web3_js_1.LAMPORTS_PER_SOL; }
    return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var fromAirdropSignature;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.requestAirdrop(address, amount)];
                case 1:
                    fromAirdropSignature = _a.sent();
                    return [4 /*yield*/, connection.confirmTransaction(fromAirdropSignature)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.requestAndConfirmAirdrop = requestAndConfirmAirdrop;
var createMint = function (connection, mintAuthority) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var payer;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payer = anchor.web3.Keypair.generate();
                return [4 /*yield*/, (0, exports.requestAndConfirmAirdrop)(connection, payer.publicKey, web3_js_1.LAMPORTS_PER_SOL * 10)];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, spl_token_1.createMint)(connection, payer, mintAuthority, mintAuthority, 9)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.createMint = createMint;
