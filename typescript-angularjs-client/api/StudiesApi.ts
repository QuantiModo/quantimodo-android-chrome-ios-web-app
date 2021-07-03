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

export class StudiesApi {
    protected basePath = 'https://app.quantimo.do/api';
    public defaultHeaders : any = {};

    static $inject: string[] = ['$http', '$httpParamSerializer', 'basePath'];

    constructor(protected $http: ng.IHttpService, protected $httpParamSerializer?: (d: any) => any, basePath?: string) {
        if (basePath !== undefined) {
            this.basePath = basePath;
        }
    }

    /**
     * Create an individual, group, or population study examining the relationship between a predictor and outcome variable. You will be given a study id which you can invite participants to join and share their measurements for the specified variables.
     * @summary Create a Study
     * @param body Details about the study you want to create
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    public createStudy (body: models.StudyCreationBody, clientId?: string, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.PostStudyCreateResponse> {
        const localVarPath = this.basePath + '/v3/study/create';

        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        // verify required parameter 'body' is not null or undefined
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling createStudy.');
        }

        if (clientId !== undefined) {
            queryParameters['clientId'] = clientId;
        }

        let httpRequestParams: ng.IRequestConfig = {
            method: 'POST',
            url: localVarPath,
            data: body,
            params: queryParameters,
            headers: headerParams
        };

        if (extraHttpRequestParams) {
            httpRequestParams = (<any>Object).assign(httpRequestParams, extraHttpRequestParams);
        }

        return this.$http(httpRequestParams);
    }
    /**
     * Delete previously posted vote
     * @summary Delete vote
     * @param body The cause and effect variable names for the predictor vote to be deleted.
     * @param userId User&#39;s id
     */
    public deleteVote (body: models.VoteDelete, userId?: number, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.CommonResponse> {
        const localVarPath = this.basePath + '/v3/votes/delete';

        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        // verify required parameter 'body' is not null or undefined
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling deleteVote.');
        }

        if (userId !== undefined) {
            queryParameters['userId'] = userId;
        }

        let httpRequestParams: ng.IRequestConfig = {
            method: 'DELETE',
            url: localVarPath,
            data: body,
            params: queryParameters,
            headers: headerParams
        };

        if (extraHttpRequestParams) {
            httpRequestParams = (<any>Object).assign(httpRequestParams, extraHttpRequestParams);
        }

        return this.$http(httpRequestParams);
    }
    /**
     * These are studies that anyone can join and share their data for the predictor and outcome variables of interest.
     * @summary These are open studies that anyone can join
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User&#39;s id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     */
    public getOpenStudies (causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, userId?: number, clientId?: string, includeCharts?: boolean, recalculate?: boolean, studyId?: string, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.GetStudiesResponse> {
        const localVarPath = this.basePath + '/v3/studies/open';

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

        if (userId !== undefined) {
            queryParameters['userId'] = userId;
        }

        if (clientId !== undefined) {
            queryParameters['clientId'] = clientId;
        }

        if (includeCharts !== undefined) {
            queryParameters['includeCharts'] = includeCharts;
        }

        if (recalculate !== undefined) {
            queryParameters['recalculate'] = recalculate;
        }

        if (studyId !== undefined) {
            queryParameters['studyId'] = studyId;
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
     * If you have enough data, this will be a list of your personal studies, otherwise it will consist of aggregated population studies.
     * @summary Get Personal or Population Studies
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User&#39;s id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @param sort Sort by one of the listed field names. If the field name is prefixed with &#x60;-&#x60;, it will sort in descending order.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param principalInvestigatorUserId These are studies created by a specific principal investigator
     * @param open These are studies that anyone can join
     * @param joined These are studies that you have joined
     * @param created These are studies that you have created
     * @param population These are studies based on the entire population of users that have shared their data
     * @param downvoted These are studies that you have down-voted
     */
    public getStudies (causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, userId?: number, clientId?: string, includeCharts?: boolean, recalculate?: boolean, studyId?: string, sort?: string, limit?: number, offset?: number, correlationCoefficient?: string, updatedAt?: string, outcomesOfInterest?: boolean, principalInvestigatorUserId?: number, open?: boolean, joined?: boolean, created?: boolean, population?: boolean, downvoted?: boolean, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.GetStudiesResponse> {
        const localVarPath = this.basePath + '/v3/studies';

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

        if (userId !== undefined) {
            queryParameters['userId'] = userId;
        }

        if (clientId !== undefined) {
            queryParameters['clientId'] = clientId;
        }

        if (includeCharts !== undefined) {
            queryParameters['includeCharts'] = includeCharts;
        }

        if (recalculate !== undefined) {
            queryParameters['recalculate'] = recalculate;
        }

        if (studyId !== undefined) {
            queryParameters['studyId'] = studyId;
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

        if (correlationCoefficient !== undefined) {
            queryParameters['correlationCoefficient'] = correlationCoefficient;
        }

        if (updatedAt !== undefined) {
            queryParameters['updatedAt'] = updatedAt;
        }

        if (outcomesOfInterest !== undefined) {
            queryParameters['outcomesOfInterest'] = outcomesOfInterest;
        }

        if (principalInvestigatorUserId !== undefined) {
            queryParameters['principalInvestigatorUserId'] = principalInvestigatorUserId;
        }

        if (open !== undefined) {
            queryParameters['open'] = open;
        }

        if (joined !== undefined) {
            queryParameters['joined'] = joined;
        }

        if (created !== undefined) {
            queryParameters['created'] = created;
        }

        if (population !== undefined) {
            queryParameters['population'] = population;
        }

        if (downvoted !== undefined) {
            queryParameters['downvoted'] = downvoted;
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
     * These are studies that you have created.
     * @summary Get studies you have created
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
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    public getStudiesCreated (causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, sort?: string, limit?: number, offset?: number, userId?: number, updatedAt?: string, clientId?: string, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.GetStudiesResponse> {
        const localVarPath = this.basePath + '/v3/studies/created';

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

        if (updatedAt !== undefined) {
            queryParameters['updatedAt'] = updatedAt;
        }

        if (clientId !== undefined) {
            queryParameters['clientId'] = clientId;
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
     * These are studies that you are currently sharing your data with.
     * @summary Studies You Have Joined
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
     */
    public getStudiesJoined (causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, sort?: string, limit?: number, offset?: number, userId?: number, correlationCoefficient?: string, updatedAt?: string, outcomesOfInterest?: boolean, clientId?: string, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.GetStudiesResponse> {
        const localVarPath = this.basePath + '/v3/studies/joined';

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
     * Get Study
     * @summary Get Study
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User&#39;s id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     */
    public getStudy (causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, userId?: number, clientId?: string, includeCharts?: boolean, recalculate?: boolean, studyId?: string, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.Study> {
        const localVarPath = this.basePath + '/v4/study';

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

        if (userId !== undefined) {
            queryParameters['userId'] = userId;
        }

        if (clientId !== undefined) {
            queryParameters['clientId'] = clientId;
        }

        if (includeCharts !== undefined) {
            queryParameters['includeCharts'] = includeCharts;
        }

        if (recalculate !== undefined) {
            queryParameters['recalculate'] = recalculate;
        }

        if (studyId !== undefined) {
            queryParameters['studyId'] = studyId;
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
     * Anonymously share measurements for specified variables
     * @summary Join a Study
     * @param studyId Client id for the study you want
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User&#39;s id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    public joinStudy (studyId?: string, causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, userId?: number, clientId?: string, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.StudyJoinResponse> {
        const localVarPath = this.basePath + '/v3/study/join';

        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        if (studyId !== undefined) {
            queryParameters['studyId'] = studyId;
        }

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

        if (userId !== undefined) {
            queryParameters['userId'] = userId;
        }

        if (clientId !== undefined) {
            queryParameters['clientId'] = clientId;
        }

        let httpRequestParams: ng.IRequestConfig = {
            method: 'POST',
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
     * I am really good at finding correlations and even compensating for various onset delays and durations of action. However, you are much better than me at knowing if there's a way that a given factor could plausibly influence an outcome. You can help me learn and get better at my predictions by pressing the thumbs down button for relationships that you think are coincidences and thumbs up once that make logic sense.
     * @summary Post or update vote
     * @param body Contains the cause variable, effect variable, and vote value.
     * @param userId User&#39;s id
     */
    public postVote (body: models.Vote, userId?: number, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.CommonResponse> {
        const localVarPath = this.basePath + '/v3/votes';

        let queryParameters: any = {};
        let headerParams: any = (<any>Object).assign({}, this.defaultHeaders);
        // verify required parameter 'body' is not null or undefined
        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling postVote.');
        }

        if (userId !== undefined) {
            queryParameters['userId'] = userId;
        }

        let httpRequestParams: ng.IRequestConfig = {
            method: 'POST',
            url: localVarPath,
            data: body,
            params: queryParameters,
            headers: headerParams
        };

        if (extraHttpRequestParams) {
            httpRequestParams = (<any>Object).assign(httpRequestParams, extraHttpRequestParams);
        }

        return this.$http(httpRequestParams);
    }
    /**
     * Make a study and all related measurements publicly visible by anyone
     * @summary Publish Your Study
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User&#39;s id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     */
    public publishStudy (causeVariableName?: string, effectVariableName?: string, causeVariableId?: number, effectVariableId?: number, predictorVariableName?: string, outcomeVariableName?: string, userId?: number, clientId?: string, includeCharts?: boolean, recalculate?: boolean, studyId?: string, extraHttpRequestParams?: any ) : ng.IHttpPromise<models.PostStudyPublishResponse> {
        const localVarPath = this.basePath + '/v3/study/publish';

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

        if (userId !== undefined) {
            queryParameters['userId'] = userId;
        }

        if (clientId !== undefined) {
            queryParameters['clientId'] = clientId;
        }

        if (includeCharts !== undefined) {
            queryParameters['includeCharts'] = includeCharts;
        }

        if (recalculate !== undefined) {
            queryParameters['recalculate'] = recalculate;
        }

        if (studyId !== undefined) {
            queryParameters['studyId'] = studyId;
        }

        let httpRequestParams: ng.IRequestConfig = {
            method: 'POST',
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
