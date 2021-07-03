/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';
import type { Error } from './Error';

export type FeedResponse = {
    cards: Array<Card>;
    /**
     * Tracking reminder notifications, messages, and study result cards that can be displayed in user feed or stream
     */
    description: string;
    /**
     * Tracking reminder notifications, messages, and study results
     */
    summary: string;
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
    /**
     * A super neat url you might want to share with your users!
     */
    link?: string;
    card?: Card;
}