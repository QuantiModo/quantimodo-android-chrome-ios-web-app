/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MeasurementItem } from './MeasurementItem';

export type MeasurementSet = {
    /**
     * Way to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
     */
    combinationOperation?: MeasurementSet.combinationOperation;
    /**
     * Array of timestamps, values, and optional notes
     */
    measurementItems: Array<MeasurementItem>;
    /**
     * Name of the application or device used to record the measurement values
     */
    sourceName: string;
    /**
     * Unit of measurement
     */
    unitAbbreviatedName: string;
    /**
     * Ex: Emotions, Treatments, Symptoms...
     */
    variableCategoryName?: MeasurementSet.variableCategoryName;
    /**
     * ORIGINAL name of the variable for which we are creating the measurement records
     */
    variableName: string;
    /**
     * UPC or other barcode scan result
     */
    upc?: string;
}

export namespace MeasurementSet {

    /**
     * Way to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
     */
    export enum combinationOperation {
        MEAN = 'MEAN',
        SUM = 'SUM',
    }

    /**
     * Ex: Emotions, Treatments, Symptoms...
     */
    export enum variableCategoryName {
        ACTIVITY = 'Activity',
        BOOKS = 'Books',
        CAUSES_OF_ILLNESS = 'Causes of Illness',
        COGNITIVE_PERFORMANCE = 'Cognitive Performance',
        CONDITIONS = 'Conditions',
        EMOTIONS = 'Emotions',
        ENVIRONMENT = 'Environment',
        FOODS = 'Foods',
        GOALS = 'Goals',
        LOCATIONS = 'Locations',
        MISCELLANEOUS = 'Miscellaneous',
        MOVIES_AND_TV = 'Movies and TV',
        MUSIC = 'Music',
        NUTRIENTS = 'Nutrients',
        PAYMENTS = 'Payments',
        PHYSICAL_ACTIVITIES = 'Physical Activities',
        PHYSIQUE = 'Physique',
        SLEEP = 'Sleep',
        SOCIAL_INTERACTIONS = 'Social Interactions',
        SOFTWARE = 'Software',
        SYMPTOMS = 'Symptoms',
        TREATMENTS = 'Treatments',
        VITAL_SIGNS = 'Vital Signs',
    }


}