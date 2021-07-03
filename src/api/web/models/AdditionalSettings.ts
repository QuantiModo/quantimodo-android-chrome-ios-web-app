/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * A component of appSettings that can be modified at https://builder.quantimo.do/
 */
export type AdditionalSettings = {
    appIds: {
googleReversedClientId: string,
appleId: string,
appIdentifier: string,
facebookAppId: number,
ionicAppId: string,
};
    appImages: {
appIcon: string,
notificationIcon: string,
splashScreen: string,
textLogo: string,
favicon: string,
instructions: {
appIcon: string,
splashScreen: string,
textLogo: string,
},
};
    buildSettings?: any;
    companyEmail: string;
    downloadLinks: {
androidApp: string,
iosApp: string,
chromeExtension: string,
webApp: string,
physicianDashboard: string,
integrationGuide: string,
appDesigner: string,
descriptions: {
androidApp?: any,
iosApp?: any,
chromeExtension?: any,
webApp: string,
physicianDashboard: string,
integrationGuide: string,
appDesigner: string,
},
icons: {
androidApp?: any,
iosApp?: any,
chromeExtension?: any,
webApp?: any,
physicianDashboard: string,
integrationGuide: string,
appDesigner: string,
},
images: {
androidApp?: any,
iosApp?: any,
chromeExtension?: any,
webApp: string,
physicianDashboard: string,
integrationGuide: string,
appDesigner: string,
},
inboxUrl: string,
settingsUrl: string,
};
    googleAnalyticsTrackingIds: {
adminPanel: string,
endUserApps: string,
backEndAPI: string,
informationalHomePage: string,
};
    socialLinks: {
facebook: string,
twitter: string,
google: string,
linkedIn: string,
};
    upgradeDisabled: boolean;
    monetizationSettings: {
subscriptionsEnabled: {
displayName: string,
key: string,
value: boolean,
type: string,
helpText: string,
show: boolean,
link?: any,
image?: any,
},
advertisingEnabled: {
displayName: string,
key: string,
value: boolean,
type: string,
helpText: string,
show: boolean,
link?: any,
image?: any,
},
playPublicLicenseKey: {
displayName: string,
key: string,
value: string,
type: string,
helpText: string,
show: boolean,
link: string,
image: string,
},
monetizationSettingsInstructionLinks?: any,
iosMonthlySubscriptionCode: {
displayName: string,
key: string,
value: string,
type: string,
helpText: string,
show: boolean,
link: string,
image: string,
},
iosYearlySubscriptionCode: {
displayName: string,
key: string,
value: string,
type: string,
helpText: string,
show: boolean,
link: string,
image: string,
},
hideBuyNowButtons: {
disabled?: any,
displayName: string,
entityName?: any,
helpText: string,
hint?: any,
icon?: any,
image?: any,
key: string,
labelRight?: any,
labelLeft?: any,
link?: any,
placeholder?: any,
required?: any,
show: boolean,
submitButton?: any,
type: string,
validationPattern?: any,
value?: any,
id?: any,
},
};
}