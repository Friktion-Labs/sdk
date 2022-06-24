"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMarketForOption = void 0;
var tslib_1 = require("tslib");
var market_1 = require("@project-serum/serum/lib/market");
// TODO(sbb): Serum market ID should be included in contract
var loadMarketForOption = function (provider, marketPublicKey, serumDex) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, market_1.Market.load(provider.connection, marketPublicKey, undefined, serumDex)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.loadMarketForOption = loadMarketForOption;
