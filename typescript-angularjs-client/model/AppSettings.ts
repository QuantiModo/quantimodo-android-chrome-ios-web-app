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

export interface AppSettings {
    /**
     * What do you expect?
     */
    "additionalSettings"?: any;
    /**
     * What do you expect?
     */
    "appDescription"?: string;
    /**
     * What do you expect?
     */
    "appDesign"?: any;
    /**
     * What do you expect?
     */
    "appDisplayName"?: string;
    /**
     * What do you expect?
     */
    "appStatus"?: any;
    /**
     * What do you expect?
     */
    "appType"?: string;
    /**
     * What do you expect?
     */
    "buildEnabled"?: string;
    /**
     * Get yours at https:://builder.quantimo.do
     */
    "clientId": string;
    /**
     * Get yours at https:://builder.quantimo.do
     */
    "clientSecret"?: string;
    /**
     * What do you expect?
     */
    "collaborators"?: Array<models.User>;
    /**
     * What do you expect?
     */
    "createdAt"?: string;
    /**
     * User id of the owner of the application
     */
    "userId"?: number;
    /**
     * What do you expect?
     */
    "users"?: Array<models.User>;
    /**
     * What do you expect?
     */
    "redirectUri"?: string;
    /**
     * What do you expect?
     */
    "companyName"?: string;
    /**
     * What do you expect?
     */
    "homepageUrl"?: string;
    /**
     * What do you expect?
     */
    "iconUrl"?: string;
    /**
     * What do you expect?
     */
    "longDescription"?: string;
    /**
     * What do you expect?
     */
    "splashScreen"?: string;
    /**
     * What do you expect?
     */
    "textLogo"?: string;
}

