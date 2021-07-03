/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * A component of appSettings that can be modified at https://builder.quantimo.do/
 */
export type AppDesign = {
    aliases: {
active: {
physicianAlias: string,
patientAlias: string,
},
id?: any,
};
    floatingActionButton: {
active: {
button1: {
icon: string,
label: string,
stateName: string,
stateParameters: {
variableCategoryName: string,
},
},
button2: {
icon: string,
label: string,
stateName: string,
stateParameters: {
variableCategoryName: string,
},
},
button3: {
icon: string,
label: string,
stateName: string,
stateParameters: {
variableCategoryName: string,
},
},
button4: {
icon: string,
label: string,
stateName: string,
stateParameters: {
variableCategoryName: string,
},
},
},
};
    helpCard: {
active: Array<any>,
};
    intro: {
futuristicBackground: boolean,
active: Array<any>,
id?: any,
};
    menu: {
active: Array<any>,
id?: any,
};
    onboarding: {
active: Array<any>,
id?: any,
};
    upgradePleadingCard?: any;
    featuresList: {
active: Array<any>,
id?: any,
};
    defaultState: string;
    defaultTrackingReminderSettings: {
active: Array<any>,
id?: any,
};
    primaryOutcomeVariable?: any;
    ionNavBarClass: string;
    physicianAlias: string;
    patientAlias: string;
    welcomeState: string;
    backgroundColor: string;
    cordovaLocalNotificationsEnabled: boolean;
    wordAliases: Array<any>;
}