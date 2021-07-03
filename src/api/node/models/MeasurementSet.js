"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasurementSet = void 0;
var MeasurementSet;
(function (MeasurementSet) {
    /**
     * Way to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
     */
    var combinationOperation;
    (function (combinationOperation) {
        combinationOperation["MEAN"] = "MEAN";
        combinationOperation["SUM"] = "SUM";
    })(combinationOperation = MeasurementSet.combinationOperation || (MeasurementSet.combinationOperation = {}));
    /**
     * Ex: Emotions, Treatments, Symptoms...
     */
    var variableCategoryName;
    (function (variableCategoryName) {
        variableCategoryName["ACTIVITY"] = "Activity";
        variableCategoryName["BOOKS"] = "Books";
        variableCategoryName["CAUSES_OF_ILLNESS"] = "Causes of Illness";
        variableCategoryName["COGNITIVE_PERFORMANCE"] = "Cognitive Performance";
        variableCategoryName["CONDITIONS"] = "Conditions";
        variableCategoryName["EMOTIONS"] = "Emotions";
        variableCategoryName["ENVIRONMENT"] = "Environment";
        variableCategoryName["FOODS"] = "Foods";
        variableCategoryName["GOALS"] = "Goals";
        variableCategoryName["LOCATIONS"] = "Locations";
        variableCategoryName["MISCELLANEOUS"] = "Miscellaneous";
        variableCategoryName["MOVIES_AND_TV"] = "Movies and TV";
        variableCategoryName["MUSIC"] = "Music";
        variableCategoryName["NUTRIENTS"] = "Nutrients";
        variableCategoryName["PAYMENTS"] = "Payments";
        variableCategoryName["PHYSICAL_ACTIVITIES"] = "Physical Activities";
        variableCategoryName["PHYSIQUE"] = "Physique";
        variableCategoryName["SLEEP"] = "Sleep";
        variableCategoryName["SOCIAL_INTERACTIONS"] = "Social Interactions";
        variableCategoryName["SOFTWARE"] = "Software";
        variableCategoryName["SYMPTOMS"] = "Symptoms";
        variableCategoryName["TREATMENTS"] = "Treatments";
        variableCategoryName["VITAL_SIGNS"] = "Vital Signs";
    })(variableCategoryName = MeasurementSet.variableCategoryName || (MeasurementSet.variableCategoryName = {}));
})(MeasurementSet = exports.MeasurementSet || (exports.MeasurementSet = {}));
//# sourceMappingURL=MeasurementSet.js.map