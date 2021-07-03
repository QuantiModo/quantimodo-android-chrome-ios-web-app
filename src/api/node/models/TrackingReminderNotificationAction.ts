/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TrackingReminderNotificationAction = {
    /**
     * Ex: track
     */
    action: string;
    /**
     * Ex: trackThreeRatingAction
     */
    callback: string;
    /**
     * Ex: 3
     */
    modifiedValue: number;
    /**
     * Ex: 3/5
     */
    title: string;
    /**
     * Ex: Rate 3/5
     */
    longTitle?: string;
    /**
     * Ex: 3
     */
    shortTitle?: string;
}