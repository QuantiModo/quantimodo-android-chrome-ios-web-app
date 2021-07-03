/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';

export type Measurement = {
    card?: Card;
    /**
     * Ex: quantimodo
     */
    clientId?: string;
    /**
     * Ex: 13
     */
    connectorId?: number;
    /**
     * Ex: 2017-07-30 21:08:36
     */
    createdAt?: string;
    /**
     * Examples: 3/5, $10, or 1 count
     */
    displayValueAndUnitString?: string;
    /**
     * Ex: ion-sad-outline
     */
    iconIcon?: string;
    /**
     * Ex: 1051466127
     */
    id?: number;
    /**
     * Ex: value
     */
    inputType?: string;
    /**
     * Ex: ion-ios-medkit-outline
     */
    ionIcon?: string;
    /**
     * Ex: 1
     */
    manualTracking?: boolean;
    /**
     * Ex: 5. Unit: User-specified or common.
     */
    maximumAllowedValue?: number;
    /**
     * Ex: 1. Unit: User-specified or common.
     */
    minimumAllowedValue?: number;
    /**
     * Note of measurement
     */
    note?: string;
    /**
     * Additional meta data for the measurement
     */
    noteObject?: any;
    /**
     * Embeddable HTML with message hyperlinked with associated url
     */
    noteHtml?: any;
    /**
     * Ex: 23
     */
    originalUnitId?: number;
    /**
     * Original value submitted. Unit: Originally submitted.
     */
    originalValue?: number;
    /**
     * Ex: img/variable_categories/treatments.png
     */
    pngPath?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/treatments.png
     */
    pngUrl?: string;
    /**
     * Link to associated product for purchase
     */
    productUrl?: string;
    /**
     * Application or device used to record the measurement values
     */
    sourceName: string;
    /**
     * Ex: 2014-08-27
     */
    startDate?: string;
    /**
     * Seconds between the start of the event measured and 1970 (Unix timestamp)
     */
    startTimeEpoch?: number;
    /**
     * Start Time for the measurement event in UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    startTimeString: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/treatments.svg
     */
    svgUrl?: string;
    /**
     * Abbreviated name for the unit of measurement
     */
    unitAbbreviatedName: string;
    /**
     * Ex: 6
     */
    unitCategoryId?: number;
    /**
     * Ex: Miscellany
     */
    unitCategoryName?: string;
    /**
     * Ex: 23
     */
    unitId?: number;
    /**
     * Ex: Count
     */
    unitName?: string;
    /**
     * Ex: 2017-07-30 21:08:36
     */
    updatedAt?: string;
    /**
     * Link to associated Facebook like or Github commit, for instance
     */
    url?: string;
    /**
     * Ex: count
     */
    userVariableUnitAbbreviatedName?: string;
    /**
     * Ex: 6
     */
    userVariableUnitCategoryId?: number;
    /**
     * Ex: Miscellany
     */
    userVariableUnitCategoryName?: string;
    /**
     * Ex: 23
     */
    userVariableUnitId?: number;
    /**
     * Ex: Count
     */
    userVariableUnitName?: string;
    /**
     * Ex: 13
     */
    userVariableVariableCategoryId?: number;
    /**
     * Ex: Treatments
     */
    userVariableVariableCategoryName?: string;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    valence?: string;
    /**
     * Converted measurement value in requested unit
     */
    value: number;
    /**
     * Ex: 13
     */
    variableCategoryId?: number;
    /**
     * Ex: https://static.quantimo.do/img/variable_categories/pill-96.png
     */
    variableCategoryImageUrl?: string;
    /**
     * Ex: Emotions, Treatments, Symptoms...
     */
    variableCategoryName?: Measurement.variableCategoryName;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    variableDescription?: string;
    /**
     * Ex: 5956846
     */
    variableId?: number;
    /**
     * Name of the variable for which we are creating the measurement records
     */
    variableName: string;
    /**
     * Ex: Trader Joe's Bedtime Tea
     */
    displayName?: string;
}

export namespace Measurement {

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