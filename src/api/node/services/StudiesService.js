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
exports.StudiesService = void 0;
var request_1 = require("../core/request");
var StudiesService = /** @class */ (function () {
    function StudiesService() {
    }
    /**
     * Get Personal or Population Studies
     * If you have enough data, this will be a list of your personal studies, otherwise it will consist of aggregated population studies.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param principalInvestigatorUserId These are studies created by a specific principal investigator
     * @param open These are studies that anyone can join
     * @param joined These are studies that you have joined
     * @param created These are studies that you have created
     * @param population These are studies based on the entire population of users that have shared their data
     * @param downvoted These are studies that you have down-voted
     * @returns GetStudiesResponse Successful operation
     * @throws ApiError
     */
    StudiesService.getStudies = function (sort, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, userId, clientId, includeCharts, recalculate, studyId, effectVariableName, limit, offset, correlationCoefficient, updatedAt, outcomesOfInterest, principalInvestigatorUserId, open, joined, created, population, downvoted) {
        if (limit === void 0) { limit = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/studies",
                            query: {
                                'sort': sort,
                                'causeVariableName': causeVariableName,
                                'causeVariableId': causeVariableId,
                                'effectVariableId': effectVariableId,
                                'predictorVariableName': predictorVariableName,
                                'outcomeVariableName': outcomeVariableName,
                                'userId': userId,
                                'clientId': clientId,
                                'includeCharts': includeCharts,
                                'recalculate': recalculate,
                                'studyId': studyId,
                                'effectVariableName': effectVariableName,
                                'limit': limit,
                                'offset': offset,
                                'correlationCoefficient': correlationCoefficient,
                                'updatedAt': updatedAt,
                                'outcomesOfInterest': outcomesOfInterest,
                                'principalInvestigatorUserId': principalInvestigatorUserId,
                                'open': open,
                                'joined': joined,
                                'created': created,
                                'population': population,
                                'downvoted': downvoted,
                            },
                            errors: {
                                401: "Successful operation",
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
    /**
     * These are open studies that anyone can join
     * These are studies that anyone can join and share their data for the predictor and outcome variables of interest.
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @returns GetStudiesResponse Successful operation
     * @throws ApiError
     */
    StudiesService.getOpenStudies = function (outcomeVariableName, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, effectVariableName, userId, clientId, includeCharts, recalculate, studyId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/studies/open",
                            query: {
                                'outcomeVariableName': outcomeVariableName,
                                'causeVariableName': causeVariableName,
                                'causeVariableId': causeVariableId,
                                'effectVariableId': effectVariableId,
                                'predictorVariableName': predictorVariableName,
                                'effectVariableName': effectVariableName,
                                'userId': userId,
                                'clientId': clientId,
                                'includeCharts': includeCharts,
                                'recalculate': recalculate,
                                'studyId': studyId,
                            },
                            errors: {
                                401: "Successful operation",
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
    /**
     * Studies You Have Joined
     * These are studies that you are currently sharing your data with.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param userId User's id
     * @param correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GetStudiesResponse Successful operation
     * @throws ApiError
     */
    StudiesService.getStudiesJoined = function (limit, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, sort, effectVariableName, offset, userId, correlationCoefficient, updatedAt, outcomesOfInterest, clientId) {
        if (limit === void 0) { limit = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/studies/joined",
                            query: {
                                'limit': limit,
                                'causeVariableName': causeVariableName,
                                'causeVariableId': causeVariableId,
                                'effectVariableId': effectVariableId,
                                'predictorVariableName': predictorVariableName,
                                'outcomeVariableName': outcomeVariableName,
                                'sort': sort,
                                'effectVariableName': effectVariableName,
                                'offset': offset,
                                'userId': userId,
                                'correlationCoefficient': correlationCoefficient,
                                'updatedAt': updatedAt,
                                'outcomesOfInterest': outcomesOfInterest,
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
     * Get studies you have created
     * These are studies that you have created.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param userId User's id
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GetStudiesResponse Successful operation
     * @throws ApiError
     */
    StudiesService.getStudiesCreated = function (sort, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, effectVariableName, limit, offset, userId, updatedAt, clientId) {
        if (limit === void 0) { limit = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/studies/created",
                            query: {
                                'sort': sort,
                                'causeVariableName': causeVariableName,
                                'causeVariableId': causeVariableId,
                                'effectVariableId': effectVariableId,
                                'predictorVariableName': predictorVariableName,
                                'outcomeVariableName': outcomeVariableName,
                                'effectVariableName': effectVariableName,
                                'limit': limit,
                                'offset': offset,
                                'userId': userId,
                                'updatedAt': updatedAt,
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
     * Publish Your Study
     * Make a study and all related measurements publicly visible by anyone
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @returns PostStudyPublishResponse Successful operation
     * @throws ApiError
     */
    StudiesService.publishStudy = function (outcomeVariableName, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, effectVariableName, userId, clientId, includeCharts, recalculate, studyId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/study/publish",
                            query: {
                                'outcomeVariableName': outcomeVariableName,
                                'causeVariableName': causeVariableName,
                                'causeVariableId': causeVariableId,
                                'effectVariableId': effectVariableId,
                                'predictorVariableName': predictorVariableName,
                                'effectVariableName': effectVariableName,
                                'userId': userId,
                                'clientId': clientId,
                                'includeCharts': includeCharts,
                                'recalculate': recalculate,
                                'studyId': studyId,
                            },
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
    /**
     * Join a Study
     * Anonymously share measurements for specified variables
     * @param studyId Client id for the study you want
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns StudyJoinResponse Successful operation
     * @throws ApiError
     */
    StudiesService.joinStudy = function (studyId, causeVariableName, effectVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, userId, clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/study/join",
                            query: {
                                'studyId': studyId,
                                'causeVariableName': causeVariableName,
                                'effectVariableName': effectVariableName,
                                'causeVariableId': causeVariableId,
                                'effectVariableId': effectVariableId,
                                'predictorVariableName': predictorVariableName,
                                'outcomeVariableName': outcomeVariableName,
                                'userId': userId,
                                'clientId': clientId,
                            },
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
    /**
     * Create a Study
     * Create an individual, group, or population study examining the relationship between a predictor and outcome variable. You will be given a study id which you can invite participants to join and share their measurements for the specified variables.
     * @param requestBody Details about the study you want to create
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns PostStudyCreateResponse Successful operation
     * @throws ApiError
     */
    StudiesService.createStudy = function (requestBody, clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/study/create",
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
    /**
     * Post or update vote
     * I am really good at finding correlations and even compensating for various onset delays and durations of action. However, you are much better than me at knowing if there's a way that a given factor could plausibly influence an outcome. You can help me learn and get better at my predictions by pressing the thumbs down button for relationships that you think are coincidences and thumbs up once that make logic sense.
     * @param requestBody Contains the cause variable, effect variable, and vote value.
     * @param userId User's id
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    StudiesService.postVote = function (requestBody, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/votes",
                            query: {
                                'userId': userId,
                            },
                            body: requestBody,
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
     * Delete vote
     * Delete previously posted vote
     * @param userId User's id
     * @returns void
     * @throws ApiError
     */
    StudiesService.deleteVote = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'DELETE',
                            path: "/v3/votes/delete",
                            query: {
                                'userId': userId,
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
     * Get Study
     * Get Study
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @returns Study Successful operation
     * @throws ApiError
     */
    StudiesService.getStudy = function (outcomeVariableName, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, effectVariableName, userId, clientId, includeCharts, recalculate, studyId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v4/study",
                            query: {
                                'outcomeVariableName': outcomeVariableName,
                                'causeVariableName': causeVariableName,
                                'causeVariableId': causeVariableId,
                                'effectVariableId': effectVariableId,
                                'predictorVariableName': predictorVariableName,
                                'effectVariableName': effectVariableName,
                                'userId': userId,
                                'clientId': clientId,
                                'includeCharts': includeCharts,
                                'recalculate': recalculate,
                                'studyId': studyId,
                            },
                            errors: {
                                401: "Successful operation",
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
    return StudiesService;
}());
exports.StudiesService = StudiesService;
//# sourceMappingURL=StudiesService.js.map