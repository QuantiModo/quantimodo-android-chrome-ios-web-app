/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type {FriendsResponse} from '../models/FriendsResponse';
import {request as __request} from '../core/request';

export class FriendsService {

    /**
     * Get Friends
     * Get Friends
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns FriendsResponse Successful operation
     * @throws ApiError
     */
    public static async getFriends(
        sort?: string,
        limit: number = 100,
        offset?: number,
        updatedAt?: string,
        userId?: number,
        createdAt?: string,
        id?: number,
        clientId?: string,
    ): Promise<Array<FriendsResponse>> {
        const result = await __request({
            method: 'GET',
            path: `/v3/friends`,
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
     * Post Friends
     * Post Friends
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns FriendsResponse Successful operation
     * @throws ApiError
     */
    public static async postFriends(
        sort?: string,
        limit: number = 100,
        offset?: number,
        updatedAt?: string,
        userId?: number,
        createdAt?: string,
        id?: number,
        clientId?: string,
    ): Promise<Array<FriendsResponse>> {
        const result = await __request({
            method: 'POST',
            path: `/v3/friends`,
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
