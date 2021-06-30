import { request as __request } from '../core/request';
export class AppSettingsService {
    /**
     * Get client app settings
     * Get the settings for your application configurable at https://builder.quantimo.do
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param allStaticAppData Get units, variable categories, and common variables that can be used in the app
     * @returns AppSettingsResponse Successful operation
     * @throws ApiError
     */
    static async getAppSettings(clientId, allStaticAppData) {
        const result = await __request({
            method: 'GET',
            path: `/v3/appSettings`,
            query: {
                'clientId': clientId,
                'allStaticAppData': allStaticAppData,
            },
            errors: {
                401: `Successful operation`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }
}
