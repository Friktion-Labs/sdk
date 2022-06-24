"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeOption = void 0;
var tslib_1 = require("tslib");
var anchor = tslib_1.__importStar(require("@project-serum/anchor"));
var web3_js_1 = require("@solana/web3.js");
var spl_token_1 = require("@solana/spl-token");
var writeOption = function (program, contract, params) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var amount, writerAccount, writerUnderlyingFundingTokens, writerTokenDestination, optionTokenDestination, feeDestination;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                amount = params.amount, writerAccount = params.writerAccount, writerUnderlyingFundingTokens = params.writerUnderlyingFundingTokens, writerTokenDestination = params.writerTokenDestination, optionTokenDestination = params.optionTokenDestination, feeDestination = params.feeDestination;
                console.log("fee destination = ", feeDestination.toString());
                return [4 /*yield*/, program.rpc.optionWrite(new anchor.BN(amount), {
                        accounts: {
                            contract: contract.key,
                            optionMint: contract.optionMint,
                            quoteMint: contract.quoteMint,
                            optionTokenDestination: optionTokenDestination,
                            underlyingMint: contract.underlyingMint,
                            underlyingPool: contract.underlyingPool,
                            writerMint: contract.writerMint,
                            writerTokenDestination: writerTokenDestination,
                            writerAuthority: writerAccount
                                ? writerAccount.publicKey
                                : program.provider.wallet.publicKey,
                            userUnderlyingFundingTokens: writerUnderlyingFundingTokens,
                            feeDestination: feeDestination,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        },
                        signers: writerAccount ? [writerAccount] : undefined,
                    })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.writeOption = writeOption;
