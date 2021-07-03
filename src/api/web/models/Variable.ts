/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';
import type { DataSource } from './DataSource';
import type { TrackingReminderNotificationAction } from './TrackingReminderNotificationAction';
import type { Unit } from './Unit';
import type { VariableCategory } from './VariableCategory';
import type { VariableCharts } from './VariableCharts';

export type Variable = {
    actionArray?: Array<TrackingReminderNotificationAction>;
    /**
     * User-Defined Variable Setting:  Alternative display name
     */
    alias?: string;
    availableUnits?: Array<Unit>;
    /**
     * Link to study comparing variable with strongest relationship for user or population
     */
    bestStudyLink?: string;
    bestStudyCard?: Card;
    /**
     * Link to study comparing variable with strongest relationship for user
     */
    bestUserStudyLink?: string;
    bestUserStudyCard?: Card;
    /**
     * Link to study comparing variable with strongest relationship for population
     */
    bestPopulationStudyLink?: string;
    bestPopulationStudyCard?: Card;
    /**
     * Description of relationship with variable with strongest relationship for user or population
     */
    optimalValueMessage?: string;
    /**
     * Description of relationship with variable with strongest relationship for population
     */
    commonOptimalValueMessage?: string;
    /**
     * Description of relationship with variable with strongest relationship for user
     */
    userOptimalValueMessage?: string;
    card?: Card;
    /**
     * User-Defined Variable Setting: True indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user
     */
    causeOnly?: boolean;
    charts?: VariableCharts;
    /**
     * Ex: https://local.quantimo.do/ionic/Modo/www/#/app/charts/Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29?variableName=Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png
     */
    chartsLinkDynamic?: string;
    /**
     * Ex: mailto:?subject=Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21&body=See%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%0A%0AHave%20a%20great%20day!
     */
    chartsLinkEmail?: string;
    /**
     * Ex: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png
     */
    chartsLinkFacebook?: string;
    /**
     * Ex: https://plus.google.com/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png
     */
    chartsLinkGoogle?: string;
    /**
     * Ex: https://local.quantimo.do/api/v2/charts?variableName=Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png
     */
    chartsLinkStatic?: string;
    /**
     * Ex: https://twitter.com/home?status=Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%20%40quantimodo
     */
    chartsLinkTwitter?: string;
    /**
     * Commonly defined for all users. An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake.
     */
    childCommonTagVariables?: Array<Variable>;
    /**
     * User-Defined Variable Setting: An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake.
     */
    childUserTagVariables?: Array<Variable>;
    /**
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    clientId?: string;
    /**
     * User-Defined Variable Setting: How to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
     */
    combinationOperation?: Variable.combinationOperation;
    /**
     * Ex: Anxiety / Nervousness
     */
    commonAlias?: string;
    commonTaggedVariables?: Array<Variable>;
    commonTagVariables?: Array<Variable>;
    /**
     * When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format
     */
    createdAt?: string;
    /**
     * Comma-separated list of source names to limit variables to those sources
     */
    dataSourceNames?: string;
    /**
     * These are sources of measurements for this variable
     */
    dataSources?: Array<DataSource>;
    /**
     * User-Defined Variable Setting: Ex: Summary to be used in studies.
     */
    description?: string;
    /**
     * Ex: Trader Joe's Bedtime Tea
     */
    displayName?: string;
    /**
     * The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay. Unit: Seconds
     */
    durationOfAction?: number;
    /**
     * User-Defined Variable Setting: The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Hours
     */
    durationOfActionInHours?: number;
    /**
     * Earliest filling time
     */
    earliestFillingTime?: number;
    /**
     * Earliest measurement time
     */
    earliestMeasurementTime?: number;
    /**
     * Earliest source time
     */
    earliestSourceTime?: number;
    /**
     * Error message from last analysis
     */
    errorMessage?: string;
    /**
     * User-Defined Variable Setting: Latest measurement time to be used in analysis. Format: UTC ISO 8601 YYYY-MM-DDThh:mm:ss.
     */
    experimentEndTime?: string;
    /**
     * User-Defined Variable Setting: Earliest measurement time to be used in analysis. Format: UTC ISO 8601 YYYY-MM-DDThh:mm:ss.
     */
    experimentStartTime?: string;
    /**
     * User-Defined Variable Setting: When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
     */
    fillingType?: Variable.fillingType;
    /**
     * User-Defined Variable Setting: When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.  Unit: User-specified or common.
     */
    fillingValue?: number;
    /**
     * Ex: ion-sad-outline
     */
    iconIcon?: string;
    /**
     * Ex: 95614
     */
    id: number;
    /**
     * What do you expect?
     */
    imageUrl?: string;
    /**
     * Ex: https://google.com
     */
    informationalUrl?: string;
    /**
     * Commonly defined for all users. IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you.
     */
    ingredientOfCommonTagVariables?: Array<Variable>;
    /**
     * Commonly defined for all users. IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you.
     */
    ingredientCommonTagVariables?: Array<Variable>;
    /**
     * User-Defined Variable Setting: IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you.
     */
    ingredientOfUserTagVariables?: Array<Variable>;
    /**
     * User-Defined Variable Setting: IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you.
     */
    ingredientUserTagVariables?: Array<Variable>;
    /**
     * Type of input field to show for recording measurements
     */
    inputType?: string;
    /**
     * What do you expect?
     */
    ionIcon?: string;
    /**
     * Commonly defined for all users.  Joining can be used used to merge duplicate variables. For instance, if two variables called Apples (Red Delicious) and Red Delicious Apples are joined, when one of them is analyzed, the measurements for the other will be included as well.
     */
    joinedCommonTagVariables?: Array<Variable>;
    /**
     * User-Defined Variable Setting: Joining can be used used to merge duplicate variables. For instance, if two variables called Apples (Red Delicious) and Red Delicious Apples are joined, when one of them is analyzed, the measurements for the other will be included as well.
     */
    joinedUserTagVariables?: Array<Variable>;
    /**
     * Duplicate variables. If the variable is joined with some other variable then it is not shown to user in the list of variables
     */
    joinWith?: number;
    /**
     * Kurtosis
     */
    kurtosis?: number;
    /**
     * Calculated Statistic: Ex: 500. Unit: User-specified or common.
     */
    lastProcessedDailyValue?: number;
    /**
     * When this variable or its settings were last updated UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    lastSuccessfulUpdateTime?: string;
    /**
     * Calculated Statistic: Last measurement value in the common unit or user unit if different. Unit: User-specified or common.
     */
    lastValue?: number;
    /**
     * Latest filling time
     */
    latestFillingTime?: number;
    /**
     * Latest measurement time. Format: Unix-time epoch seconds.
     */
    latestMeasurementTime?: number;
    /**
     * Latest source time. Format: Unix-time epoch seconds.
     */
    latestSourceTime?: number;
    /**
     * Ex: 1501383600. Format: Unix-time epoch seconds.
     */
    latestUserMeasurementTime?: number;
    /**
     * Latitude. Unit: User-specified or common.
     */
    latitude?: number;
    /**
     * Location
     */
    location?: string;
    /**
     * Longitude
     */
    longitude?: number;
    /**
     * True if the variable is an emotion or symptom rating that is not typically automatically collected by a device or app.
     */
    manualTracking?: boolean;
    /**
     * User-Defined Variable Setting: The maximum allowed value a daily aggregated measurement. Unit: User-specified or common.
     */
    maximumAllowedDailyValue?: number;
    /**
     * User-Defined Variable Setting: The maximum allowed value a single measurement. While you can record a value above this maximum, it will be excluded from the correlation analysis.  Unit: User-specified or common.
     */
    maximumAllowedValue?: number;
    /**
     * Calculated Statistic: Maximum recorded daily value of this variable. Unit: User-specified or common.
     */
    maximumRecordedDailyValue?: number;
    /**
     * Calculated Statistic: Ex: 1. Unit: User-specified or common.
     */
    maximumRecordedValue?: number;
    /**
     * Mean. Unit: User-specified or common.
     */
    mean?: number;
    /**
     * Number of measurements at last analysis
     */
    measurementsAtLastAnalysis?: number;
    /**
     * Median
     */
    median?: number;
    /**
     * User-Defined Variable Setting: The minimum allowed value a single measurement. While you can record a value below this minimum, it will be excluded from the correlation analysis. Unit: User-specified or common
     */
    minimumAllowedValue?: number;
    /**
     * User-Defined Variable Setting: The minimum allowed value a daily aggregated measurement.  For instance, you might set to 100 for steps to keep erroneous 0 daily steps out of the analysis. Unit: User-specified or common.
     */
    minimumAllowedDailyValue?: number;
    /**
     * User-Defined Variable Setting: The minimum allowed non-zero value a single measurement.  For instance, you might set to 100 mL for steps to keep erroneous 0 daily steps out of the analysis. Unit: User-specified or common.
     */
    minimumNonZeroValue?: number;
    /**
     * Minimum recorded value of this variable. Unit: User-specified or common.
     */
    minimumRecordedValue?: number;
    /**
     * Ex: 51
     */
    mostCommonConnectorId?: number;
    /**
     * Ex: 23
     */
    mostCommonOriginalUnitId?: number;
    /**
     * Most common Unit ID
     */
    mostCommonUnitId?: number;
    /**
     * Calculated Statistic: Most common value. Unit: User-specified or common.
     */
    mostCommonValue?: number;
    /**
     * Ex: Trader Joes Bedtime Tea / Sleepytime Tea (any Brand)
     */
    name: string;
    /**
     * Ex: 1
     */
    numberOfAggregateCorrelationsAsCause?: number;
    /**
     * Ex: 310
     */
    numberOfAggregateCorrelationsAsEffect?: number;
    /**
     * Number of changes
     */
    numberOfChanges?: number;
    /**
     * Number of correlations for this variable
     */
    numberOfCorrelations?: number;
    /**
     * numberOfAggregateCorrelationsAsCause plus numberOfUserCorrelationsAsCause
     */
    numberOfCorrelationsAsCause?: number;
    /**
     * numberOfAggregateCorrelationsAsEffect plus numberOfUserCorrelationsAsEffect
     */
    numberOfCorrelationsAsEffect?: number;
    /**
     * Number of processed measurements
     */
    numberOfProcessedDailyMeasurements?: number;
    /**
     * Ex: 295
     */
    numberOfRawMeasurements?: number;
    /**
     * Ex: 1
     */
    numberOfTrackingReminders?: number;
    /**
     * Number of unique daily values
     */
    numberOfUniqueDailyValues?: number;
    /**
     * Ex: 2
     */
    numberOfUniqueValues?: number;
    /**
     * Ex: 115
     */
    numberOfUserCorrelationsAsCause?: number;
    /**
     * Ex: 29014
     */
    numberOfUserCorrelationsAsEffect?: number;
    /**
     * Ex: 2
     */
    numberOfUserVariables?: number;
    /**
     * The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     */
    onsetDelay?: number;
    /**
     * User-Defined Variable Setting: The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     */
    onsetDelayInHours?: number;
    /**
     * User-Defined Variable Setting: True for variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables
     */
    outcome?: boolean;
    /**
     * Do you want to receive updates on newly discovered factors influencing this variable?
     */
    outcomeOfInterest?: boolean;
    /**
     * Commonly defined for all users.  An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake.
     */
    parentCommonTagVariables?: Array<Variable>;
    /**
     * User-defined. An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake.
     */
    parentUserTagVariables?: Array<Variable>;
    /**
     * Ex: img/variable_categories/treatments.png
     */
    pngPath?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/treatments.png
     */
    pngUrl?: string;
    /**
     * Ex: 0
     */
    predictorOfInterest?: number;
    /**
     * Ex: 95.4
     */
    price?: number;
    /**
     * Link to associated product for purchase
     */
    productUrl?: string;
    /**
     * Should this variable show up in automcomplete searches for users who do not already have measurements for it?
     */
    public?: boolean;
    /**
     * Ex: How is your overall mood?
     */
    question?: string;
    /**
     * Ex: How is your overall mood on a scale of 1 to 5??
     */
    longQuestion?: string;
    /**
     * Ex: 131
     */
    rawMeasurementsAtLastAnalysis?: number;
    /**
     * Calculated Statistic: Ex: 1. Unit: User-specified or common.
     */
    secondMostCommonValue?: number;
    /**
     * Calculated Statistic: Ex: 250. Unit: User-specified or common.
     */
    secondToLastValue?: number;
    /**
     * Would you like to make your measurements publicly visible?
     */
    shareUserMeasurements?: boolean;
    /**
     * Skewness
     */
    skewness?: number;
    /**
     * Standard deviation Ex: 0.46483219855434
     */
    standardDeviation?: number;
    /**
     * status
     */
    status?: string;
    /**
     * Based on sort filter and can be shown beneath variable name on search list
     */
    subtitle?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/treatments.svg
     */
    svgUrl?: string;
    /**
     * Calculated Statistic: Ex: 6. Unit: User-specified or common.
     */
    thirdMostCommonValue?: number;
    /**
     * Calculated Statistic: Ex: 250. Unit: User-specified or common.
     */
    thirdToLastValue?: number;
    /**
     * HTML instructions for tracking
     */
    trackingInstructions?: string;
    trackingInstructionsCard?: Card;
    unit?: Unit;
    /**
     * Ex: count
     */
    unitAbbreviatedName?: string;
    /**
     * Ex: 6
     */
    unitCategoryId?: number;
    /**
     * Ex: Miscellany
     */
    unitCategoryName?: string;
    /**
     * ID of unit to use for this variable
     */
    unitId?: number;
    /**
     * User-Defined Variable Setting: Count
     */
    unitName?: string;
    /**
     * Universal product code or similar
     */
    upc?: string;
    /**
     * updated
     */
    updated?: number;
    /**
     * When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format
     */
    updatedAt?: string;
    /**
     * Ex: 2017-07-30 14:58:26
     */
    updatedTime?: string;
    /**
     * User ID
     */
    userId: number;
    userTaggedVariables?: Array<Variable>;
    userTagVariables?: Array<Variable>;
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
    variableCategory?: VariableCategory;
    /**
     * Array of Variables that are joined with this Variable
     */
    joinedVariables?: Array<Variable>;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    valence?: string;
    /**
     * Ex: 6
     */
    variableCategoryId?: number;
    /**
     * User-Defined Variable Setting: Variable category like Emotions, Sleep, Physical Activities, Treatments, Symptoms, etc.
     */
    variableCategoryName?: Variable.variableCategoryName;
    /**
     * Ex: 96380
     */
    variableId: number;
    /**
     * Ex: Sleep Duration
     */
    variableName?: string;
    /**
     * Statistic: Ex: 115947037.40816
     */
    variance?: number;
    /**
     * User-Defined Variable Setting: You can help to improve the studies by pasting the title of the most appropriate Wikipedia article for this variable
     */
    wikipediaTitle?: string;
}

export namespace Variable {

    /**
     * User-Defined Variable Setting: How to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.
     */
    export enum combinationOperation {
        MEAN = 'MEAN',
        SUM = 'SUM',
    }

    /**
     * User-Defined Variable Setting: When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.
     */
    export enum fillingType {
        NONE = 'none',
        ZERO_FILLING = 'zero-filling',
        VALUE_FILLING = 'value-filling',
    }

    /**
     * User-Defined Variable Setting: Variable category like Emotions, Sleep, Physical Activities, Treatments, Symptoms, etc.
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