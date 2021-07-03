/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * A component of appSettings that can be modified at https://builder.quantimo.do/
 */
export type AppStatus = {
    buildStatus: {
androidArmv7Debug: string,
androidArmv7Release: string,
androidRelease: string,
androidDebug: string,
androidX86Debug: string,
androidX86Release: string,
chromeExtension: string,
ios: string,
};
    betaDownloadLinks: {
androidArmv7Debug?: any,
androidArmv7Release?: any,
androidRelease: string,
androidDebug: string,
androidX86Debug?: any,
androidX86Release?: any,
chromeExtension: string,
ios?: any,
};
    buildEnabled: {
androidArmv7Debug: boolean,
androidArmv7Release: boolean,
androidRelease: boolean,
androidDebug: boolean,
androidX86Debug: boolean,
androidX86Release: boolean,
chromeExtension: boolean,
ios: boolean,
};
}