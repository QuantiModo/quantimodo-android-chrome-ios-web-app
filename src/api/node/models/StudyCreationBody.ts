/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type StudyCreationBody = {
    /**
     * Name of predictor variable
     */
    causeVariableName: string;
    /**
     * Name of the outcome variable
     */
    effectVariableName: string;
    /**
     * Title of your study (optional)
     */
    studyTitle?: string;
    /**
     * Individual studies are based on data of a single user. Group studies are based on data from a specific group of individuals who have joined.  Global studies are based on aggregated and anonymously shared data from all users.
     */
    type: StudyCreationBody.type;
}

export namespace StudyCreationBody {

    /**
     * Individual studies are based on data of a single user. Group studies are based on data from a specific group of individuals who have joined.  Global studies are based on aggregated and anonymously shared data from all users.
     */
    export enum type {
        INDIVIDUAL = 'individual',
        GROUP = 'group',
        GLOBAL = 'global',
    }


}