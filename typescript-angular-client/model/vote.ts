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


export interface Vote { 
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
     * Options: up, down, none
     */
    value: string;
    /**
     * Options: causality, usefulness
     */
    type?: string;
}
