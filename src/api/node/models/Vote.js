"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vote = void 0;
var Vote;
(function (Vote) {
    /**
     * Vote down for implausible/not-useful or up for plausible/useful. Vote none to delete a previous vote.
     */
    var value;
    (function (value) {
        value["UP"] = "up";
        value["DOWN"] = "down";
        value["NONE"] = "none";
    })(value = Vote.value || (Vote.value = {}));
    /**
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    var type;
    (function (type) {
        type["CAUSALITY"] = "causality";
        type["USEFULNESS"] = "usefulness";
    })(type = Vote.type || (Vote.type = {}));
})(Vote = exports.Vote || (exports.Vote = {}));
//# sourceMappingURL=Vote.js.map