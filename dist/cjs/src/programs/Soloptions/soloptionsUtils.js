"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSoloptionsContractInstruction = exports.getSoloptionsConractByKey = exports.convertSoloptionsContractToOptionMarket = exports.getSoloptionsContractByKey = void 0;
var tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
var anchor_1 = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var soloptions_client_1 = require("../../../packages/soloptions-client");
var __1 = require("../..");
var getSoloptionsContractByKey = function (program, key) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var optionsContract;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, program.account.optionsContract.fetch(key)];
            case 1:
                optionsContract = _a.sent();
                return [2 /*return*/, optionsContract];
        }
    });
}); };
exports.getSoloptionsContractByKey = getSoloptionsContractByKey;
var convertSoloptionsContractToOptionMarket = function (soloptionsContract) {
    return {
        optionMint: soloptionsContract.optionMint,
        writerTokenMint: soloptionsContract.writerMint,
        underlyingAssetMint: soloptionsContract.underlyingMint,
        quoteAssetMint: soloptionsContract.quoteMint,
        underlyingAssetPool: soloptionsContract.underlyingPool,
        quoteAssetPool: soloptionsContract.quotePool,
        mintFeeAccount: soloptionsContract.mintFeeAccount,
        exerciseFeeAccount: soloptionsContract.exerciseFeeAccount,
        underlyingAmountPerContract: soloptionsContract.underlyingAmount,
        quoteAmountPerContract: soloptionsContract.quoteAmount,
        expirationUnixTimestamp: soloptionsContract.expiryTs,
        expired: false,
        claimablePool: soloptionsContract.quotePool,
        underlyingPool: soloptionsContract.underlyingPool,
        key: soloptionsContract.key,
        bumpSeed: soloptionsContract.contractBump,
        rawContract: soloptionsContract,
        protocol: "Soloptions",
    };
};
exports.convertSoloptionsContractToOptionMarket = convertSoloptionsContractToOptionMarket;
var getSoloptionsConractByKey = function (program, key) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var soloptionsContract, err_1, optionMarket;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.getSoloptionsContractByKey)(program, key)];
            case 1:
                soloptionsContract = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.log(err_1);
                return [2 /*return*/, null];
            case 3:
                optionMarket = (0, exports.convertSoloptionsContractToOptionMarket)(tslib_1.__assign(tslib_1.__assign({}, soloptionsContract), { key: key }));
                return [2 /*return*/, optionMarket];
        }
    });
}); };
exports.getSoloptionsConractByKey = getSoloptionsConractByKey;
var createSoloptionsContractInstruction = function (program, underlyingMint, quoteMint, underlyingAmountPerContract, quoteAmountPerContract, expiry) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, createContractIx, contract, _b, _c;
    var _d;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _b = soloptions_client_1.newContractInstruction;
                _c = [program];
                _d = {
                    underlyingMint: underlyingMint,
                    quoteMint: quoteMint,
                    expiryTs: expiry,
                    underlyingAmount: new anchor_1.BN(underlyingAmountPerContract),
                    quoteAmount: new anchor_1.BN(quoteAmountPerContract)
                };
                return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(underlyingMint, __1.SOLOPTIONS_FEE_OWNER)];
            case 1:
                _d.mintFeeAccount = _e.sent();
                return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(quoteMint, __1.SOLOPTIONS_FEE_OWNER)];
            case 2: return [4 /*yield*/, _b.apply(void 0, _c.concat([(_d.exerciseFeeAccount = _e.sent(),
                        _d)]))];
            case 3:
                _a = _e.sent(), createContractIx = _a.ix, contract = _a.contract;
                return [2 /*return*/, {
                        contract: contract,
                        createContractIx: createContractIx,
                    }];
        }
    });
}); };
exports.createSoloptionsContractInstruction = createSoloptionsContractInstruction;
