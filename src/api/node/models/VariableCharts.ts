/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Chart } from './Chart';

/**
 * An object with various chart properties each property contain and svg and Highcharts configuration
 */
export type VariableCharts = {
    hourlyColumnChart?: Chart;
    monthlyColumnChart?: Chart;
    distributionColumnChart?: Chart;
    weekdayColumnChart?: Chart;
    lineChartWithoutSmoothing?: Chart;
    lineChartWithSmoothing?: Chart;
}