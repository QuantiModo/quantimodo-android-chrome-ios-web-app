/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type DeviceToken = {
    /**
     * Client id
     */
    clientId?: string;
    /**
     * ios, android, or web
     */
    platform: string;
    /**
     * The device token
     */
    deviceToken: string;
}