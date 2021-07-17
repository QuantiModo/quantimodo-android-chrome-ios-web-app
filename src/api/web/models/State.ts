/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * App State
 */
export type State = {
    url: string;
    cache: boolean;
    params: {
showAds: boolean,
trackingReminder?: any,
variableObject?: any,
measurementInfo?: any,
noReload: boolean,
fromState?: any,
fromUrl?: any,
refresh?: any,
title: string,
ionIcon: string,
hideLineChartWithoutSmoothing: boolean,
hideLineChartWithSmoothing: boolean,
hideMonthlyColumnChart: boolean,
hideWeekdayColumnChart: boolean,
hideDistributionColumnChart: boolean,
variableName?: any,
};
    views: {
menuContent: {
templateUrl: string,
controller: string,
},
};
    name: string;
}