/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Friend = {
    /**
     * What do you expect?
     */
    id: number;
    /**
     * What do you expect?
     */
    initiatorUserId: number;
    /**
     * What do you expect?
     */
    friendUserId: number;
    /**
     * What do you expect?
     */
    isConfirmed: number;
    /**
     * What do you expect?
     */
    isLimited: number;
    /**
     * What do you expect?
     */
    dateCreated: string;
    /**
     * Additional friend key-value data
     */
    metaDataArray?: Array<any>;
}