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
import { AppSettings } from './appSettings';


export interface AuthorizedClients { 
    /**
     * Applications with access to user measurements for all variables
     */
    apps: Array<AppSettings>;
    /**
     * Individuals such as physicians or family members with access to user measurements for all variables
     */
    individuals: Array<AppSettings>;
    /**
     * Studies with access to generally anonymous user measurements for a specific predictor and outcome variable
     */
    studies: Array<AppSettings>;
}
