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
exports.VariablesService = void 0;
var request_1 = require("../core/request");
var VariablesService = /** @class */ (function () {
    function VariablesService() {
    }
    /**
     * Post or update user tags or ingredients
     * This endpoint allows users to tag foods with their ingredients.  This information will then be used to infer the user intake of the different ingredients by just entering the foods. The inferred intake levels will then be used to determine the effects of different nutrients on the user during analysis.
     * @param requestBody Contains the new user tag data
     * @param userId User's id
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    VariablesService.postUserTags = function (requestBody, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/userTags",
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
     * Delete user tag or ingredient
     * Delete previously created user tags or ingredients.
     * @param taggedVariableId Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
     * @param tagVariableId Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
     * @returns void
     * @throws ApiError
     */
    VariablesService.deleteUserTag = function (taggedVariableId, tagVariableId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'DELETE',
                            path: "/v3/userTags/delete",
                            query: {
                                'taggedVariableId': taggedVariableId,
                                'tagVariableId': tagVariableId,
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
     * Get variables along with related user-specific analysis settings and statistics
     * Get variables. If the user has specified variable settings, these are provided instead of the common variable defaults.
     * @param publicEffectOrCause Ex:
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param userId User's id
     * @param variableCategoryName Ex: Emotions, Treatments, Symptoms...
     * @param name Name of the variable. To get results matching a substring, add % as a wildcard as the first and/or last character of a query string parameter. In order to get variables that contain `Mood`, the following query should be used: ?variableName=%Mood%
     * @param variableName Name of the variable you want measurements for
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param sourceName ID of the source you want measurements for (supports exact name match only)
     * @param earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param id Common variable id
     * @param lastSourceName Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param includePublic Include variables the user has no measurements for
     * @param manualTracking Only include variables tracked manually by the user
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param upc UPC or other barcode scan result
     * @param effectOrCause Provided variable is the effect or cause
     * @param numberOfRawMeasurements Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.
     * @param exactMatch Require exact match
     * @param variableCategoryId Ex: 13
     * @param includePrivate Include user-specific variables in results
     * @param searchPhrase Ex: %Body Fat%
     * @param synonyms Ex: McDonalds hotcake
     * @param taggedVariableId Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
     * @param tagVariableId Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
     * @param joinVariableId Id of the variable you would like to get variables that can be joined to.  This is used to merge duplicate variables.   If joinVariableId is specified, this returns only variables eligible to be joined to the variable specified by the joinVariableId.
     * @param parentUserTagVariableId Id of the parent category variable (i.e. Fruit) you would like to get eligible child sub-type variables (i.e. Apple) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple.  When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed.
     * @param childUserTagVariableId Id of the child sub-type variable (i.e. Apple) you would like to get eligible parent variables (i.e. Fruit) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple. When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed.
     * @param ingredientUserTagVariableId Id of the ingredient variable (i.e. Fructose)  you would like to get eligible ingredientOf variables (i.e. Apple) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple.
     * @param ingredientOfUserTagVariableId Id of the ingredientOf variable (i.e. Apple) you would like to get eligible ingredient variables (i.e. Fructose) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple.
     * @param commonOnly Return only public and aggregated common variable data instead of user-specific variables
     * @param userOnly Return only user-specific variables and data, excluding common aggregated variable data
     * @param includeTags Return parent, child, duplicate, and ingredient variables
     * @param recalculate Recalculate instead of using cached analysis
     * @param variableId Ex: 13
     * @param concise Only return field required for variable auto-complete searches.  The smaller size allows for storing more variable results locally reducing API requests.
     * @param refresh Regenerate charts instead of getting from the cache
     * @returns Variable Variables returned
     * @throws ApiError
     */
    VariablesService.getVariables = function (publicEffectOrCause, includeCharts, userId, variableCategoryName, name, variableName, updatedAt, sourceName, earliestMeasurementTime, latestMeasurementTime, id, lastSourceName, limit, offset, sort, includePublic, manualTracking, clientId, upc, effectOrCause, numberOfRawMeasurements, exactMatch, variableCategoryId, includePrivate, searchPhrase, synonyms, taggedVariableId, tagVariableId, joinVariableId, parentUserTagVariableId, childUserTagVariableId, ingredientUserTagVariableId, ingredientOfUserTagVariableId, commonOnly, userOnly, includeTags, recalculate, variableId, concise, refresh) {
        if (limit === void 0) { limit = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/variables",
                            query: {
                                'publicEffectOrCause': publicEffectOrCause,
                                'includeCharts': includeCharts,
                                'userId': userId,
                                'variableCategoryName': variableCategoryName,
                                'name': name,
                                'variableName': variableName,
                                'updatedAt': updatedAt,
                                'sourceName': sourceName,
                                'earliestMeasurementTime': earliestMeasurementTime,
                                'latestMeasurementTime': latestMeasurementTime,
                                'id': id,
                                'lastSourceName': lastSourceName,
                                'limit': limit,
                                'offset': offset,
                                'sort': sort,
                                'includePublic': includePublic,
                                'manualTracking': manualTracking,
                                'clientId': clientId,
                                'upc': upc,
                                'effectOrCause': effectOrCause,
                                'numberOfRawMeasurements': numberOfRawMeasurements,
                                'exactMatch': exactMatch,
                                'variableCategoryId': variableCategoryId,
                                'includePrivate': includePrivate,
                                'searchPhrase': searchPhrase,
                                'synonyms': synonyms,
                                'taggedVariableId': taggedVariableId,
                                'tagVariableId': tagVariableId,
                                'joinVariableId': joinVariableId,
                                'parentUserTagVariableId': parentUserTagVariableId,
                                'childUserTagVariableId': childUserTagVariableId,
                                'ingredientUserTagVariableId': ingredientUserTagVariableId,
                                'ingredientOfUserTagVariableId': ingredientOfUserTagVariableId,
                                'commonOnly': commonOnly,
                                'userOnly': userOnly,
                                'includeTags': includeTags,
                                'recalculate': recalculate,
                                'variableId': variableId,
                                'concise': concise,
                                'refresh': refresh,
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
     * Update User Settings for a Variable
     * Users can change the parameters used in analysis of that variable such as the expected duration of action for a variable to have an effect, the estimated delay before the onset of action. In order to filter out erroneous data, they are able to set the maximum and minimum reasonable daily values for a variable.
     * @param requestBody Variable user settings data
     * @param includePrivate Include user-specific variables in results
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includePublic Include variables the user has no measurements for
     * @param searchPhrase Ex: %Body Fat%
     * @param exactMatch Require exact match
     * @param manualTracking Only include variables tracked manually by the user
     * @param variableCategoryName Ex: Emotions, Treatments, Symptoms...
     * @param variableCategoryId Ex: 13
     * @param synonyms Ex: McDonalds hotcake
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    VariablesService.postUserVariables = function (requestBody, includePrivate, clientId, includePublic, searchPhrase, exactMatch, manualTracking, variableCategoryName, variableCategoryId, synonyms) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/variables",
                            query: {
                                'includePrivate': includePrivate,
                                'clientId': clientId,
                                'includePublic': includePublic,
                                'searchPhrase': searchPhrase,
                                'exactMatch': exactMatch,
                                'manualTracking': manualTracking,
                                'variableCategoryName': variableCategoryName,
                                'variableCategoryId': variableCategoryId,
                                'synonyms': synonyms,
                            },
                            body: requestBody,
                            errors: {
                                400: "The received JSON was invalid or malformed",
                                401: "Not Authenticated",
                                404: "Unknown target user ID",
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
     * Delete All Measurements For Variable
     * Users can delete all of their measurements for a variable
     * @returns void
     * @throws ApiError
     */
    VariablesService.deleteUserVariable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'DELETE',
                            path: "/v3/userVariables/delete",
                            errors: {
                                400: "The received JSON was invalid or malformed",
                                401: "Not Authenticated",
                                404: "Unknown target user ID",
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
     * Reset user settings for a variable to defaults
     * Reset user settings for a variable to defaults
     * @param requestBody Id of the variable whose measurements should be deleted
     * @returns any Successful operation
     * @throws ApiError
     */
    VariablesService.resetUserVariableSettings = function (requestBody) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/userVariables/reset",
                            body: requestBody,
                            errors: {
                                400: "The received JSON was invalid or malformed",
                                401: "Not Authenticated",
                                404: "Unknown target user ID",
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
     * Variable categories
     * The variable categories include Activity, Causes of Illness, Cognitive Performance, Conditions, Environment, Foods, Location, Miscellaneous, Mood, Nutrition, Physical Activity, Physique, Sleep, Social Interactions, Symptoms, Treatments, Vital Signs, and Goals.
     * @returns VariableCategory Successful operation
     * @throws ApiError
     */
    VariablesService.getVariableCategories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/variableCategories",
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
    return VariablesService;
}());
exports.VariablesService = VariablesService;
//# sourceMappingURL=VariablesService.js.map