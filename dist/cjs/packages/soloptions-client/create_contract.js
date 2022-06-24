"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContract = exports.newContractInstruction = void 0;
var tslib_1 = require("tslib");
var anchor = tslib_1.__importStar(require("@project-serum/anchor"));
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var spl_token_2 = require("@solana/spl-token");
var util_1 = require("./util");
var newContractInstruction = function (program, params) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var underlyingMint, quoteMint, underlyingAmount, quoteAmount, mintFeeAccount, exerciseFeeAccount, expiryTs, payer, seeds, _a, contract, contractBump, _b, optionMint, optionBump, _c, writerMint, writerBump, underlyingPool, quotePool, extraKeys, contractStruct, newContractIx;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                underlyingMint = params.underlyingMint, quoteMint = params.quoteMint, underlyingAmount = params.underlyingAmount, quoteAmount = params.quoteAmount, mintFeeAccount = params.mintFeeAccount, exerciseFeeAccount = params.exerciseFeeAccount, expiryTs = params.expiryTs, payer = params.payer;
                seeds = [
                    underlyingMint,
                    quoteMint,
                    underlyingAmount,
                    quoteAmount,
                    expiryTs,
                ];
                return [4 /*yield*/, util_1.getProgramAddress.apply(void 0, tslib_1.__spreadArray([program,
                        "OptionsContract"], seeds, false))];
            case 1:
                _a = _d.sent(), contract = _a[0], contractBump = _a[1];
                return [4 /*yield*/, util_1.getProgramAddress.apply(void 0, tslib_1.__spreadArray([program,
                        "OptionMint"], seeds, false))];
            case 2:
                _b = _d.sent(), optionMint = _b[0], optionBump = _b[1];
                return [4 /*yield*/, util_1.getProgramAddress.apply(void 0, tslib_1.__spreadArray([program,
                        "WriterMint"], seeds, false))];
            case 3:
                _c = _d.sent(), writerMint = _c[0], writerBump = _c[1];
                return [4 /*yield*/, (0, spl_token_2.getAssociatedTokenAddress)(underlyingMint, contract, true)];
            case 4:
                underlyingPool = _d.sent();
                return [4 /*yield*/, (0, spl_token_2.getAssociatedTokenAddress)(quoteMint, contract, true)];
            case 5:
                quotePool = _d.sent();
                extraKeys = web3_js_1.SystemProgram.programId;
                contractStruct = tslib_1.__assign(tslib_1.__assign({}, params), { expiryTs: new anchor.BN(expiryTs), underlyingAmount: new anchor.BN(params.underlyingAmount), quoteAmount: new anchor.BN(params.quoteAmount), key: contract, underlyingPool: underlyingPool, quotePool: quotePool, writerMint: writerMint, optionMint: optionMint, contractBump: contractBump, optionBump: optionBump, writerBump: writerBump, extraKey1: extraKeys, extraKey2: extraKeys, extraInt1: new anchor.BN(0), extraInt2: new anchor.BN(0), extraBool: false });
                newContractIx = program.instruction.newContract(params.underlyingAmount, params.quoteAmount, new anchor.BN(expiryTs), contractBump, optionBump, writerBump, {
                    accounts: {
                        payer: payer
                            ? payer.publicKey
                            : program.provider.wallet.publicKey,
                        contract: contract,
                        writerMint: writerMint,
                        optionMint: optionMint,
                        quoteMint: quoteMint,
                        underlyingMint: underlyingMint,
                        quotePool: quotePool,
                        underlyingPool: underlyingPool,
                        mintFeeAccount: mintFeeAccount,
                        exerciseFeeAccount: exerciseFeeAccount,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    },
                });
                return [2 /*return*/, {
                        ix: newContractIx,
                        contract: contractStruct,
                    }];
        }
    });
}); };
exports.newContractInstruction = newContractInstruction;
var newContract = function (program, params) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var underlyingMint, quoteMint, underlyingAmount, quoteAmount, mintFeeAccount, exerciseFeeAccount, expiryTs, payer, seeds, _a, contract, contractBump, _b, optionMint, optionBump, _c, writerMint, writerBump, underlyingPool, quotePool, extraKeys;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                underlyingMint = params.underlyingMint, quoteMint = params.quoteMint, underlyingAmount = params.underlyingAmount, quoteAmount = params.quoteAmount, mintFeeAccount = params.mintFeeAccount, exerciseFeeAccount = params.exerciseFeeAccount, expiryTs = params.expiryTs, payer = params.payer;
                seeds = [
                    underlyingMint,
                    quoteMint,
                    underlyingAmount,
                    quoteAmount,
                    expiryTs,
                ];
                return [4 /*yield*/, util_1.getProgramAddress.apply(void 0, tslib_1.__spreadArray([program,
                        "OptionsContract"], seeds, false))];
            case 1:
                _a = _d.sent(), contract = _a[0], contractBump = _a[1];
                return [4 /*yield*/, util_1.getProgramAddress.apply(void 0, tslib_1.__spreadArray([program,
                        "OptionMint"], seeds, false))];
            case 2:
                _b = _d.sent(), optionMint = _b[0], optionBump = _b[1];
                return [4 /*yield*/, util_1.getProgramAddress.apply(void 0, tslib_1.__spreadArray([program,
                        "WriterMint"], seeds, false))];
            case 3:
                _c = _d.sent(), writerMint = _c[0], writerBump = _c[1];
                return [4 /*yield*/, (0, spl_token_2.getAssociatedTokenAddress)(underlyingMint, contract, true)];
            case 4:
                underlyingPool = _d.sent();
                return [4 /*yield*/, (0, spl_token_2.getAssociatedTokenAddress)(quoteMint, contract, true)];
            case 5:
                quotePool = _d.sent();
                // @ts-ignore
                return [4 /*yield*/, program.rpc.newContract(params.underlyingAmount, params.quoteAmount, new anchor.BN(expiryTs), contractBump, optionBump, writerBump, {
                        accounts: {
                            payer: payer
                                ? payer.publicKey
                                : program.provider.wallet.publicKey,
                            contract: contract,
                            writerMint: writerMint,
                            optionMint: optionMint,
                            quoteMint: quoteMint,
                            underlyingMint: underlyingMint,
                            quotePool: quotePool,
                            underlyingPool: underlyingPool,
                            mintFeeAccount: mintFeeAccount,
                            exerciseFeeAccount: exerciseFeeAccount,
                            systemProgram: anchor.web3.SystemProgram.programId,
                            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                        },
                        signers: payer ? [payer] : undefined,
                    })];
            case 6:
                // @ts-ignore
                _d.sent();
                extraKeys = web3_js_1.SystemProgram.programId;
                return [2 /*return*/, tslib_1.__assign(tslib_1.__assign({}, params), { expiryTs: new anchor.BN(expiryTs), underlyingAmount: new anchor.BN(params.underlyingAmount), quoteAmount: new anchor.BN(params.quoteAmount), key: contract, underlyingPool: underlyingPool, quotePool: quotePool, writerMint: writerMint, optionMint: optionMint, contractBump: contractBump, optionBump: optionBump, writerBump: writerBump, extraKey1: extraKeys, extraKey2: extraKeys, extraInt1: new anchor.BN(0), extraInt2: new anchor.BN(0), extraBool: false })];
        }
    });
}); };
exports.newContract = newContract;
