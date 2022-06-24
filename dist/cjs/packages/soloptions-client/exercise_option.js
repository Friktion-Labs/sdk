"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exerciseOption = void 0;
var tslib_1 = require("tslib");
var anchor = tslib_1.__importStar(require("@project-serum/anchor"));
var web3_js_1 = require("@solana/web3.js");
var spl_token_1 = require("@solana/spl-token");
var exerciseOption = function (program, contract, params) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var amount, exerciserAccount, quoteTokenSource, optionTokenSource, underlyingTokenDestination, feeDestination;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                amount = params.amount, exerciserAccount = params.exerciserAccount, quoteTokenSource = params.quoteTokenSource, optionTokenSource = params.optionTokenSource, underlyingTokenDestination = params.underlyingTokenDestination, feeDestination = params.feeDestination;
                return [4 /*yield*/, program.rpc.optionExercise(new anchor.BN(amount), {
                        accounts: {
                            contract: contract.key,
                            exerciserAuthority: exerciserAccount
                                ? exerciserAccount.publicKey
                                : program.provider.wallet.publicKey,
                            quoteTokenSource: quoteTokenSource,
                            contractQuoteTokens: contract.quotePool,
                            optionMint: contract.optionMint,
                            optionTokenSource: optionTokenSource,
                            contractUnderlyingTokens: contract.underlyingPool,
                            underlyingTokenDestination: underlyingTokenDestination,
                            underlyingMint: contract.underlyingMint,
                            quoteMint: contract.quoteMint,
                            feeDestination: feeDestination,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        },
                        signers: exerciserAccount ? [exerciserAccount] : undefined,
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.exerciseOption = exerciseOption;
