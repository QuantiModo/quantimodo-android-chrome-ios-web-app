"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
var request_1 = require("../core/request");
var UserService = /** @class */ (function () {
    function UserService() {
    }
    /**
     * Get user info
     * Returns user info.  If no userId is specified, returns info for currently authenticated user
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param userId User's id
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param appVersion Ex: 2.1.1.0
     * @param clientUserId Ex: 74802
     * @param log Username or email
     * @param pwd User password
     * @param includeAuthorizedClients Return list of apps, studies, and individuals with access to user data
     * @returns User Successful operation
     * @throws ApiError
     */
    UserService.getUser = function (clientId, userId, updatedAt, limit, offset, sort, createdAt, appVersion, clientUserId, log, pwd, includeAuthorizedClients) {
        if (limit === void 0) { limit = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/user",
                            query: {
                                'clientId': clientId,
                                'userId': userId,
                                'updatedAt': updatedAt,
                                'limit': limit,
                                'offset': offset,
                                'sort': sort,
                                'createdAt': createdAt,
                                'appVersion': appVersion,
                                'clientUserId': clientUserId,
                                'log': log,
                                'pwd': pwd,
                                'includeAuthorizedClients': includeAuthorizedClients,
                            },
                            errors: {
                                401: "Not Authenticated",
                            },
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.body];
                }
            });
        });
    };
    /**
     * Get users who shared data
     * Returns users who have granted access to their data
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param userId User's id
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param appVersion Ex: 2.1.1.0
     * @param clientUserId Ex: 74802
     * @param log Username or email
     * @param pwd User password
     * @returns UsersResponse Successful operation
     * @throws ApiError
     */
    UserService.getUsers = function (sort, userId, updatedAt, limit, offset, createdAt, clientId, appVersion, clientUserId, log, pwd) {
        if (limit === void 0) { limit = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/users",
                            query: {
                                'sort': sort,
                                'userId': userId,
                                'updatedAt': updatedAt,
                                'limit': limit,
                                'offset': offset,
                                'createdAt': createdAt,
                                'clientId': clientId,
                                'appVersion': appVersion,
                                'clientUserId': clientUserId,
                                'log': log,
                                'pwd': pwd,
                            },
                            errors: {
                                401: "Not Authenticated",
                            },
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.body];
                }
            });
        });
    };
    /**
     * Delete user
     * Delete user account. Only the client app that created a user can delete that user.
     * @param reason Ex: I hate you!
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns void
     * @throws ApiError
     */
    UserService.deleteUser = function (reason, clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'DELETE',
                            path: "/v3/user/delete",
                            query: {
                                'reason': reason,
                                'clientId': clientId,
                            },
                            errors: {
                                401: "Not Authenticated",
                            },
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.body];
                }
            });
        });
    };
    /**
     * Post UserSettings
     * Post UserSettings
     * @param requestBody User settings to update
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns PostUserSettingsResponse Successful operation
     * @throws ApiError
     */
    UserService.postUserSettings = function (requestBody, clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/userSettings",
                            query: {
                                'clientId': clientId,
                            },
                            body: requestBody,
                            errors: {
                                401: "Not authenticated",
                                404: "Not found",
                                500: "Internal server error",
                            },
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.body];
                }
            });
        });
    };
    return UserService;
}());
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map