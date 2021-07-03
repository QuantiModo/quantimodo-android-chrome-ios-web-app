/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Chart } from './Chart';

/**
 * An object with various chart properties each property contain and svg and Highcharts configuration
 */
export type StudyCharts = {
    populationTraitScatterPlot?: Chart;
    outcomeDistributionColumnChart?: Chart;
    predictorDistributionColumnChart?: Chart;
    correlationScatterPlot?: Chart;
    pairsOverTimeLineChart?: Chart;
}