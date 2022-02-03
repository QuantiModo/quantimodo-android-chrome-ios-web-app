/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';
import type { TrackingReminderNotificationAction } from './TrackingReminderNotificationAction';
import type { TrackingReminderNotificationTrackAllAction } from './TrackingReminderNotificationTrackAllAction';
import type { Unit } from './Unit';

export type TrackingReminderNotification = {
    actionArray: Array<TrackingReminderNotificationAction>;
    availableUnits: Array<Unit>;
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
    combinationOperation?: TrackingReminderNotification.combinationOperation;
    /**
     * Ex: 2017-07-29 20:49:54 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    createdAt?: string;
    /**
     * Ex: Trader Joe's Bedtime Tea
     */
    displayName?: string;
    /**
     * Is the user specified default value or falls back to the last value in user unit. Good for initializing input fields. Unit: User-specified or common.
     */
    modifiedValue?: number;
    /**
     * Ex: /5
     */
    unitAbbreviatedName?: string;
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
     * Default value to use for the measurement when tracking
     */
    defaultValue?: number;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    description?: string;
    /**
     * True if the reminders should be delivered via email
     */
    email?: boolean;
    /**
     * Ex: 0
     */
    fillingValue: number;
    /**
     * Ex: ion-sad-outline
     */
    iconIcon?: string;
    /**
     * id for the specific PENDING tracking remidner
     */
    id: number;
    /**
     * Ex: https://rximage.nlm.nih.gov/image/images/gallery/original/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg
     */
    imageUrl?: string;
    /**
     * Ex: happiestFaceIsFive
     */
    inputType?: string;
    /**
     * Ex: ion-happy-outline
     */
    ionIcon?: string;
    /**
     * Ex: 3
     */
    lastValue?: number;
    /**
     * True if this variable is normally tracked via manual user input rather than automatic imports
     */
    manualTracking?: boolean;
    /**
     * Ex: 5
     */
    maximumAllowedValue?: number;
    /**
     * Ex: 1
     */
    minimumAllowedValue?: number;
    /**
     * Ex: 3
     */
    mostCommonValue?: number;
    /**
     * True if the reminders should appear in the notification bar
     */
    notificationBar?: boolean;
    /**
     * Ex: UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    notifiedAt?: string;
    /**
     * Ex: 5
     */
    numberOfUniqueValues?: number;
    /**
     * Indicates whether or not the variable is usually an outcome of interest such as a symptom or emotion
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
     * True if the reminders should appear as a popup notification
     */
    popUp?: boolean;
    /**
     * Link to associated product for purchase
     */
    productUrl?: string;
    /**
     * Ex: How is your overall mood?
     */
    question?: string;
    /**
     * Ex: How is your overall mood on a scale of 1 to 5??
     */
    longQuestion?: string;
    /**
     * Ex: 01-01-2018
     */
    reminderEndTime?: string;
    /**
     * How often user should be reminded in seconds. Ex: 86400
     */
    reminderFrequency?: number;
    /**
     * String identifier for the sound to accompany the reminder
     */
    reminderSound?: string;
    /**
     * Earliest time of day at which reminders should appear in UTC HH:MM:SS format
     */
    reminderStartTime?: string;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used.
     */
    reminderTime?: string;
    /**
     * Ex: 4
     */
    secondMostCommonValue?: number;
    /**
     * Ex: 1
     */
    secondToLastValue?: number;
    /**
     * True if the reminders should be delivered via SMS
     */
    sms?: boolean;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/emotions.svg
     */
    svgUrl?: string;
    /**
     * Ex: 2
     */
    thirdMostCommonValue?: number;
    /**
     * Ex: 2
     */
    thirdToLastValue?: number;
    /**
     * Ex: Rate Overall Mood
     */
    title?: string;
    /**
     * Ex: 3
     */
    total?: number;
    trackAllActions: Array<TrackingReminderNotificationTrackAllAction>;
    /**
     * id for the repeating tracking remidner
     */
    trackingReminderId?: number;
    /**
     * Ex: https://rximage.nlm.nih.gov/image/images/gallery/original/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg
     */
    trackingReminderImageUrl?: string;
    /**
     * Ex: 5072482
     */
    trackingReminderNotificationId?: number;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used.
     */
    trackingReminderNotificationTime?: string;
    /**
     * Ex: 1501534124
     */
    trackingReminderNotificationTimeEpoch?: number;
    /**
     * Ex: 15:48:44
     */
    trackingReminderNotificationTimeLocal?: string;
    /**
     * Ex: 8PM Sun, May 1
     */
    trackingReminderNotificationTimeLocalHumanString?: string;
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
     * Ex: 1
     */
    userVariableVariableCategoryId?: number;
    /**
     * Ex: Emotions
     */
    userVariableVariableCategoryName?: string;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    valence?: string;
    /**
     * Ex: 1
     */
    variableCategoryId?: number;
    /**
     * Ex: https://static.quantimo.do/img/variable_categories/theatre_mask-96.png
     */
    variableCategoryImageUrl?: string;
    /**
     * Ex: Emotions, Treatments, Symptoms...
     */
    variableCategoryName?: TrackingReminderNotification.variableCategoryName;
    /**
     * Id for the variable to be tracked
     */
    variableId?: number;
    /**
     * Ex: https://image.png
     */
    variableImageUrl?: string;
    /**
     * Name of the variable to be used when sending measurements
     */
    variableName?: string;
}

export namespace TrackingReminderNotification {

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