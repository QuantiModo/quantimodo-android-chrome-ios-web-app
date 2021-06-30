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


export interface Button { 
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
