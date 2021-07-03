"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingReminderNotificationPost = void 0;
var TrackingReminderNotificationPost;
(function (TrackingReminderNotificationPost) {
    /**
     * track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
     */
    var action;
    (function (action) {
        action["SKIP"] = "skip";
        action["SNOOZE"] = "snooze";
        action["TRACK"] = "track";
    })(action = TrackingReminderNotificationPost.action || (TrackingReminderNotificationPost.action = {}));
})(TrackingReminderNotificationPost = exports.TrackingReminderNotificationPost || (exports.TrackingReminderNotificationPost = {}));
//# sourceMappingURL=TrackingReminderNotificationPost.js.map