import dotenv from "dotenv"
const envs = {
    APP_HOST_NAME: "APP_HOST_NAME",
    QUANTIMODO_ACCESS_TOKEN: "QUANTIMODO_ACCESS_TOKEN",
    QUANTIMODO_CLIENT_ID: "QUANTIMODO_CLIENT_ID",
}
export function getArgumentOrEnv(name: string, defaultValue?: null | string): string | null {
    if (typeof process.env[name] !== "undefined") {
        // @ts-ignore
        return process.env[name]
    }
    if (typeof defaultValue === "undefined") {
        throw new Error(`Please specify ` + name + ` env or argument`)
    }
    return defaultValue
}
export function loadDotEnvFileInRootOfProject() {
    console.info("Loading .env file from root of project. Existing env variables are not overwritten.")
    dotenv.config() // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
}
export function loadEnv(environment: string) {
    const path = "secrets/.env."+environment
    console.info("Loading env from "+path)
    dotenv.config() // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
    try {
        dotenv.config({path})
    } catch (e) {
        console.info(e.message)
    }
}

export function getClientId() {
    return getArgumentOrEnv(envs.QUANTIMODO_CLIENT_ID)
}
export function getAppHostName() {
    return getArgumentOrEnv(envs.APP_HOST_NAME)
}

export function getAccessToken() {
    return getArgumentOrEnv(envs.QUANTIMODO_ACCESS_TOKEN)
}

export let paths = {
    apk: {// android\app\build\outputs\apk\release\app-release.apk
        arm7Release: "platforms/android/app/build/outputs/apk/release/app-arm7-release.apk",
        builtApk: null,
        combinedDebug: "platforms/android/app/build/outputs/apk/release/app-debug.apk",
        combinedRelease: "platforms/android/app/build/outputs/apk/release/app-release.apk",
        outputFolder: "platforms/android/app/build/outputs/apk",
        x86Release: "platforms/android/app/build/outputs/apk/release/app-x86-release.apk",
    },
    chcpLogin: ".chcplogin",
    sass: ["./src/scss/**/*.scss"],
    src:{
        defaultPrivateConfig: "src/default.private_config.json",
        devCredentials: "src/dev-credentials.json",
        firebase: "src/lib/firebase/**/*",
        icons: "src/img/icons",
        js: "src/js/*.js",
        serviceWorker: "src/firebase-messaging-sw.js",
        staticData: "src/data/qmStaticData.js",
    },
    www: {
        defaultPrivateConfig: "www/default.private_config.json",
        devCredentials: "www/dev-credentials.json",
        firebase: "www/lib/firebase/",
        icons: "www/img/icons",
        js: "www/js/",
        scripts: "www/scripts",
        staticData: "src/data/qmStaticData.js",
    },
}
