/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TrackingReminderNotificationTrackAllAction = {
    /**
     * Ex: trackAll
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
     * Ex: Rate 3/5 for all
     */
    title: string;
}