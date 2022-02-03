/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Intent = {
    id: string;
    name: string;
    auto: boolean;
    contexts: Array<any>;
    responses: Array<any>;
    priority: number;
    cortanaCommand: {
navigateOrService: string,
target: string,
};
    webhookUsed: boolean;
    webhookForSlotFilling: boolean;
    lastUpdate: number;
    fallbackIntent: boolean;
    events: Array<any>;
    usersays: Array<any>;
}