/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';
import type { Error } from './Error';
import type { Image } from './Image';
import type { MessagesRecipient } from './MessagesRecipient';

export type MessagesRecipientsResponse = {
    messagesRecipients: Array<MessagesRecipient>;
    /**
     * MessagesRecipient
     */
    description?: string;
    /**
     * MessagesRecipient
     */
    summary?: string;
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
     * Embeddable list of study summaries with explanation at the top
     */
    html?: string;
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