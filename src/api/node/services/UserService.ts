/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PostUserSettingsResponse } from '../models/PostUserSettingsResponse';
import type { User } from '../models/User';
import type { UsersResponse } from '../models/UsersResponse';
import { request as __request } from '../core/request';

export class UserService {

    /**
     * Get user info
     * Returns user info.  If no userId is specified, returns info for currently authenticated user
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param userId User's id
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param appVersion Ex: 2.1.1.0
     * @param clientUserId Ex: 74802
     * @param log Username or email
     * @param pwd User password
     * @param includeAuthorizedClients Return list of apps, studies, and individuals with access to user data
     * @returns User Successful operation
     * @throws ApiError
     */
    public static async getUser(
clientId?: string,
userId?: number,
updatedAt?: string,
limit: number = 100,
offset?: number,
sort?: string,
createdAt?: string,
appVersion?: string,
clientUserId?: number,
log?: string,
pwd?: string,
includeAuthorizedClients?: boolean,
): Promise<User> {
        const result = await __request({
            method: 'GET',
            path: `/v3/user`,
            query: {
                'clientId': clientId,
                'userId': userId,
                'updatedAt': updatedAt,
                'limit': limit,
                'offset': offset,
                'sort': sort,
                'createdAt': createdAt,
                'appVersion': appVersion,
                'clientUserId': clientUserId,
                'log': log,
                'pwd': pwd,
                'includeAuthorizedClients': includeAuthorizedClients,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Get users who shared data
     * Returns users who have granted access to their data
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param userId User's id
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param appVersion Ex: 2.1.1.0
     * @param clientUserId Ex: 74802
     * @param log Username or email
     * @param pwd User password
     * @returns UsersResponse Successful operation
     * @throws ApiError
     */
    public static async getUsers(
sort?: string,
userId?: number,
updatedAt?: string,
limit: number = 100,
offset?: number,
createdAt?: string,
clientId?: string,
appVersion?: string,
clientUserId?: number,
log?: string,
pwd?: string,
): Promise<UsersResponse> {
        const result = await __request({
            method: 'GET',
            path: `/v3/users`,
            query: {
                'sort': sort,
                'userId': userId,
                'updatedAt': updatedAt,
                'limit': limit,
                'offset': offset,
                'createdAt': createdAt,
                'clientId': clientId,
                'appVersion': appVersion,
                'clientUserId': clientUserId,
                'log': log,
                'pwd': pwd,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Delete user
     * Delete user account. Only the client app that created a user can delete that user.
     * @param reason Ex: I hate you!
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns void 
     * @throws ApiError
     */
    public static async deleteUser(
reason: string,
clientId?: string,
): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/v3/user/delete`,
            query: {
                'reason': reason,
                'clientId': clientId,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Post UserSettings
     * Post UserSettings
     * @param requestBody User settings to update
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns PostUserSettingsResponse Successful operation
     * @throws ApiError
     */
    public static async postUserSettings(
requestBody: User,
clientId?: string,
): Promise<PostUserSettingsResponse> {
        const result = await __request({
            method: 'POST',
            path: `/v3/userSettings`,
            query: {
                'clientId': clientId,
            },
            body: requestBody,
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }

}