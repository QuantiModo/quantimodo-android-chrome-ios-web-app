/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export var TrackingReminderNotificationPost;
(function (TrackingReminderNotificationPost) {
    /**
     * track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
     */
    let action;
    (function (action) {
        action["SKIP"] = "skip";
        action["SNOOZE"] = "snooze";
        action["TRACK"] = "track";
    })(action = TrackingReminderNotificationPost.action || (TrackingReminderNotificationPost.action = {}));
})(TrackingReminderNotificationPost || (TrackingReminderNotificationPost = {}));
