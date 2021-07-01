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
exports.MeasurementsService = void 0;
var request_1 = require("../core/request");
var MeasurementsService = /** @class */ (function () {
    function MeasurementsService() {
    }
    /**
     * Post Request for Measurements CSV
     * Use this endpoint to schedule a CSV export containing all user measurements to be emailed to the user within 24 hours.
     * @param userId User's id
     * @returns number successful operation
     * @throws ApiError
     */
    MeasurementsService.measurementExportRequest = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v2/measurements/exportRequest",
                            query: {
                                'userId': userId,
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
     * Get measurements for this user
     * Measurements are any value that can be recorded like daily steps, a mood rating, or apples eaten.
     * @param unitName Ex: Milligrams
     * @param variableName Name of the variable you want measurements for
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param variableCategoryName Ex: Emotions, Treatments, Symptoms...
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param sourceName ID of the source you want measurements for (supports exact name match only)
     * @param connectorName Ex: facebook
     * @param value Value of measurement
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Measurement id
     * @param groupingWidth The time (in seconds) over which measurements are grouped together
     * @param groupingTimezone The time (in seconds) over which measurements are grouped together
     * @param doNotProcess Ex: true
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param doNotConvert Ex: 1
     * @param minMaxFilter Ex: 1
     * @returns Measurement Successful operation
     * @throws ApiError
     */
    MeasurementsService.getMeasurements = function (unitName, variableName, limit, offset, variableCategoryName, updatedAt, userId, sourceName, connectorName, value, sort, earliestMeasurementTime, latestMeasurementTime, createdAt, id, groupingWidth, groupingTimezone, doNotProcess, clientId, doNotConvert, minMaxFilter) {
        if (limit === void 0) { limit = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/measurements",
                            query: {
                                'unitName': unitName,
                                'variableName': variableName,
                                'limit': limit,
                                'offset': offset,
                                'variableCategoryName': variableCategoryName,
                                'updatedAt': updatedAt,
                                'userId': userId,
                                'sourceName': sourceName,
                                'connectorName': connectorName,
                                'value': value,
                                'sort': sort,
                                'earliestMeasurementTime': earliestMeasurementTime,
                                'latestMeasurementTime': latestMeasurementTime,
                                'createdAt': createdAt,
                                'id': id,
                                'groupingWidth': groupingWidth,
                                'groupingTimezone': groupingTimezone,
                                'doNotProcess': doNotProcess,
                                'clientId': clientId,
                                'doNotConvert': doNotConvert,
                                'minMaxFilter': minMaxFilter,
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
     * Delete a measurement
     * Delete a previously submitted measurement
     * @returns void
     * @throws ApiError
     */
    MeasurementsService.deleteMeasurement = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'DELETE',
                            path: "/v3/measurements/delete",
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
     * Post a new set or update existing measurements to the database
     * You can submit or update multiple measurements in a "measurements" sub-array.  If the variable these measurements correspond to does not already exist in the database, it will be automatically added.
     * @param requestBody An array of measurement sets containing measurement items you want to insert.
     * @param userId User's id
     * @returns PostMeasurementsResponse Successful operation
     * @throws ApiError
     */
    MeasurementsService.postMeasurements = function (requestBody, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/measurements/post",
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
     * Update a measurement
     * Update a previously submitted measurement
     * @param requestBody The id as well as the new startTime, note, and/or value of the measurement to be updated
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    MeasurementsService.updateMeasurement = function (requestBody) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/measurements/update",
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
     * Get pairs of measurements for correlational analysis
     * Pairs cause measurements with effect measurements grouped over the duration of action after the onset delay.
     * @param causeUnitName Name for the unit cause measurements to be returned in
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param effectUnitName Name for the unit effect measurements to be returned in
     * @param userId User's id
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param onsetDelay The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     * @param durationOfAction The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay. Unit: Seconds
     * @param earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @returns Pair Successful operation
     * @throws ApiError
     */
    MeasurementsService.getPairs = function (causeUnitName, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, effectUnitName, userId, effectVariableName, onsetDelay, durationOfAction, earliestMeasurementTime, latestMeasurementTime, limit, offset, sort) {
        if (limit === void 0) { limit = 100; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/pairs",
                            query: {
                                'causeUnitName': causeUnitName,
                                'causeVariableName': causeVariableName,
                                'causeVariableId': causeVariableId,
                                'effectVariableId': effectVariableId,
                                'predictorVariableName': predictorVariableName,
                                'outcomeVariableName': outcomeVariableName,
                                'effectUnitName': effectUnitName,
                                'userId': userId,
                                'effectVariableName': effectVariableName,
                                'onsetDelay': onsetDelay,
                                'durationOfAction': durationOfAction,
                                'earliestMeasurementTime': earliestMeasurementTime,
                                'latestMeasurementTime': latestMeasurementTime,
                                'limit': limit,
                                'offset': offset,
                                'sort': sort,
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
    return MeasurementsService;
}());
exports.MeasurementsService = MeasurementsService;
//# sourceMappingURL=MeasurementsService.js.map