/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ConnectInstructions = {
    /**
     * Create a form with these fields and post the key and user submitted value to the provided connect url
     */
    parameters?: Array<any>;
    /**
     * URL to open to connect
     */
    url: string;
    /**
     * True if should open auth window in popup
     */
    usePopup?: boolean;
}