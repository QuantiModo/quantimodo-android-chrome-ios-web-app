/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export var Vote;
(function (Vote) {
    /**
     * Vote down for implausible/not-useful or up for plausible/useful. Vote none to delete a previous vote.
     */
    let value;
    (function (value) {
        value["UP"] = "up";
        value["DOWN"] = "down";
        value["NONE"] = "none";
    })(value = Vote.value || (Vote.value = {}));
    /**
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    let type;
    (function (type) {
        type["CAUSALITY"] = "causality";
        type["USEFULNESS"] = "usefulness";
    })(type = Vote.type || (Vote.type = {}));
})(Vote || (Vote = {}));
