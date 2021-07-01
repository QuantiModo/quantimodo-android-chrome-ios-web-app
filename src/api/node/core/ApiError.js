"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(response, message) {
        var _this = _super.call(this, message) || this;
        _this.url = response.url;
        _this.status = response.status;
        _this.statusText = response.statusText;
        _this.body = response.body;
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map