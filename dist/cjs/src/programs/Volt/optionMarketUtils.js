"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStrikeFromOptionsContract = void 0;
var tslib_1 = require("tslib");
var spl_token_1 = require("@solana/spl-token");
var decimal_js_1 = tslib_1.__importDefault(require("decimal.js"));
// export const getExerciseIxForOptionMarket = (
//   optionMarket: GenericOptionsContractWithKey,
//   sdk: FriktionSDK
// ): TransactionInstruction => {
//   const protocol = optionMarket.protocol;
//   const rawContractWithKey = {
//     key: optionMarket.key,
//     ...optionMarket.rawContract,
//   };
//   if (protocol === "Inertia") {
//     return new InertiaSDK(rawContractWithKey as InertiaContractWithKey, {
//       provider: sdk.readonlyProvider,
//     });
//   } else if (protocol === "Soloptions") {
//     return sdk.loadSoloptionsSDK(
//       rawContractWithKey as SoloptionsContractWithKey
//     );
//   } else if (protocol === "Spreads") {
//     return new SpreadsSDK(rawContractWithKey as SpreadsContractWithKey, {
//       provider: sdk.readonlyProvider,
//     }).exercise();
//   }
// };
var getStrikeFromOptionsContract = function (provider, optionMarket, isCall) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var underlyingFactor, _a, _b, quoteFactor, _c, _d;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _b = (_a = new decimal_js_1.default(10)).pow;
                return [4 /*yield*/, (0, spl_token_1.getMint)(provider.connection, optionMarket.underlyingAssetMint)];
            case 1:
                underlyingFactor = _b.apply(_a, [(_e.sent())
                        .decimals]);
                _d = (_c = new decimal_js_1.default(10)).pow;
                return [4 /*yield*/, (0, spl_token_1.getMint)(provider.connection, optionMarket.quoteAssetMint)];
            case 2:
                quoteFactor = _d.apply(_c, [(_e.sent()).decimals]);
                return [2 /*return*/, isCall
                        ? new decimal_js_1.default(optionMarket.quoteAmountPerContract.toString())
                            .div(quoteFactor)
                            .div(new decimal_js_1.default(optionMarket.underlyingAmountPerContract.toString()).div(underlyingFactor))
                        : new decimal_js_1.default(optionMarket.underlyingAmountPerContract.toString())
                            .div(underlyingFactor)
                            .div(new decimal_js_1.default(optionMarket.quoteAmountPerContract.toString()).div(quoteFactor))];
        }
    });
}); };
exports.getStrikeFromOptionsContract = getStrikeFromOptionsContract;
