/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Button } from './Button';

export type InputField = {
    /**
     * What do you expect?
     */
    displayName: string;
    /**
     * What do you expect?
     */
    helpText?: string;
    /**
     * What do you expect?
     */
    hint?: string;
    /**
     * What do you expect?
     */
    icon?: string;
    /**
     * HTML element id
     */
    id?: string;
    /**
     * What do you expect?
     */
    image?: string;
    /**
     * What do you expect?
     */
    key?: string;
    /**
     * What do you expect?
     */
    labelLeft?: string;
    /**
     * What do you expect?
     */
    labelRight?: string;
    /**
     * What do you expect?
     */
    link?: string;
    /**
     * What do you expect?
     */
    maxLength?: number;
    /**
     * What do you expect?
     */
    maxValue?: number;
    /**
     * What do you expect?
     */
    minLength?: number;
    /**
     * What do you expect?
     */
    minValue?: number;
    /**
     * Selector list options
     */
    options?: Array<string>;
    /**
     * Ex: Title
     */
    placeholder?: string;
    /**
     * What do you expect?
     */
    postUrl?: string;
    /**
     * What do you expect?
     */
    required?: boolean;
    /**
     * Ex: Title
     */
    show?: boolean;
    submitButton?: Button;
    /**
     * Ex: Title
     */
    type: InputField.type;
    /**
     * See http://html5pattern.com/ for examples
     */
    validationPattern?: string;
    /**
     * What do you expect?
     */
    value?: string;
}

export namespace InputField {

    /**
     * Ex: Title
     */
    export enum type {
        CHECK_BOX = 'check_box',
        DATE = 'date',
        EMAIL = 'email',
        NUMBER = 'number',
        POSTAL_CODE = 'postal_code',
        SELECT_OPTION = 'select_option',
        STRING = 'string',
        SWITCH = 'switch',
        TEXT_AREA = 'text_area',
        UNIT = 'unit',
        VARIABLE_CATEGORY = 'variable_category',
    }


}