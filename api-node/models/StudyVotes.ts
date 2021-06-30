/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type StudyVotes = {
    /**
     * Average of all user votes with 1 representing an up-vote and 0 representing a down-vote. Ex: 0.9855
     */
    averageVote: number;
    /**
     * 1 if the current user has up-voted the study and 0 if they down-voted it. Null means no vote. Ex: 1 or 0 or null
     */
    userVote: number;
}