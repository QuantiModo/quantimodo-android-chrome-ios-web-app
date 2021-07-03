/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConversionStep } from './ConversionStep';
import type { UnitCategory } from './UnitCategory';

export type Unit = {
    /**
     * Unit abbreviation
     */
    abbreviatedName: string;
    /**
     * Ex: 1
     */
    advanced?: number;
    /**
     * Unit category
     */
    category: Unit.category;
    /**
     * Ex: 6
     */
    categoryId?: number;
    /**
     * Ex: Miscellany
     */
    categoryName?: string;
    /**
     * Conversion steps list
     */
    conversionSteps: Array<ConversionStep>;
    /**
     * Ex: 29
     */
    id?: number;
    /**
     * Ex: 0
     */
    manualTracking?: number;
    /**
     * The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
     */
    maximumAllowedValue?: number;
    /**
     * Ex: 4
     */
    maximumValue: number;
    /**
     * The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
     */
    minimumAllowedValue?: number;
    /**
     * Ex: 0
     */
    minimumValue?: number;
    /**
     * Unit name
     */
    name: string;
    unitCategory: UnitCategory;
}

export namespace Unit {

    /**
     * Unit category
     */
    export enum category {
        DISTANCE = 'Distance',
        DURATION = 'Duration',
        ENERGY = 'Energy',
        FREQUENCY = 'Frequency',
        MISCELLANY = 'Miscellany',
        PRESSURE = 'Pressure',
        PROPORTION = 'Proportion',
        RATING = 'Rating',
        TEMPERATURE = 'Temperature',
        VOLUME = 'Volume',
        WEIGHT = 'Weight',
        COUNT = 'Count',
    }


}