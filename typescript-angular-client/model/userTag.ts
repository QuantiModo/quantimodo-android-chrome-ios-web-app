/**
 * quantimodo
 * We make it easy to retrieve and analyze normalized user data from a wide array of devices and applications. Check out our [docs and sdk's](https://github.com/QuantiModo/docs) or [contact us](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.112511
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface UserTag { 
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
