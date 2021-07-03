/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Correlation } from '../models/Correlation';
import type { GetCorrelationsResponse } from '../models/GetCorrelationsResponse';
import { request as __request } from '../core/request';

export class AnalyticsService {

    /**
     * Get correlations
     * Get a list of correlations that can be used to display top predictors of a given outcome like mood, for instance.
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
     * @param commonOnly Return only public, anonymized and aggregated population data instead of user-specific variables
     * @returns GetCorrelationsResponse Successful operation
     * @throws ApiError
     */
    public static async getCorrelations(
limit: number = 100,
causeVariableName?: string,
causeVariableId?: number,
effectVariableId?: number,
predictorVariableName?: string,
outcomeVariableName?: string,
sort?: string,
effectVariableName?: string,
offset?: number,
userId?: number,
correlationCoefficient?: string,
updatedAt?: string,
outcomesOfInterest?: boolean,
clientId?: string,
commonOnly?: boolean,
): Promise<GetCorrelationsResponse> {
        const result = await __request({
            method: 'GET',
            path: `/v3/correlations`,
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
                'commonOnly': commonOnly,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Get correlation explanations
     * Get explanations of  correlations based on data from a single user.
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @returns Correlation Successful Operation
     * @throws ApiError
     */
    public static async getCorrelationExplanations(
causeVariableName?: string,
effectVariableName?: string,
causeVariableId?: number,
effectVariableId?: number,
predictorVariableName?: string,
outcomeVariableName?: string,
): Promise<Array<Correlation>> {
        const result = await __request({
            method: 'GET',
            path: `/v3/correlations/explanations`,
            query: {
                'causeVariableName': causeVariableName,
                'effectVariableName': effectVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'outcomeVariableName': outcomeVariableName,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

}