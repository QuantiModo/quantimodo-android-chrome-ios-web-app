/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExplanationStartTracking } from './ExplanationStartTracking';
import type { Image } from './Image';
import type { Study } from './Study';

export type GetStudiesResponse = {
    studies?: Array<Study>;
    /**
     * Ex: These factors are most predictive of Overall Mood based on your own data.
     */
    description: string;
    /**
     * Can be used as title in help info popup
     */
    summary: string;
    image?: Image;
    /**
     * Square icon png url
     */
    avatar?: string;
    /**
     * Ex: ion-ios-person
     */
    ionIcon?: string;
    startTracking?: ExplanationStartTracking;
    /**
     * Ex: Top Predictors of Overall Mood
     */
    title?: string;
    /**
     * Embeddable list of study summaries with explanation at the top
     */
    html?: string;
}