import { request as __request } from '../core/request';
export class SocialService {
    /**
     * Get Activities
     * Get Activities
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns ActivitiesResponse Successful operation
     * @throws ApiError
     */
    static async getActivities(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/activities`,
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
     * Post Activities
     * Post Activities
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns ActivitiesResponse Successful operation
     * @throws ApiError
     */
    static async postActivities(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/activities`,
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
    static async getFriends(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
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
    static async postFriends(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
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
    /**
     * Get Groups
     * Get Groups
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GroupsResponse Successful operation
     * @throws ApiError
     */
    static async getGroups(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/groups`,
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
     * Post Groups
     * Post Groups
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GroupsResponse Successful operation
     * @throws ApiError
     */
    static async postGroups(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/groups`,
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
     * Get GroupsMembers
     * Get GroupsMembers
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GroupsMembersResponse Successful operation
     * @throws ApiError
     */
    static async getGroupsMembers(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/groupsMembers`,
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
     * Post GroupsMembers
     * Post GroupsMembers
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GroupsMembersResponse Successful operation
     * @throws ApiError
     */
    static async postGroupsMembers(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/groupsMembers`,
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
     * Get MessagesMessages
     * Get MessagesMessages
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns MessagesMessagesResponse Successful operation
     * @throws ApiError
     */
    static async getMessagesMessages(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/messagesMessages`,
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
     * Post MessagesMessages
     * Post MessagesMessages
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns MessagesMessagesResponse Successful operation
     * @throws ApiError
     */
    static async postMessagesMessages(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/messagesMessages`,
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
     * Get MessagesNotices
     * Get MessagesNotices
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns MessagesNoticesResponse Successful operation
     * @throws ApiError
     */
    static async getMessagesNotices(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/messagesNotices`,
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
     * Post MessagesNotices
     * Post MessagesNotices
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns MessagesNoticesResponse Successful operation
     * @throws ApiError
     */
    static async postMessagesNotices(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/messagesNotices`,
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
     * Get MessagesRecipients
     * Get MessagesRecipients
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns MessagesRecipientsResponse Successful operation
     * @throws ApiError
     */
    static async getMessagesRecipients(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/messagesRecipients`,
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
     * Post MessagesRecipients
     * Post MessagesRecipients
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns MessagesRecipientsResponse Successful operation
     * @throws ApiError
     */
    static async postMessagesRecipients(sort, limit = 100, offset, updatedAt, userId, createdAt, id, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/messagesRecipients`,
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
