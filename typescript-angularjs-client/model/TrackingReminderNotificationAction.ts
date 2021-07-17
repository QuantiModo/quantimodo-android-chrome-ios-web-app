/**
 * quantimodo
 * We make it easy to retrieve and analyze normalized user data from a wide array of devices and applications. Check out our [docs and sdk's](https://github.com/QuantiModo/docs) or [contact us](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.112511
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import * as models from './models';

export interface TrackingReminderNotificationAction {
    /**
     * Ex: track
     */
    "action": string;
    /**
     * Ex: trackThreeRatingAction
     */
    "callback": string;
    /**
     * Ex: 3
     */
    "modifiedValue": number;
    /**
     * Ex: 3/5
     */
    "title": string;
    /**
     * Ex: Rate 3/5
     */
    "longTitle"?: string;
    /**
     * Ex: 3
     */
    "shortTitle"?: string;
}

