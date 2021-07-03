/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Button = {
    /**
     * Ex: connect
     */
    accessibilityText?: string;
    /**
     * Action data
     */
    action?: any;
    /**
     * Ex: connect
     */
    additionalInformation?: string;
    /**
     * Ex: #f2f2f2
     */
    color?: string;
    /**
     * Text to show user before executing functionName
     */
    confirmationText?: string;
    /**
     * Name of function to call
     */
    functionName?: string;
    /**
     * Data to provide to functionName or be copied to the card parameters when button is clicked and card is posted to the API
     */
    parameters?: any;
    /**
     * Ex: connect
     */
    html?: string;
    /**
     * HTML element id
     */
    id?: string;
    /**
     * Ex: https://image.jpg
     */
    image?: string;
    /**
     * Ex: ion-refresh
     */
    ionIcon?: string;
    /**
     * Ex: https://local.quantimo.do
     */
    link: string;
    /**
     * State to go to
     */
    stateName?: string;
    /**
     * Data to provide to the state
     */
    stateParams?: any;
    /**
     * Text to show user after executing functionName
     */
    successToastText?: string;
    /**
     * Text to show user after executing functionName
     */
    successAlertTitle?: string;
    /**
     * Text to show user after executing functionName
     */
    successAlertBody?: string;
    /**
     * Ex: Connect
     */
    text: string;
    /**
     * Ex: This is a tooltip
     */
    tooltip?: string;
    /**
     * Post here on button click
     */
    webhookUrl?: string;
}