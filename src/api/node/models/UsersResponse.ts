/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';
import type { Error } from './Error';
import type { Image } from './Image';
import type { User } from './User';

export type UsersResponse = {
    users: Array<User>;
    /**
     * Users who granted access to their data
     */
    description?: string;
    /**
     * Users who granted access to their data
     */
    summary?: string;
    /**
     * Array of error objects with message property
     */
    errors?: Array<Error>;
    /**
     * ex. OK or ERROR
     */
    status?: string;
    /**
     * true or false
     */
    success?: boolean;
    /**
     * Response code such as 200
     */
    code?: number;
    image?: Image;
    /**
     * Square icon png url
     */
    avatar?: string;
    /**
     * Ex: ion-ios-person
     */
    ionIcon?: string;
    /**
     * Users who granted access to their data
     */
    html?: string;
    /**
     * A super neat url you might want to share with your users!
     */
    link?: string;
    card?: Card;
}