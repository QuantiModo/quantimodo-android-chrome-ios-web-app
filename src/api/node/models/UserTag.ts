/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UserTag = {
    /**
     * Number by which we multiply the tagged variable value to obtain the tag variable (ingredient) value
     */
    conversionFactor: number;
    /**
     * This is the id of the variable being tagged with an ingredient or something.
     */
    taggedVariableId: number;
    /**
     * This is the id of the ingredient variable whose value is determined based on the value of the tagged variable.
     */
    tagVariableId: number;
}