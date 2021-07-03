/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AppSettings } from './AppSettings';
import type { DataSource } from './DataSource';
import type { Phrase } from './Phrase';
import type { State } from './State';
import type { Unit } from './Unit';
import type { Variable } from './Variable';
import type { VariableCategory } from './VariableCategory';

export type StaticData = {
    appSettings: AppSettings;
    buildInfo?: any;
    chcp?: any;
    chromeExtensionManifest?: any;
    commonVariables: Array<Variable>;
    configXml?: any;
    connectors: Array<DataSource>;
    deepThoughts: Array<Phrase>;
    dialogAgent: {
entities: any,
intents: any,
};
    docs: any;
    privateConfig: any;
    states: Array<State>;
    units: Array<Unit>;
    variableCategories: Array<VariableCategory>;
    stateNames: any;
    success: boolean;
    status: string;
    code: number;
    description?: any;
    summary?: any;
    errors: Array<any>;
    sessionTokenObject?: any;
    avatar?: any;
    warnings?: any;
    data?: any;
}