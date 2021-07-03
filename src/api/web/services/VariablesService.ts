/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommonResponse } from '../models/CommonResponse';
import type { UserTag } from '../models/UserTag';
import type { UserVariableDelete } from '../models/UserVariableDelete';
import type { Variable } from '../models/Variable';
import type { VariableCategory } from '../models/VariableCategory';
import { request as __request } from '../core/request';

export class VariablesService {

    /**
     * Post or update user tags or ingredients
     * This endpoint allows users to tag foods with their ingredients.  This information will then be used to infer the user intake of the different ingredients by just entering the foods. The inferred intake levels will then be used to determine the effects of different nutrients on the user during analysis.
     * @param requestBody Contains the new user tag data
     * @param userId User's id
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    public static async postUserTags(
requestBody: UserTag,
userId?: number,
): Promise<CommonResponse> {
        const result = await __request({
            method: 'POST',
            path: `/v3/userTags`,
            query: {
                'userId': userId,
            },
            body: requestBody,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Delete user tag or ingredient
     * Delete previously created user tags or ingredients.
     * @param taggedVariableId Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
     * @param tagVariableId Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
     * @returns void 
     * @throws ApiError
     */
    public static async deleteUserTag(
taggedVariableId?: number,
tagVariableId?: number,
): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/v3/userTags/delete`,
            query: {
                'taggedVariableId': taggedVariableId,
                'tagVariableId': tagVariableId,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Get variables along with related user-specific analysis settings and statistics
     * Get variables. If the user has specified variable settings, these are provided instead of the common variable defaults.
     * @param publicEffectOrCause Ex: 
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param userId User's id
     * @param variableCategoryName Ex: Emotions, Treatments, Symptoms...
     * @param name Name of the variable. To get results matching a substring, add % as a wildcard as the first and/or last character of a query string parameter. In order to get variables that contain `Mood`, the following query should be used: ?variableName=%Mood%
     * @param variableName Name of the variable you want measurements for
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param sourceName ID of the source you want measurements for (supports exact name match only)
     * @param earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param id Common variable id
     * @param lastSourceName Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param includePublic Include variables the user has no measurements for
     * @param manualTracking Only include variables tracked manually by the user
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param upc UPC or other barcode scan result
     * @param effectOrCause Provided variable is the effect or cause
     * @param numberOfRawMeasurements Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.
     * @param exactMatch Require exact match
     * @param variableCategoryId Ex: 13
     * @param includePrivate Include user-specific variables in results
     * @param searchPhrase Ex: %Body Fat%
     * @param synonyms Ex: McDonalds hotcake
     * @param taggedVariableId Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
     * @param tagVariableId Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).
     * @param joinVariableId Id of the variable you would like to get variables that can be joined to.  This is used to merge duplicate variables.   If joinVariableId is specified, this returns only variables eligible to be joined to the variable specified by the joinVariableId.
     * @param parentUserTagVariableId Id of the parent category variable (i.e. Fruit) you would like to get eligible child sub-type variables (i.e. Apple) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple.  When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed.
     * @param childUserTagVariableId Id of the child sub-type variable (i.e. Apple) you would like to get eligible parent variables (i.e. Fruit) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple. When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed.
     * @param ingredientUserTagVariableId Id of the ingredient variable (i.e. Fructose)  you would like to get eligible ingredientOf variables (i.e. Apple) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple.
     * @param ingredientOfUserTagVariableId Id of the ingredientOf variable (i.e. Apple) you would like to get eligible ingredient variables (i.e. Fructose) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple.
     * @param commonOnly Return only public and aggregated common variable data instead of user-specific variables
     * @param userOnly Return only user-specific variables and data, excluding common aggregated variable data
     * @param includeTags Return parent, child, duplicate, and ingredient variables
     * @param recalculate Recalculate instead of using cached analysis
     * @param variableId Ex: 13
     * @param concise Only return field required for variable auto-complete searches.  The smaller size allows for storing more variable results locally reducing API requests.
     * @param refresh Regenerate charts instead of getting from the cache
     * @returns Variable Variables returned
     * @throws ApiError
     */
    public static async getVariables(
publicEffectOrCause?: string,
includeCharts?: boolean,
userId?: number,
variableCategoryName?: 'Activities' | 'Books' | 'Causes of Illness' | 'Cognitive Performance' | 'Conditions' | 'Emotions' | 'Environment' | 'Foods' | 'Location' | 'Miscellaneous' | 'Movies and TV' | 'Music' | 'Nutrients' | 'Payments' | 'Physical Activity' | 'Physique' | 'Sleep' | 'Social Interactions' | 'Software' | 'Symptoms' | 'Treatments' | 'Vital Signs' | 'Goals',
name?: string,
variableName?: string,
updatedAt?: string,
sourceName?: string,
earliestMeasurementTime?: string,
latestMeasurementTime?: string,
id?: number,
lastSourceName?: string,
limit: number = 100,
offset?: number,
sort?: string,
includePublic?: boolean,
manualTracking?: boolean,
clientId?: string,
upc?: string,
effectOrCause?: string,
numberOfRawMeasurements?: string,
exactMatch?: boolean,
variableCategoryId?: number,
includePrivate?: boolean,
searchPhrase?: string,
synonyms?: string,
taggedVariableId?: number,
tagVariableId?: number,
joinVariableId?: number,
parentUserTagVariableId?: number,
childUserTagVariableId?: number,
ingredientUserTagVariableId?: number,
ingredientOfUserTagVariableId?: number,
commonOnly?: boolean,
userOnly?: boolean,
includeTags?: boolean,
recalculate?: boolean,
variableId?: number,
concise?: boolean,
refresh?: boolean,
): Promise<Array<Variable>> {
        const result = await __request({
            method: 'GET',
            path: `/v3/variables`,
            query: {
                'publicEffectOrCause': publicEffectOrCause,
                'includeCharts': includeCharts,
                'userId': userId,
                'variableCategoryName': variableCategoryName,
                'name': name,
                'variableName': variableName,
                'updatedAt': updatedAt,
                'sourceName': sourceName,
                'earliestMeasurementTime': earliestMeasurementTime,
                'latestMeasurementTime': latestMeasurementTime,
                'id': id,
                'lastSourceName': lastSourceName,
                'limit': limit,
                'offset': offset,
                'sort': sort,
                'includePublic': includePublic,
                'manualTracking': manualTracking,
                'clientId': clientId,
                'upc': upc,
                'effectOrCause': effectOrCause,
                'numberOfRawMeasurements': numberOfRawMeasurements,
                'exactMatch': exactMatch,
                'variableCategoryId': variableCategoryId,
                'includePrivate': includePrivate,
                'searchPhrase': searchPhrase,
                'synonyms': synonyms,
                'taggedVariableId': taggedVariableId,
                'tagVariableId': tagVariableId,
                'joinVariableId': joinVariableId,
                'parentUserTagVariableId': parentUserTagVariableId,
                'childUserTagVariableId': childUserTagVariableId,
                'ingredientUserTagVariableId': ingredientUserTagVariableId,
                'ingredientOfUserTagVariableId': ingredientOfUserTagVariableId,
                'commonOnly': commonOnly,
                'userOnly': userOnly,
                'includeTags': includeTags,
                'recalculate': recalculate,
                'variableId': variableId,
                'concise': concise,
                'refresh': refresh,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Update User Settings for a Variable
     * Users can change the parameters used in analysis of that variable such as the expected duration of action for a variable to have an effect, the estimated delay before the onset of action. In order to filter out erroneous data, they are able to set the maximum and minimum reasonable daily values for a variable.
     * @param requestBody Variable user settings data
     * @param includePrivate Include user-specific variables in results
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includePublic Include variables the user has no measurements for
     * @param searchPhrase Ex: %Body Fat%
     * @param exactMatch Require exact match
     * @param manualTracking Only include variables tracked manually by the user
     * @param variableCategoryName Ex: Emotions, Treatments, Symptoms...
     * @param variableCategoryId Ex: 13
     * @param synonyms Ex: McDonalds hotcake
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    public static async postUserVariables(
requestBody: Array<Variable>,
includePrivate?: boolean,
clientId?: string,
includePublic?: boolean,
searchPhrase?: string,
exactMatch?: boolean,
manualTracking?: boolean,
variableCategoryName?: 'Activities' | 'Books' | 'Causes of Illness' | 'Cognitive Performance' | 'Conditions' | 'Emotions' | 'Environment' | 'Foods' | 'Location' | 'Miscellaneous' | 'Movies and TV' | 'Music' | 'Nutrients' | 'Payments' | 'Physical Activity' | 'Physique' | 'Sleep' | 'Social Interactions' | 'Software' | 'Symptoms' | 'Treatments' | 'Vital Signs' | 'Goals',
variableCategoryId?: number,
synonyms?: string,
): Promise<CommonResponse> {
        const result = await __request({
            method: 'POST',
            path: `/v3/variables`,
            query: {
                'includePrivate': includePrivate,
                'clientId': clientId,
                'includePublic': includePublic,
                'searchPhrase': searchPhrase,
                'exactMatch': exactMatch,
                'manualTracking': manualTracking,
                'variableCategoryName': variableCategoryName,
                'variableCategoryId': variableCategoryId,
                'synonyms': synonyms,
            },
            body: requestBody,
            errors: {
                400: `The received JSON was invalid or malformed`,
                401: `Not Authenticated`,
                404: `Unknown target user ID`,
            },
        });
        return result.body;
    }

    /**
     * Delete All Measurements For Variable
     * Users can delete all of their measurements for a variable
     * @returns void 
     * @throws ApiError
     */
    public static async deleteUserVariable(): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/v3/userVariables/delete`,
            errors: {
                400: `The received JSON was invalid or malformed`,
                401: `Not Authenticated`,
                404: `Unknown target user ID`,
            },
        });
        return result.body;
    }

    /**
     * Reset user settings for a variable to defaults
     * Reset user settings for a variable to defaults
     * @param requestBody Id of the variable whose measurements should be deleted
     * @returns any Successful operation
     * @throws ApiError
     */
    public static async resetUserVariableSettings(
requestBody: UserVariableDelete,
): Promise<any> {
        const result = await __request({
            method: 'POST',
            path: `/v3/userVariables/reset`,
            body: requestBody,
            errors: {
                400: `The received JSON was invalid or malformed`,
                401: `Not Authenticated`,
                404: `Unknown target user ID`,
            },
        });
        return result.body;
    }

    /**
     * Variable categories
     * The variable categories include Activity, Causes of Illness, Cognitive Performance, Conditions, Environment, Foods, Location, Miscellaneous, Mood, Nutrition, Physical Activity, Physique, Sleep, Social Interactions, Symptoms, Treatments, Vital Signs, and Goals.
     * @returns VariableCategory Successful operation
     * @throws ApiError
     */
    public static async getVariableCategories(): Promise<Array<VariableCategory>> {
        const result = await __request({
            method: 'GET',
            path: `/v3/variableCategories`,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

}