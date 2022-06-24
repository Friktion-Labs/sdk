"use strict";
// This file contains types that do not match anything that is code generated.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfTradeBehavior = exports.OrderType = void 0;
// serum types
exports.OrderType = {
    Limit: { limit: {} },
    ImmediateOrCancel: { immediateOrCancel: {} },
    PostOnly: { postOnly: {} },
};
exports.SelfTradeBehavior = {
    DecrementTake: { decremenTtake: {} },
    CancelProvide: { cancelProvide: {} },
    AbortTransaction: { abortTransaction: {} },
};
