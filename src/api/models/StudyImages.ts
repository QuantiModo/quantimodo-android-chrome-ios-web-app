/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type StudyImages = {
    /**
     * Ex: https://static.quantimo.do/img/variable_categories/sleeping_in_bed-96.png
     */
    causeVariableImageUrl?: string;
    /**
     * Ex: ion-ios-cloudy-night-outline
     */
    causeVariableIonIcon?: string;
    /**
     * Ex: https://static.quantimo.do/img/variable_categories/theatre_mask-96.png
     */
    effectVariableImageUrl?: string;
    /**
     * Ex: ion-happy-outline
     */
    effectVariableIonIcon?: string;
    /**
     * Ex: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship.png
     */
    gaugeImage: string;
    /**
     * Ex: https://s3.amazonaws.com/quantimodo-docs/images/gauge-moderately-positive-relationship-200-200.png
     */
    gaugeImageSquare: string;
    /**
     * Image with gauge and category images
     */
    gaugeSharingImageUrl?: string;
    /**
     * Ex: https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-moderately-positive-relationship_sleep_emotions_logo_background.png
     */
    imageUrl: string;
    /**
     * Image with robot and category images
     */
    robotSharingImageUrl?: string;
    /**
     * Avatar of the principal investigator
     */
    avatar?: string;
}