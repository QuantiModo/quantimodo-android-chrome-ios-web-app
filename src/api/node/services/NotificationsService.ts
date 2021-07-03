/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Card } from '../models/Card';
import type { DeviceToken } from '../models/DeviceToken';
import type { FeedResponse } from '../models/FeedResponse';
import type { NotificationsResponse } from '../models/NotificationsResponse';
import { request as __request } from '../core/request';

export class NotificationsService {

    /**
     * Post DeviceTokens
     * Post user token for Android, iOS, or web push notifications
     * @param requestBody The platform and token
     * @returns any Successful operation
     * @throws ApiError
     */
    public static async postDeviceToken(
requestBody: DeviceToken,
): Promise<any> {
        const result = await __request({
            method: 'POST',
            path: `/v3/deviceTokens`,
            body: requestBody,
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }

    /**
     * Tracking reminder notifications, messages, and study results
     * Tracking reminder notifications, messages, and study results
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns FeedResponse Successful operation
     * @throws ApiError
     */
    public static async getFeed(
sort?: string,
userId?: number,
createdAt?: string,
updatedAt?: string,
limit: number = 100,
offset?: number,
clientId?: string,
): Promise<FeedResponse> {
        const result = await __request({
            method: 'GET',
            path: `/v3/feed`,
            query: {
                'sort': sort,
                'userId': userId,
                'createdAt': createdAt,
                'updatedAt': updatedAt,
                'limit': limit,
                'offset': offset,
                'clientId': clientId,
            },
        });
        return result.body;
    }

    /**
     * Post user interactions with feed
     * Post user actions on feed cards
     * @param requestBody Id of the tracking reminder notification to be snoozed
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns FeedResponse Returns new feed cards
     * @throws ApiError
     */
    public static async postFeed(
requestBody: Array<Card>,
userId?: number,
clientId?: string,
): Promise<FeedResponse> {
        const result = await __request({
            method: 'POST',
            path: `/v3/feed`,
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
     * Get NotificationPreferences
     * Get NotificationPreferences
     * @returns any Successful operation
     * @throws ApiError
     */
    public static async getNotificationPreferences(): Promise<any> {
        const result = await __request({
            method: 'GET',
            path: `/v3/notificationPreferences`,
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }

    /**
     * Get Notifications
     * Get Notifications
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns NotificationsResponse Successful operation
     * @throws ApiError
     */
    public static async getNotifications(
sort?: string,
limit: number = 100,
offset?: number,
updatedAt?: string,
userId?: number,
createdAt?: string,
id?: number,
clientId?: string,
): Promise<Array<NotificationsResponse>> {
        const result = await __request({
            method: 'GET',
            path: `/v3/notifications`,
            query: {
                'sort': sort,
                'limit': limit,
                'offset': offset,
                'updatedAt': updatedAt,
                'userId': userId,
                'createdAt': createdAt,
                'id': id,
                'clientId': clientId,
            },
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }

    /**
     * Post Notifications
     * Post Notifications
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns NotificationsResponse Successful operation
     * @throws ApiError
     */
    public static async postNotifications(
sort?: string,
limit: number = 100,
offset?: number,
updatedAt?: string,
userId?: number,
createdAt?: string,
id?: number,
clientId?: string,
): Promise<Array<NotificationsResponse>> {
        const result = await __request({
            method: 'POST',
            path: `/v3/notifications`,
            query: {
                'sort': sort,
                'limit': limit,
                'offset': offset,
                'updatedAt': updatedAt,
                'userId': userId,
                'createdAt': createdAt,
                'id': id,
                'clientId': clientId,
            },
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }

}