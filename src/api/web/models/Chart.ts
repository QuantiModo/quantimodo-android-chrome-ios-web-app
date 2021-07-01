/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Chart = {
    /**
     *  Highcharts config that can be used if you have highcharts.js included on the page
     */
    highchartConfig?: any;
    /**
     * Ex: correlationScatterPlot
     */
    chartId?: string;
    /**
     * Ex: Overall Mood following Sleep Duration (R = -0.173)
     */
    chartTitle?: string;
    /**
     * Ex: The chart above indicates that an increase in Sleep Duration is usually followed by an decrease in Overall Mood.
     */
    explanation?: string;
    /**
     * Url to a static svg of the chart
     */
    svgUrl?: string;
    /**
     * SVG string than can be embedded directly in HTML
     */
    svg?: string;
}