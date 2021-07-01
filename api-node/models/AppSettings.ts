/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AdditionalSettings } from './AdditionalSettings';
import type { AppDesign } from './AppDesign';
import type { AppStatus } from './AppStatus';
import type { User } from './User';

export type AppSettings = {
    additionalSettings?: AdditionalSettings;
    /**
     * What do you expect?
     */
    appDescription?: string;
    appDesign?: AppDesign;
    /**
     * What do you expect?
     */
    appDisplayName?: string;
    appStatus?: AppStatus;
    /**
     * What do you expect?
     */
    appType?: string;
    /**
     * What do you expect?
     */
    buildEnabled?: string;
    /**
     * Get yours at https:://builder.quantimo.do
     */
    clientId: string;
    /**
     * Get yours at https:://builder.quantimo.do
     */
    clientSecret?: string;
    /**
     * What do you expect?
     */
    collaborators?: Array<User>;
    /**
     * What do you expect?
     */
    createdAt?: string;
    /**
     * User id of the owner of the application
     */
    userId?: number;
    /**
     * What do you expect?
     */
    users?: Array<User>;
    /**
     * What do you expect?
     */
    redirectUri?: string;
    /**
     * What do you expect?
     */
    companyName?: string;
    /**
     * What do you expect?
     */
    homepageUrl?: string;
    /**
     * What do you expect?
     */
    iconUrl?: string;
    /**
     * What do you expect?
     */
    longDescription?: string;
    /**
     * What do you expect?
     */
    splashScreen?: string;
    /**
     * What do you expect?
     */
    textLogo?: string;
}