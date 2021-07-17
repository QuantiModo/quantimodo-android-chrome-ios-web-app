/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AppSettings } from './AppSettings';

export type AuthorizedClients = {
    /**
     * Applications with access to user measurements for all variables
     */
    apps: Array<AppSettings>;
    /**
     * Individuals such as physicians or family members with access to user measurements for all variables
     */
    individuals: Array<AppSettings>;
    /**
     * Studies with access to generally anonymous user measurements for a specific predictor and outcome variable
     */
    studies: Array<AppSettings>;
}