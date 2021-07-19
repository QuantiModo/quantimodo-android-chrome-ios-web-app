/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type VariableCategory = {
    /**
     * Ex: mood
     */
    appType?: string;
    /**
     * Ex: false
     */
    causeOnly?: boolean;
    /**
     * Ex: MEAN
     */
    combinationOperation?: string;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    createdTime?: string;
    /**
     * Ex: /5
     */
    unitAbbreviatedName?: string;
    /**
     * Ex: 10
     */
    unitId?: number;
    /**
     * User-Defined Variable Setting: The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Seconds
     */
    durationOfAction?: number;
    /**
     * Ex: -1. Unit: Variable category default unit.
     */
    fillingValue?: number;
    /**
     * Ex: What emotion do you want to rate?
     */
    helpText?: string;
    /**
     * Ex: 1
     */
    id?: number;
    /**
     * Ex: https://static.quantimo.do/img/variable_categories/theatre_mask-96.png
     */
    imageUrl?: string;
    /**
     * Ex: ion-happy-outline
     */
    ionIcon?: string;
    /**
     * Ex: true
     */
    manualTracking?: boolean;
    /**
     * Unit: Variable category default unit.
     */
    maximumAllowedValue?: string;
    /**
     * Ex: rating
     */
    measurementSynonymSingularLowercase?: string;
    /**
     * Unit: Variable category default unit.
     */
    minimumAllowedValue?: string;
    /**
     * Ex: Do you have any emotions that fluctuate regularly?  If so, add them so I can try to determine which factors are influencing them.
     */
    moreInfo?: string;
    /**
     * Category name
     */
    name: string;
    /**
     * Ex: 0
     */
    onsetDelay?: number;
    /**
     * Ex: true
     */
    outcome?: boolean;
    /**
     * Ex: img/variable_categories/emotions.png
     */
    pngPath?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/emotions.png
     */
    pngUrl?: string;
    /**
     * Ex: true
     */
    public?: boolean;
    /**
     * Ex: img/variable_categories/emotions.svg
     */
    svgPath?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/emotions.svg
     */
    svgUrl?: string;
    /**
     * Ex: 1
     */
    updated?: number;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    updatedTime?: string;
    /**
     * Ex: Emotions, Treatments, Symptoms...
     */
    variableCategoryName?: VariableCategory.variableCategoryName;
    /**
     * Ex: Emotion
     */
    variableCategoryNameSingular?: string;
}

export namespace VariableCategory {

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