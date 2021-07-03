/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MeasurementUpdate = {
    /**
     * Variable id of the measurement to be updated
     */
    id: number;
    /**
     * The new note for the measurement (optional)
     */
    note?: string;
    /**
     * The new timestamp for the the event in epoch seconds (optional)
     */
    startTime?: number;
    /**
     * The new value of for the measurement (optional)
     */
    value?: number;
}