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
import { Card } from './card';
import { Friend } from './friend';
import { Image } from './image';


export interface FriendsResponse { 
    friends: Array<Friend>;
    /**
     * Friend
     */
    description?: string;
    /**
     * Friend
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
    /**
     * A super neat card with buttons and HTML that you can use in your app!
     */
    card?: Card;
}
