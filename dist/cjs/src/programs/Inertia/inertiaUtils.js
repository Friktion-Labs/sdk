"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInertiaContractByKeyOrNull = exports.getInertiaMarketByKey = exports.convertInertiaContractToOptionMarket = exports.getInertiaContractByKey = void 0;
var tslib_1 = require("tslib");
var getInertiaContractByKey = function (program, key) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
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
exports.getInertiaContractByKey = getInertiaContractByKey;
var convertInertiaContractToOptionMarket = function (inertiaContract) {
    return {
        optionMint: inertiaContract.optionMint,
        writerTokenMint: inertiaContract.writerMint,
        underlyingAssetMint: inertiaContract.underlyingMint,
        quoteAssetMint: inertiaContract.quoteMint,
        underlyingAssetPool: inertiaContract.underlyingPool,
        // quoteAssetPool not used
        quoteAssetPool: inertiaContract.underlyingPool,
        mintFeeAccount: inertiaContract.mintFeeAccount,
        exerciseFeeAccount: inertiaContract.exerciseFeeAccount,
        underlyingAmountPerContract: inertiaContract.underlyingAmount,
        quoteAmountPerContract: inertiaContract.quoteAmount,
        expirationUnixTimestamp: inertiaContract.expiryTs,
        expired: false,
        key: inertiaContract.key,
        claimablePool: inertiaContract.claimablePool,
        underlyingPool: inertiaContract.underlyingPool,
        bumpSeed: inertiaContract.contractBump,
        protocol: "Inertia",
        rawContract: inertiaContract,
    };
};
exports.convertInertiaContractToOptionMarket = convertInertiaContractToOptionMarket;
var getInertiaMarketByKey = function (program, key) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var inertiaContract, err_1, optionMarket;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.getInertiaContractByKey)(program, key)];
            case 1:
                inertiaContract = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.log(err_1);
                return [2 /*return*/, null];
            case 3:
                optionMarket = (0, exports.convertInertiaContractToOptionMarket)(tslib_1.__assign(tslib_1.__assign({}, inertiaContract), { key: key }));
                return [2 /*return*/, optionMarket];
        }
    });
}); };
exports.getInertiaMarketByKey = getInertiaMarketByKey;
var getInertiaContractByKeyOrNull = function (program, key) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var contract, err_2;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                contract = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, exports.getInertiaContractByKey)(program, key)];
            case 2:
                contract = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.log(err_2);
                return [2 /*return*/, null];
            case 4:
                if (!contract)
                    return [2 /*return*/, null];
                return [2 /*return*/, tslib_1.__assign(tslib_1.__assign({}, contract), { key: key })];
        }
    });
}); };
exports.getInertiaContractByKeyOrNull = getInertiaContractByKeyOrNull;
