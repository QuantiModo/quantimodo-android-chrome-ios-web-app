/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetConnectorsResponse } from '../models/GetConnectorsResponse';
import { request as __request } from '../core/request';

export class ConnectorsService {

    /**
     * Mobile connect page
     * This page is designed to be opened in a webview.  Instead of using popup authentication boxes, it uses redirection. You can include the user's access_token as a URL parameter like https://app.quantimo.do/api/v3/connect/mobile?access_token=123
     * @param userId User's id
     * @returns any Mobile connect page was returned
     * @throws ApiError
     */
    public static async getMobileConnectPage(
userId?: number,
): Promise<any> {
        const result = await __request({
            method: 'GET',
            path: `/v3/connect/mobile`,
            query: {
                'userId': userId,
            },
            errors: {
                401: `User token is missing`,
                403: `User token is incorrect`,
            },
        });
        return result.body;
    }

    /**
     * List of Connectors
     * A connector pulls data from other data providers using their API or a screenscraper. Returns a list of all available connectors and information about them such as their id, name, whether the user has provided access, logo url, connection instructions, and the update history.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GetConnectorsResponse Successful operation
     * @throws ApiError
     */
    public static async getConnectors(
clientId?: string,
): Promise<GetConnectorsResponse> {
        const result = await __request({
            method: 'GET',
            path: `/v3/connectors/list`,
            query: {
                'clientId': clientId,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Obtain a token from 3rd party data source
     * Attempt to obtain a token from the data provider, store it in the database. With this, the connector to continue to obtain new user data until the token is revoked.
     * @param connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @param userId User's id
     * @returns any Successful operation
     * @throws ApiError
     */
    public static async connectConnector(
connectorName: 'facebook' | 'fitbit' | 'github' | 'googlecalendar' | 'googlefit' | 'medhelper' | 'mint' | 'moodpanda' | 'moodscope' | 'myfitnesspal' | 'mynetdiary' | 'netatmo' | 'rescuetime' | 'runkeeper' | 'slack' | 'sleepcloud' | 'slice' | 'up' | 'whatpulse' | 'withings' | 'worldweatheronline' | 'foursquare' | 'strava' | 'gmail',
userId?: number,
): Promise<any> {
        const result = await __request({
            method: 'GET',
            path: `/v3/connectors/${connectorName}/connect`,
            query: {
                'userId': userId,
            },
            errors: {
                401: `Not Authenticated`,
                404: `Method not found. Could not execute the requested method.`,
                500: `Error during update. Unsupported response from update().`,
            },
        });
        return result.body;
    }

    /**
     * Delete stored connection info
     * The disconnect method deletes any stored tokens or connection information from the connectors database.
     * @param connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @returns any Successful operation
     * @throws ApiError
     */
    public static async disconnectConnector(
connectorName: 'facebook' | 'fitbit' | 'github' | 'googlecalendar' | 'googlefit' | 'medhelper' | 'mint' | 'moodpanda' | 'moodscope' | 'myfitnesspal' | 'mynetdiary' | 'netatmo' | 'rescuetime' | 'runkeeper' | 'slack' | 'sleepcloud' | 'slice' | 'up' | 'whatpulse' | 'withings' | 'worldweatheronline' | 'foursquare' | 'strava' | 'gmail',
): Promise<any> {
        const result = await __request({
            method: 'GET',
            path: `/v3/connectors/${connectorName}/disconnect`,
            errors: {
                401: `Not Authenticated`,
                404: `Method not found. Could not execute the requested method.`,
                500: `Error during update. Unsupported response from update().`,
            },
        });
        return result.body;
    }

    /**
     * Sync with data source
     * The update method tells the QM Connector Framework to check with the data provider (such as Fitbit or MyFitnessPal) and retrieve any new measurements available.
     * @param connectorName Lowercase system name of the source application or device. Get a list of available connectors from the /v3/connectors/list endpoint.
     * @param userId User's id
     * @returns any Connection Successful
     * @throws ApiError
     */
    public static async updateConnector(
connectorName: 'facebook' | 'fitbit' | 'github' | 'googlecalendar' | 'googlefit' | 'medhelper' | 'mint' | 'moodpanda' | 'moodscope' | 'myfitnesspal' | 'mynetdiary' | 'netatmo' | 'rescuetime' | 'runkeeper' | 'slack' | 'sleepcloud' | 'slice' | 'up' | 'whatpulse' | 'withings' | 'worldweatheronline' | 'foursquare' | 'strava' | 'gmail',
userId?: number,
): Promise<any> {
        const result = await __request({
            method: 'GET',
            path: `/v3/connectors/${connectorName}/update`,
            query: {
                'userId': userId,
            },
            errors: {
                401: `Not Authenticated`,
                404: `Method not found. Could not execute the requested method.`,
                500: `Error during update. Unsupported response from update().`,
            },
        });
        return result.body;
    }

    /**
     * Get embeddable connect javascript
     * Get embeddable connect javascript. Usage:
 * - Embedding in applications with popups for 3rd-party authentication
 * windows.
 * Use `qmSetupInPopup` function after connecting `connect.js`.
 * - Embedding in applications with popups for 3rd-party authentication
 * windows.
 * Requires a selector to block. It will be embedded in this block.
 * Use `qmSetupOnPage` function after connecting `connect.js`.
 * - Embedding in mobile applications without popups for 3rd-party
 * authentication.
 * Use `qmSetupOnMobile` function after connecting `connect.js`.
 * If using in a Cordova application call  `qmSetupOnIonic` function after connecting `connect.js`.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns any Embeddable connect javascript was returned
     * @throws ApiError
     */
    public static async getIntegrationJs(
clientId?: string,
): Promise<any> {
        const result = await __request({
            method: 'GET',
            path: `/v3/integration.js`,
            query: {
                'clientId': clientId,
            },
        });
        return result.body;
    }

}