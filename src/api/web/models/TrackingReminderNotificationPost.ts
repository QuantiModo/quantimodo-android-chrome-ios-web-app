/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TrackingReminderNotificationPost = {
    /**
     * track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
     */
    action: TrackingReminderNotificationPost.action;
    /**
     * Id of the TrackingReminderNotification
     */
    id: number;
    /**
     * Optional value to be recorded instead of the tracking reminder default value
     */
    modifiedValue?: number;
}

export namespace TrackingReminderNotificationPost {

    /**
     * track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
     */
    export enum action {
        SKIP = 'skip',
        SNOOZE = 'snooze',
        TRACK = 'track',
    }


}