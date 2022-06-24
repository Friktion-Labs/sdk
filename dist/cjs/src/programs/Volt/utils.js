"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVaultOwnerAndNonceForSpot = exports.getProgramIdForPerpProtocol = void 0;
var tslib_1 = require("tslib");
var anchor = tslib_1.__importStar(require("@project-serum/anchor"));
var web3_js_1 = require("@solana/web3.js");
var __1 = require("../../");
var constants_1 = require("../../constants");
var getProgramIdForPerpProtocol = function (perpProtocol) {
    return perpProtocol === "Entropy" ? constants_1.ENTROPY_PROGRAM_ID : constants_1.MANGO_PROGRAM_ID;
};
exports.getProgramIdForPerpProtocol = getProgramIdForPerpProtocol;
var getVaultOwnerAndNonceForSpot = function (market) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var nonce, vaultOwner, e_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nonce = new anchor.BN(0);
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 6];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, web3_js_1.PublicKey.createProgramAddress([market.publicKey.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)], __1.SERUM_PROGRAM_IDS.Mainnet)];
            case 3:
                vaultOwner = _a.sent();
                return [2 /*return*/, [vaultOwner, nonce]];
            case 4:
                e_1 = _a.sent();
                nonce.iaddn(1);
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getVaultOwnerAndNonceForSpot = getVaultOwnerAndNonceForSpot;
