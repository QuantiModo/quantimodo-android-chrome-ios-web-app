/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ConversionStep = {
    /**
     * ADD or MULTIPLY
     */
    operation: ConversionStep.operation;
    /**
     * This specifies the order of conversion steps starting with 0
     */
    value: number;
}

export namespace ConversionStep {

    /**
     * ADD or MULTIPLY
     */
    export enum operation {
        ADD = 'ADD',
        MULTIPLY = 'MULTIPLY',
    }


}