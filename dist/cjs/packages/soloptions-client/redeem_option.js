"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemOption = void 0;
var tslib_1 = require("tslib");
var anchor = tslib_1.__importStar(require("@project-serum/anchor"));
var spl_token_1 = require("@solana/spl-token");
var redeemOption = function (program, contract, params) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var redeemerAccount, underlyingTokenDestination, quoteTokenDestination, redeemerTokenSource;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                redeemerAccount = params.redeemerAccount, underlyingTokenDestination = params.underlyingTokenDestination, quoteTokenDestination = params.quoteTokenDestination, redeemerTokenSource = params.redeemerTokenSource;
                return [4 /*yield*/, program.rpc.optionRedeem(new anchor.BN(1), {
                        accounts: {
                            contract: contract.key,
                            redeemerAuthority: redeemerAccount
                                ? redeemerAccount.publicKey
                                : program.provider.wallet.publicKey,
                            writerMint: contract.writerMint,
                            contractUnderlyingTokens: contract.underlyingPool,
                            contractQuoteTokens: contract.quotePool,
                            writerTokenSource: redeemerTokenSource,
                            underlyingTokenDestination: underlyingTokenDestination,
                            quoteTokenDestination: quoteTokenDestination,
                            underlyingMint: contract.underlyingMint,
                            quoteMint: contract.quoteMint,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                        },
                        signers: redeemerAccount ? [redeemerAccount] : undefined,
                    })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.redeemOption = redeemOption;
