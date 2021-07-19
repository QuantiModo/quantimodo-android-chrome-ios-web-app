/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Button } from './Button';

export type ExplanationStartTracking = {
    button: Button;
    /**
     * Ex: The more data I have the more accurate your results will be so track regularly!
     */
    description: string;
    /**
     * Ex: Improve Accuracy
     */
    title: string;
}