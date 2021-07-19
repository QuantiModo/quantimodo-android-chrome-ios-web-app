/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Vote = {
    /**
     * Cause variable id
     */
    causeVariableId: number;
    /**
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    clientId: string;
    /**
     * When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format
     */
    createdAt?: string;
    /**
     * Effect variable id
     */
    effectVariableId: number;
    /**
     * id
     */
    id?: number;
    /**
     * When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format
     */
    updatedAt?: string;
    /**
     * ID of User
     */
    userId: number;
    /**
     * Vote down for implausible/not-useful or up for plausible/useful. Vote none to delete a previous vote.
     */
    value: Vote.value;
    /**
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    type?: Vote.type;
}

export namespace Vote {

    /**
     * Vote down for implausible/not-useful or up for plausible/useful. Vote none to delete a previous vote.
     */
    export enum value {
        UP = 'up',
        DOWN = 'down',
        NONE = 'none',
    }

    /**
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    export enum type {
        CAUSALITY = 'causality',
        USEFULNESS = 'usefulness',
    }


}