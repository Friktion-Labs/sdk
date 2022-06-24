"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpreadsContractByKeyOrNull = exports.getSpreadsContractByKey = exports.convertSpreadsContractToOptionMarket = void 0;
var tslib_1 = require("tslib");
var bn_js_1 = tslib_1.__importDefault(require("bn.js"));
var convertSpreadsContractToOptionMarket = function (spreadsContract) {
    return {
        optionMint: spreadsContract.optionMint,
        writerTokenMint: spreadsContract.writerMint,
        underlyingAssetMint: spreadsContract.underlyingMint,
        quoteAssetMint: spreadsContract.quoteMint,
        underlyingAssetPool: spreadsContract.underlyingPool,
        quoteAssetPool: spreadsContract.underlyingPool,
        mintFeeAccount: spreadsContract.mintFeeAccount,
        exerciseFeeAccount: spreadsContract.exerciseFeeAccount,
        underlyingAmountPerContract: new bn_js_1.default(0),
        quoteAmountPerContract: new bn_js_1.default(0),
        expirationUnixTimestamp: spreadsContract.expiryTs,
        expired: false,
        key: spreadsContract.key,
        claimablePool: spreadsContract.claimablePool,
        underlyingPool: spreadsContract.underlyingPool,
        bumpSeed: spreadsContract.contractBump,
        protocol: "Spreads",
        rawContract: spreadsContract,
    };
};
exports.convertSpreadsContractToOptionMarket = convertSpreadsContractToOptionMarket;
var getSpreadsContractByKey = function (program, key) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var spreadsContract;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, program.account.spreadsContract.fetch(key)];
            case 1:
                spreadsContract = _a.sent();
                return [2 /*return*/, spreadsContract];
        }
    });
}); };
exports.getSpreadsContractByKey = getSpreadsContractByKey;
var getSpreadsContractByKeyOrNull = function (program, key) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var contract, err_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                contract = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, exports.getSpreadsContractByKey)(program, key)];
            case 2:
                contract = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log(err_1);
                return [2 /*return*/, null];
            case 4:
                if (!contract)
                    return [2 /*return*/, null];
                return [2 /*return*/, tslib_1.__assign(tslib_1.__assign({}, contract), { key: key })];
        }
    });
}); };
exports.getSpreadsContractByKeyOrNull = getSpreadsContractByKeyOrNull;
