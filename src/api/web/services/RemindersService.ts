/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommonResponse } from '../models/CommonResponse';
import type { GetTrackingReminderNotificationsResponse } from '../models/GetTrackingReminderNotificationsResponse';
import type { PostTrackingRemindersResponse } from '../models/PostTrackingRemindersResponse';
import type { TrackingReminder } from '../models/TrackingReminder';
import type { TrackingReminderNotificationPost } from '../models/TrackingReminderNotificationPost';
import { request as __request } from '../core/request';

export class RemindersService {

    /**
     * Get specific tracking reminder notifications
     * Specific tracking reminder notification instances that still need to be tracked.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param userId User's id
     * @param variableCategoryName Ex: Emotions, Treatments, Symptoms...
     * @param reminderTime Ex: (lt)2017-07-31 21:43:26
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param onlyPast Ex: 1
     * @param includeDeleted Include deleted variables
     * @returns GetTrackingReminderNotificationsResponse Successful operation
     * @throws ApiError
     */
    public static async getTrackingReminderNotifications(
offset?: number,
sort?: string,
createdAt?: string,
updatedAt?: string,
limit: number = 100,
userId?: number,
variableCategoryName?: 'Activities' | 'Books' | 'Causes of Illness' | 'Cognitive Performance' | 'Conditions' | 'Emotions' | 'Environment' | 'Foods' | 'Location' | 'Miscellaneous' | 'Movies and TV' | 'Music' | 'Nutrients' | 'Payments' | 'Physical Activity' | 'Physique' | 'Sleep' | 'Social Interactions' | 'Software' | 'Symptoms' | 'Treatments' | 'Vital Signs' | 'Goals',
reminderTime?: string,
clientId?: string,
onlyPast?: boolean,
includeDeleted?: boolean,
): Promise<GetTrackingReminderNotificationsResponse> {
        const result = await __request({
            method: 'GET',
            path: `/v3/trackingReminderNotifications`,
            query: {
                'offset': offset,
                'sort': sort,
                'createdAt': createdAt,
                'updatedAt': updatedAt,
                'limit': limit,
                'userId': userId,
                'variableCategoryName': variableCategoryName,
                'reminderTime': reminderTime,
                'clientId': clientId,
                'onlyPast': onlyPast,
                'includeDeleted': includeDeleted,
            },
        });
        return result.body;
    }

    /**
     * Snooze, skip, or track a tracking reminder notification
     * Snooze, skip, or track a tracking reminder notification
     * @param requestBody Id of the tracking reminder notification to be snoozed
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    public static async postTrackingReminderNotifications(
requestBody: Array<TrackingReminderNotificationPost>,
userId?: number,
clientId?: string,
): Promise<CommonResponse> {
        const result = await __request({
            method: 'POST',
            path: `/v3/trackingReminderNotifications`,
            query: {
                'userId': userId,
                'clientId': clientId,
            },
            body: requestBody,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Get repeating tracking reminder settings
     * Users can be reminded to track certain variables at a specified frequency with a default value.
     * @param userId User's id
     * @param variableCategoryName Ex: Emotions, Treatments, Symptoms...
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param appVersion Ex: 2.1.1.0
     * @returns TrackingReminder Successful operation
     * @throws ApiError
     */
    public static async getTrackingReminders(
userId?: number,
variableCategoryName?: 'Activities' | 'Books' | 'Causes of Illness' | 'Cognitive Performance' | 'Conditions' | 'Emotions' | 'Environment' | 'Foods' | 'Location' | 'Miscellaneous' | 'Movies and TV' | 'Music' | 'Nutrients' | 'Payments' | 'Physical Activity' | 'Physique' | 'Sleep' | 'Social Interactions' | 'Software' | 'Symptoms' | 'Treatments' | 'Vital Signs' | 'Goals',
createdAt?: string,
updatedAt?: string,
limit: number = 100,
offset?: number,
sort?: string,
clientId?: string,
appVersion?: string,
): Promise<Array<TrackingReminder>> {
        const result = await __request({
            method: 'GET',
            path: `/v3/trackingReminders`,
            query: {
                'userId': userId,
                'variableCategoryName': variableCategoryName,
                'createdAt': createdAt,
                'updatedAt': updatedAt,
                'limit': limit,
                'offset': offset,
                'sort': sort,
                'clientId': clientId,
                'appVersion': appVersion,
            },
        });
        return result.body;
    }

    /**
     * Store a Tracking Reminder
     * This is to enable users to create reminders to track a variable with a default value at a specified frequency
     * @param requestBody TrackingReminder that should be stored
     * @returns PostTrackingRemindersResponse Successful operation
     * @throws ApiError
     */
    public static async postTrackingReminders(
requestBody: Array<TrackingReminder>,
): Promise<PostTrackingRemindersResponse> {
        const result = await __request({
            method: 'POST',
            path: `/v3/trackingReminders`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Delete Tracking Reminder
     * Stop getting notifications to record data for a variable.  Previously recorded measurements will be preserved.
     * @param userId User's id
     * @returns void 
     * @throws ApiError
     */
    public static async deleteTrackingReminder(
userId?: number,
): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/v3/trackingReminders/delete`,
            query: {
                'userId': userId,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

}