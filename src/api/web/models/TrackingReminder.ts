/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';
import type { TrackingReminderNotificationAction } from './TrackingReminderNotificationAction';
import type { Unit } from './Unit';

export type TrackingReminder = {
    actionArray?: Array<TrackingReminderNotificationAction>;
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
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    clientId?: string;
    /**
     * The way multiple measurements are aggregated over time
     */
    combinationOperation?: TrackingReminder.combinationOperation;
    /**
     * Ex: 2016-05-18 02:24:08 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    createdAt?: string;
    /**
     * Ex: Trader Joe's Bedtime Tea
     */
    displayName?: string;
    /**
     * Ex: /5
     */
    unitAbbreviatedName: string;
    /**
     * Ex: 5
     */
    unitCategoryId?: number;
    /**
     * Ex: Rating
     */
    unitCategoryName?: string;
    /**
     * Ex: 10
     */
    unitId?: number;
    /**
     * Ex: 1 to 5 Rating
     */
    unitName?: string;
    /**
     * Default value to use for the measurement when tracking. Unit: User-specified or common.
     */
    defaultValue?: number;
    /**
     * If a tracking reminder is enabled, tracking reminder notifications will be generated for this variable.
     */
    enabled?: boolean;
    /**
     * True if the reminders should be delivered via email
     */
    email?: boolean;
    /**
     * Ex: reminderStartTimeLocal is less than $user->earliestReminderTime or greater than  $user->latestReminderTime
     */
    errorMessage?: string;
    /**
     * Ex: 0. Unit: User-specified or common.
     */
    fillingValue?: number;
    /**
     * Ex: 02:45:20 in UTC timezone
     */
    firstDailyReminderTime?: string;
    /**
     * Ex: Daily
     */
    frequencyTextDescription?: string;
    /**
     * Ex: Daily at 09:45 PM
     */
    frequencyTextDescriptionWithTime?: string;
    /**
     * id
     */
    id?: number;
    /**
     * Ex: saddestFaceIsFive
     */
    inputType?: string;
    /**
     * Ex: I am an instruction!
     */
    instructions?: string;
    /**
     * Ex: ion-sad-outline
     */
    ionIcon?: string;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the last time a measurement was received for this user and variable
     */
    lastTracked?: string;
    /**
     * Ex: 2
     */
    lastValue?: number;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss  timestamp for the reminder time of the latest tracking reminder notification that has been pre-emptively generated in the database
     */
    latestTrackingReminderNotificationReminderTime?: string;
    localDailyReminderNotificationTimes?: Array<string>;
    localDailyReminderNotificationTimesForAllReminders?: Array<string>;
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
     * Ex: 1501555520
     */
    nextReminderTimeEpochSeconds?: number;
    /**
     * True if the reminders should appear in the notification bar
     */
    notificationBar?: boolean;
    /**
     * Ex: 445
     */
    numberOfRawMeasurements?: number;
    /**
     * Ex: 1
     */
    numberOfUniqueValues?: number;
    /**
     * Indicates whether or not the variable is usually an outcome of interest such as a symptom or emotion
     */
    outcome?: boolean;
    /**
     * Ex: img/variable_categories/symptoms.png
     */
    pngPath?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/symptoms.png
     */
    pngUrl?: string;
    /**
     * Link to associated product for purchase
     */
    productUrl?: string;
    /**
     * True if the reminders should appear as a popup notification
     */
    popUp?: boolean;
    /**
     * Ex: How is your overall mood?
     */
    question?: string;
    /**
     * Ex: How is your overall mood on a scale of 1 to 5??
     */
    longQuestion?: string;
    /**
     * Latest time of day at which reminders should appear in UTC HH:MM:SS format
     */
    reminderEndTime?: string;
    /**
     * Number of seconds between one reminder and the next
     */
    reminderFrequency: number;
    /**
     * String identifier for the sound to accompany the reminder
     */
    reminderSound?: string;
    /**
     * Ex: 1469760320
     */
    reminderStartEpochSeconds?: number;
    /**
     * Earliest time of day at which reminders should appear in UTC HH:MM:SS format
     */
    reminderStartTime?: string;
    /**
     * Ex: 21:45:20
     */
    reminderStartTimeLocal?: string;
    /**
     * Ex: 09:45 PM
     */
    reminderStartTimeLocalHumanFormatted?: string;
    /**
     * Ex: true
     */
    repeating?: boolean;
    /**
     * Ex: 01:00:00
     */
    secondDailyReminderTime?: string;
    /**
     * Ex: 1. Unit: User-specified or common.
     */
    secondToLastValue?: number;
    /**
     * True if the reminders should be delivered via SMS
     */
    sms?: boolean;
    /**
     * Earliest date on which the user should be reminded to track in YYYY-MM-DD format
     */
    startTrackingDate?: string;
    /**
     * Latest date on which the user should be reminded to track in YYYY-MM-DD format
     */
    stopTrackingDate?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/symptoms.svg
     */
    svgUrl?: string;
    /**
     * Ex: 20:00:00
     */
    thirdDailyReminderTime?: string;
    /**
     * Ex: 3
     */
    thirdToLastValue?: number;
    /**
     * Ex: 11841
     */
    trackingReminderId?: number;
    /**
     * Ex: Not Found
     */
    trackingReminderImageUrl?: string;
    /**
     * UPC or other barcode scan result
     */
    upc?: string;
    /**
     * When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     */
    updatedAt?: string;
    /**
     * ID of User
     */
    userId?: number;
    /**
     * Ex: /5
     */
    userVariableUnitAbbreviatedName?: string;
    /**
     * Ex: 5
     */
    userVariableUnitCategoryId?: number;
    /**
     * Ex: Rating
     */
    userVariableUnitCategoryName?: string;
    /**
     * Ex: 10
     */
    userVariableUnitId?: number;
    /**
     * Ex: 1 to 5 Rating
     */
    userVariableUnitName?: string;
    /**
     * Ex: 10
     */
    userVariableVariableCategoryId?: number;
    /**
     * Ex: Symptoms
     */
    userVariableVariableCategoryName?: string;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    valence?: string;
    /**
     * Ex: Rate daily
     */
    valueAndFrequencyTextDescription?: string;
    /**
     * Ex: Rate daily at 09:45 PM
     */
    valueAndFrequencyTextDescriptionWithTime?: string;
    /**
     * Ex: 10
     */
    variableCategoryId?: number;
    /**
     * Ex: https://static.quantimo.do/img/variable_categories/sad-96.png
     */
    variableCategoryImageUrl?: string;
    /**
     * Ex: Emotions, Treatments, Symptoms...
     */
    variableCategoryName: TrackingReminder.variableCategoryName;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    variableDescription?: string;
    /**
     * Id for the variable to be tracked
     */
    variableId?: number;
    /**
     * Name of the variable to be used when sending measurements
     */
    variableName: string;
}

export namespace TrackingReminder {

    /**
     * The way multiple measurements are aggregated over time
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