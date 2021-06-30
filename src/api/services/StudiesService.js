import { request as __request } from '../core/request';
export class StudiesService {
    /**
     * Get Personal or Population Studies
     * If you have enough data, this will be a list of your personal studies, otherwise it will consist of aggregated population studies.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
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
     * @returns GetStudiesResponse Successful operation
     * @throws ApiError
     */
    static async getStudies(sort, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, userId, clientId, includeCharts, recalculate, studyId, effectVariableName, limit = 100, offset, correlationCoefficient, updatedAt, outcomesOfInterest, principalInvestigatorUserId, open, joined, created, population, downvoted) {
        const result = await __request({
            method: 'GET',
            path: `/v3/studies`,
            query: {
                'sort': sort,
                'causeVariableName': causeVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'outcomeVariableName': outcomeVariableName,
                'userId': userId,
                'clientId': clientId,
                'includeCharts': includeCharts,
                'recalculate': recalculate,
                'studyId': studyId,
                'effectVariableName': effectVariableName,
                'limit': limit,
                'offset': offset,
                'correlationCoefficient': correlationCoefficient,
                'updatedAt': updatedAt,
                'outcomesOfInterest': outcomesOfInterest,
                'principalInvestigatorUserId': principalInvestigatorUserId,
                'open': open,
                'joined': joined,
                'created': created,
                'population': population,
                'downvoted': downvoted,
            },
            errors: {
                401: `Successful operation`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }
    /**
     * These are open studies that anyone can join
     * These are studies that anyone can join and share their data for the predictor and outcome variables of interest.
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @returns GetStudiesResponse Successful operation
     * @throws ApiError
     */
    static async getOpenStudies(outcomeVariableName, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, effectVariableName, userId, clientId, includeCharts, recalculate, studyId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/studies/open`,
            query: {
                'outcomeVariableName': outcomeVariableName,
                'causeVariableName': causeVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'effectVariableName': effectVariableName,
                'userId': userId,
                'clientId': clientId,
                'includeCharts': includeCharts,
                'recalculate': recalculate,
                'studyId': studyId,
            },
            errors: {
                401: `Successful operation`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }
    /**
     * Studies You Have Joined
     * These are studies that you are currently sharing your data with.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param userId User's id
     * @param correlationCoefficient Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param outcomesOfInterest Only include correlations for which the effect is an outcome of interest for the user
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GetStudiesResponse Successful operation
     * @throws ApiError
     */
    static async getStudiesJoined(limit = 100, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, sort, effectVariableName, offset, userId, correlationCoefficient, updatedAt, outcomesOfInterest, clientId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/studies/joined`,
            query: {
                'limit': limit,
                'causeVariableName': causeVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'outcomeVariableName': outcomeVariableName,
                'sort': sort,
                'effectVariableName': effectVariableName,
                'offset': offset,
                'userId': userId,
                'correlationCoefficient': correlationCoefficient,
                'updatedAt': updatedAt,
                'outcomesOfInterest': outcomesOfInterest,
                'clientId': clientId,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
    /**
     * Get studies you have created
     * These are studies that you have created.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param userId User's id
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns GetStudiesResponse Successful operation
     * @throws ApiError
     */
    static async getStudiesCreated(sort, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, effectVariableName, limit = 100, offset, userId, updatedAt, clientId) {
        const result = await __request({
            method: 'GET',
            path: `/v3/studies/created`,
            query: {
                'sort': sort,
                'causeVariableName': causeVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'outcomeVariableName': outcomeVariableName,
                'effectVariableName': effectVariableName,
                'limit': limit,
                'offset': offset,
                'userId': userId,
                'updatedAt': updatedAt,
                'clientId': clientId,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
    /**
     * Publish Your Study
     * Make a study and all related measurements publicly visible by anyone
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @returns PostStudyPublishResponse Successful operation
     * @throws ApiError
     */
    static async publishStudy(outcomeVariableName, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, effectVariableName, userId, clientId, includeCharts, recalculate, studyId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/study/publish`,
            query: {
                'outcomeVariableName': outcomeVariableName,
                'causeVariableName': causeVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'effectVariableName': effectVariableName,
                'userId': userId,
                'clientId': clientId,
                'includeCharts': includeCharts,
                'recalculate': recalculate,
                'studyId': studyId,
            },
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }
    /**
     * Join a Study
     * Anonymously share measurements for specified variables
     * @param studyId Client id for the study you want
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns StudyJoinResponse Successful operation
     * @throws ApiError
     */
    static async joinStudy(studyId, causeVariableName, effectVariableName, causeVariableId, effectVariableId, predictorVariableName, outcomeVariableName, userId, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/study/join`,
            query: {
                'studyId': studyId,
                'causeVariableName': causeVariableName,
                'effectVariableName': effectVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'outcomeVariableName': outcomeVariableName,
                'userId': userId,
                'clientId': clientId,
            },
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }
    /**
     * Create a Study
     * Create an individual, group, or population study examining the relationship between a predictor and outcome variable. You will be given a study id which you can invite participants to join and share their measurements for the specified variables.
     * @param requestBody Details about the study you want to create
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @returns PostStudyCreateResponse Successful operation
     * @throws ApiError
     */
    static async createStudy(requestBody, clientId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/study/create`,
            query: {
                'clientId': clientId,
            },
            body: requestBody,
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }
    /**
     * Post or update vote
     * I am really good at finding correlations and even compensating for various onset delays and durations of action. However, you are much better than me at knowing if there's a way that a given factor could plausibly influence an outcome. You can help me learn and get better at my predictions by pressing the thumbs down button for relationships that you think are coincidences and thumbs up once that make logic sense.
     * @param requestBody Contains the cause variable, effect variable, and vote value.
     * @param userId User's id
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    static async postVote(requestBody, userId) {
        const result = await __request({
            method: 'POST',
            path: `/v3/votes`,
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
     * Delete vote
     * Delete previously posted vote
     * @param userId User's id
     * @returns void
     * @throws ApiError
     */
    static async deleteVote(userId) {
        const result = await __request({
            method: 'DELETE',
            path: `/v3/votes/delete`,
            query: {
                'userId': userId,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
    /**
     * Get Study
     * Get Study
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param userId User's id
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param includeCharts Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.
     * @param recalculate Recalculate instead of using cached analysis
     * @param studyId Client id for the study you want
     * @returns Study Successful operation
     * @throws ApiError
     */
    static async getStudy(outcomeVariableName, causeVariableName, causeVariableId, effectVariableId, predictorVariableName, effectVariableName, userId, clientId, includeCharts, recalculate, studyId) {
        const result = await __request({
            method: 'GET',
            path: `/v4/study`,
            query: {
                'outcomeVariableName': outcomeVariableName,
                'causeVariableName': causeVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'effectVariableName': effectVariableName,
                'userId': userId,
                'clientId': clientId,
                'includeCharts': includeCharts,
                'recalculate': recalculate,
                'studyId': studyId,
            },
            errors: {
                401: `Successful operation`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }
}
