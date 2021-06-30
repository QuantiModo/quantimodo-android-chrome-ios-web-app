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

import * as models from '../model/models';

/* tslint:disable:no-unused-variable member-ordering */

export class AnalyticsApi {
    protected basePath = 'https://app.quantimo.do/api';
    public defaultHeaders : any = {};

    static $inject: string[] = ['$http', '$httpParamSerializer', 'basePath'];

    constructor(protected $http: ng.IHttpService, protected $httpParamSerializer?: (d: any) => any, basePath?: string) {
        if (basePath !== undefined) {
            this.basePath = basePath;
        }
    }

    /**
     * Get explanations of  correlations based on data from a single user.
     * @summary Get correlation explanations
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     */
    public getCorrelationExplanations (causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, extraHttpRequestParams?: any ) : ng.IHttpPromise<Array<models.Correlation>> {
        const localVarPath = this.basePath + '/v3/correlations/explanations';

        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        if (causeVariableName !== undefined) {
            queryParameters['causeVariableName'] = causeVariableName;
        }

        if (effectVariableName !== undefined) {
            queryParameters['effectVariableName'] = effectVariableName;
        }

        if (causeVariableId !== undefined) {
            queryParameters['causeVariableId'] = causeVariableId;
        }

        if (effectVariableId !== undefined) {
            queryParameters['effectVariableId'] = effectVariableId;
        }

        if (predictorVariableName !== undefined) {
            queryParameters['predictorVariableName'] = predictorVariableName;
        }

        if (outcomeVariableName !== undefined) {
            queryParameters['outcomeVariableName'] = outcomeVariableName;
        }

        let httpRequestParams: ng.IRequestConfig = {
            method: 'GET',
            url: localVarPath,
            params: queryParameters,
            headers: headerParams
        };

        if (extraHttpRequestParams) {
            httpRequestParams = (<any>Object).assign(httpRequestParams, extraHttpRequestParams);
        }

        return this.$http(httpRequestParams);
    }
    /**
     * Get a list of correlations that can be used to display top predictors of a given outcome like mood, for instance.
     * @summary Get correlations
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param userId User&#39;s id
     * @param correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param commonOnly Return only public, anonymized and aggregated population data instead of user-specific variables
     */
    public getCorrelations (causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, sort?: string, limit?: number, offset?: number, userId?: number, correlationCoefficient?: string, updatedAt?: string, outcomesOfInterest?: boolean, clientId?: string, commonOnly?: boolean, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.GetCorrelationsResponse> {
        const localVarPath = this.basePath + '/v3/correlations';

        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        if (causeVariableName !== undefined) {
            queryParameters['causeVariableName'] = causeVariableName;
        }

        if (effectVariableName !== undefined) {
            queryParameters['effectVariableName'] = effectVariableName;
        }

        if (causeVariableId !== undefined) {
            queryParameters['causeVariableId'] = causeVariableId;
        }

        if (effectVariableId !== undefined) {
            queryParameters['effectVariableId'] = effectVariableId;
        }

        if (predictorVariableName !== undefined) {
            queryParameters['predictorVariableName'] = predictorVariableName;
        }

        if (outcomeVariableName !== undefined) {
            queryParameters['outcomeVariableName'] = outcomeVariableName;
        }

        if (sort !== undefined) {
            queryParameters['sort'] = sort;
        }

        if (limit !== undefined) {
            queryParameters['limit'] = limit;
        }

        if (offset !== undefined) {
            queryParameters['offset'] = offset;
        }

        if (userId !== undefined) {
            queryParameters['userId'] = userId;
        }

        if (correlationCoefficient !== undefined) {
            queryParameters['correlationCoefficient'] = correlationCoefficient;
        }

        if (updatedAt !== undefined) {
            queryParameters['updatedAt'] = updatedAt;
        }

        if (outcomesOfInterest !== undefined) {
            queryParameters['outcomesOfInterest'] = outcomesOfInterest;
        }

        if (clientId !== undefined) {
            queryParameters['clientId'] = clientId;
        }

        if (commonOnly !== undefined) {
            queryParameters['commonOnly'] = commonOnly;
        }

        let httpRequestParams: ng.IRequestConfig = {
            method: 'GET',
            url: localVarPath,
            params: queryParameters,
            headers: headerParams
        };

        if (extraHttpRequestParams) {
            httpRequestParams = (<any>Object).assign(httpRequestParams, extraHttpRequestParams);
        }

        return this.$http(httpRequestParams);
    }
}
