/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Button } from './Button';
import type { InputField } from './InputField';

export type Card = {
    actionSheetButtons?: Array<Button>;
    /**
     * Smaller square image
     */
    avatar?: string;
    /**
     * Smaller circular image
     */
    avatarCircular?: string;
    /**
     * Ex: #f2f2f2
     */
    backgroundColor?: string;
    buttons?: Array<Button>;
    buttonsSecondary?: Array<Button>;
    /**
     * Ex: Content
     */
    content?: string;
    /**
     * Ex: Title
     */
    headerTitle?: string;
    /**
     * HTML for the entire card.
     */
    html?: string;
    /**
     * Ex: <div>Content</div>
     */
    htmlContent?: string;
    /**
     * HTML element id
     */
    id: string;
    /**
     * Larger image of variable dimensions
     */
    image?: string;
    inputFields?: Array<InputField>;
    /**
     * Ex: ion-refresh
     */
    ionIcon?: string;
    /**
     * A link to a web page or something. Not much more to say about that.
     */
    link?: string;
    /**
     * Key value pairs derived from user input fields, button clicks, or preset defaults
     */
    parameters?: any;
    relatedCards?: Array<Card>;
    selectedButton?: Button;
    /**
     * Ex: sharingBody
     */
    sharingBody?: string;
    sharingButtons?: Array<Button>;
    /**
     * Ex: sharingTitle
     */
    sharingTitle?: string;
    /**
     * Ex: subTitle
     */
    subHeader?: string;
    /**
     * Ex: subTitle
     */
    subTitle?: string;
    /**
     * Ex: Title
     */
    title?: string;
}