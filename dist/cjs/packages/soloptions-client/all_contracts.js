"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveExpiryForPair = exports.getAllContracts = void 0;
var tslib_1 = require("tslib");
var getAllContracts = function (program) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var contracts;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, program.account.optionsContract.all()];
            case 1:
                contracts = (_a.sent());
                return [2 /*return*/, contracts.map(function (c) { return (tslib_1.__assign(tslib_1.__assign({}, c.account), { publicKey: c.publicKey })); })];
        }
    });
}); };
exports.getAllContracts = getAllContracts;
var getActiveExpiryForPair = function (contracts, pair) {
    return contracts
        .filter(function (c) {
        return c.underlyingMint.equals(pair.underlying) &&
            c.quoteMint.equals(pair.quote);
    })
        .map(function (c) { return c.expiryTs; });
};
exports.getActiveExpiryForPair = getActiveExpiryForPair;
// export const getActiveStrikes = (
//   contracts: Array<SoloptionsContractWithKey>,
//   pair: AssetPair,
//   expiry: number
// ) => {
//   return contracts
//     .filter(
//       (c) =>
//         c.underlyingMint.equals(pair.underlying) &&
//         c.quoteMint.equals(pair.quote) &&
//         c.expiryTs.toNumber() === expiry
//     )
//     .map((c) => c.strike);
// };
