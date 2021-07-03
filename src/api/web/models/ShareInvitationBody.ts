/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ShareInvitationBody = {
    /**
     * Enter the email address of the friend, family member, or health-care provider that you would like to give access to your measurements
     */
    emailAddress: string;
    /**
     * Name of the individual that the user wishes to have access to their measurements
     */
    name?: string;
    /**
     * Ex: I would like to share my measurements with you!
     */
    emailSubject?: string;
    /**
     * Ex: I would like to share my data with you so you can help me identify find discover hidden causes of and new treatments for my illness.
     */
    emailBody?: string;
    /**
     * Space separated list of scopes to grant to the recipient (i.e. readmeasurements, writemeasurements, measurements:read
     */
    scopes?: string;
}