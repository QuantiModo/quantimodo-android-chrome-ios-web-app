/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExplanationStartTracking } from './ExplanationStartTracking';
import type { Image } from './Image';

export type Explanation = {
    /**
     * Ex: These factors are most predictive of Overall Mood based on your own data.
     */
    description: string;
    image: Image;
    /**
     * Ex: ion-ios-person
     */
    ionIcon: string;
    startTracking: ExplanationStartTracking;
    /**
     * Ex: Top Predictors of Overall Mood
     */
    title: string;
    /**
     * Embeddable list of study summaries with explanation at the top
     */
    html?: string;
}