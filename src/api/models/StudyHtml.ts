/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type StudyHtml = {
    /**
     * Embeddable chart html
     */
    chartHtml: string;
    /**
     * Play Store, App Store, Chrome Web Store
     */
    downloadButtonsHtml?: string;
    /**
     * Embeddable study including HTML head section charts.  Modifiable css classes are study-title, study-section-header, study-section-body
     */
    fullPageWithHead?: string;
    /**
     * Embeddable study text html including charts.  Modifiable css classes are study-title, study-section-header, study-section-body
     */
    fullStudyHtml: string;
    /**
     * Embeddable study html including charts and css styling
     */
    fullStudyHtmlWithCssStyles?: string;
    /**
     * Instructions for study participation
     */
    participantInstructionsHtml?: string;
    /**
     * Embeddable table with statistics
     */
    statisticsTableHtml?: string;
    /**
     * Text summary
     */
    studyAbstractHtml?: string;
    /**
     * Title, study image, abstract with CSS styling
     */
    studyHeaderHtml?: string;
    /**
     * PNG image
     */
    studyImageHtml?: string;
    /**
     * Facebook, Twitter, Google+
     */
    studyMetaHtml?: string;
    /**
     * Formatted study text sections
     */
    studyTextHtml?: string;
    /**
     * What do you expect?
     */
    socialSharingButtonHtml?: string;
    /**
     * What do you expect?
     */
    studySummaryBoxHtml?: string;
}