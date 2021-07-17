/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';
import type { Correlation } from './Correlation';
import type { ParticipantInstruction } from './ParticipantInstruction';
import type { StudyCharts } from './StudyCharts';
import type { StudyHtml } from './StudyHtml';
import type { StudyImages } from './StudyImages';
import type { StudyLinks } from './StudyLinks';
import type { StudySharing } from './StudySharing';
import type { StudyText } from './StudyText';
import type { StudyVotes } from './StudyVotes';
import type { Variable } from './Variable';

/**
 * A study analyzes the relationship between a predictor variable like gluten-intake and an outcome of interest such as overall mood.
 */
export type Study = {
    /**
     * Ex: population, cohort, or individual
     */
    type: string;
    /**
     * The user id of the principal investigator or subject if an individual studies
     */
    userId?: number;
    /**
     * ID of the cohort study which is necessary to allow participants to join
     */
    id?: string;
    causeVariable?: Variable;
    /**
     * Ex: Sleep Quality
     */
    causeVariableName?: string;
    studyCharts?: StudyCharts;
    effectVariable?: Variable;
    /**
     * Ex: Overall Mood
     */
    effectVariableName?: string;
    participantInstructions?: ParticipantInstruction;
    statistics?: Correlation;
    studyCard?: Card;
    studyHtml?: StudyHtml;
    studyImages?: StudyImages;
    studyLinks?: StudyLinks;
    studySharing?: StudySharing;
    studyText?: StudyText;
    studyVotes?: StudyVotes;
    /**
     * True if you are sharing your data with this study
     */
    joined?: boolean;
}