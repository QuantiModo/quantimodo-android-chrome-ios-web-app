/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MeasurementItem = {
    /**
     * Optional note to include with the measurement
     */
    note?: string;
    /**
     * Timestamp for the measurement event in epoch time (unixtime)
     */
    timestamp: number;
    /**
     * Measurement value
     */
    value: number;
}