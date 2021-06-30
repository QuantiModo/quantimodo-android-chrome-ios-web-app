import { request as __request } from '../core/request';
export class SharesService {
    /**
     * Get Authorized Apps, Studies, and Individuals
     * This is a list of individuals, apps, or studies with access to your measurements.
     * @param userId User's id
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param appVersion Ex: 2.1.1.0
     * @param log Username or email
     * @param pwd User password
     * @returns GetSharesResponse Successful Operation
     * @throws ApiError
     */
    static async getShares(userId, createdAt, updatedAt, clientId, appVersion, log, pwd) {
        const result = await __request({
            method: 'GET',
            path: `/v3/shares`,
            query: {
                'userId': userId,
                'createdAt': createdAt,
                'updatedAt': updatedAt,
                'clientId': clientId,
                'appVersion': appVersion,
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
     * Delete share
     * Remove access to user data for a given client_id associated with a given individual, app, or study
     * @param clientIdToRevoke Client id of the individual, study, or app that the user wishes to no longer have access to their data
     * @param reason Ex: I hate you!
     * @returns void
     * @throws ApiError
     */
    static async deleteShare(clientIdToRevoke, reason) {
        const result = await __request({
            method: 'POST',
            path: `/v3/shares/delete`,
            query: {
                'clientIdToRevoke': clientIdToRevoke,
                'reason': reason,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
    /**
     * Delete share
     * Invite someone to view your measurements
     * @param requestBody Details about person to share with
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns void
     * @throws ApiError
     */
    static async inviteShare(requestBody, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/shares/invite`,
            query: {
                'clientId': clientId,
            },
            body: requestBody,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
}
