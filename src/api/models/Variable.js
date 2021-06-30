/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export var Variable;
(function (Variable) {
    /**
     * User-Defined Variable Setting: How to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
     */
    let combinationOperation;
    (function (combinationOperation) {
        combinationOperation["MEAN"] = "MEAN";
        combinationOperation["SUM"] = "SUM";
    })(combinationOperation = Variable.combinationOperation || (Variable.combinationOperation = {}));
    /**
     * User-Defined Variable Setting: When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
     */
    let fillingType;
    (function (fillingType) {
        fillingType["NONE"] = "none";
        fillingType["ZERO_FILLING"] = "zero-filling";
        fillingType["VALUE_FILLING"] = "value-filling";
    })(fillingType = Variable.fillingType || (Variable.fillingType = {}));
    /**
     * User-Defined Variable Setting: Variable category like Emotions, Sleep, Physical Activities, Treatments, Symptoms, etc.
     */
    let variableCategoryName;
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
    })(variableCategoryName = Variable.variableCategoryName || (Variable.variableCategoryName = {}));
})(Variable || (Variable = {}));
