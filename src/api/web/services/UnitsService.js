import { request as __request } from '../core/request';
export class UnitsService {
    /**
     * Get unit categories
     * Get a list of the categories of measurement units such as 'Distance', 'Duration', 'Energy', 'Frequency', 'Miscellany', 'Pressure', 'Proportion', 'Rating', 'Temperature', 'Volume', and 'Weight'.
     * @returns UnitCategory Successful operation
     * @throws ApiError
     */
    static async getUnitCategories() {
        const result = await __request({
            method: 'GET',
            path: `/v3/unitCategories`,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
    /**
     * Get units
     * Get a list of the available measurement units
     * @returns Unit Successful operation
     * @throws ApiError
     */
    static async getUnits() {
        const result = await __request({
            method: 'GET',
            path: `/v3/units`,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
}
