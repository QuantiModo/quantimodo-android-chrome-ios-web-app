/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Pair = {
    /**
     * Ex: 101341.66666667
     */
    causeMeasurement: number;
    /**
     * Ex: 101341.66666667
     */
    causeMeasurementValue: number;
    /**
     * Ex: mg
     */
    causeVariableUnitAbbreviatedName: string;
    /**
     * Ex: 7.98
     */
    effectMeasurement: number;
    /**
     * Ex: 7.98
     */
    effectMeasurementValue: number;
    /**
     * Ex: %
     */
    effectVariableUnitAbbreviatedName: string;
    /**
     * Ex: 2015-08-06 15:49:02 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    eventAt?: string;
    /**
     * Ex: 1438876142
     */
    eventAtUnixTime?: number;
    /**
     * Ex: 2015-08-06 15:49:02 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    startTimeString?: string;
    /**
     * Ex: 1464937200
     */
    timestamp: number;
}