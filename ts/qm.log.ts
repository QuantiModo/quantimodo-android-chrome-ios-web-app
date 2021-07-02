import UniversalBugsnagStatic from "@bugsnag/js"
// @ts-ignore
import qm from "../src/js/qmHelpers.js"
import {envs, getClientId, getenv, getenvOrException} from "./env-helper"
import {getBuildLink, getCiProvider} from "./test-helpers"

// tslint:disable-next-line:max-line-length
function isTruthy(value: any) {
    return (value && value !== "false")
}

function getBugsnag() {
    return UniversalBugsnagStatic.createClient(getenvOrException(envs.BUGSNAG_API_KEY))
}

export function error(message: string, metaData?: any, maxCharacters?: number) {
    // tslint:disable-next-line:no-debugger
    debugger
    metaData = addMetaData(metaData)
    console.error(obfuscateStringify(message, metaData, maxCharacters))
    getBugsnag().notify(obfuscateStringify(message), metaData)
}

export function info(message: string, object?: any, maxCharacters?: any) {
    console.info(obfuscateStringify(message, object, maxCharacters))
}

export function debug(message: string, object?: any, maxCharacters?: any) {
    if (isTruthy(process.env.BUILD_DEBUG || process.env.DEBUG_BUILD)) {
        info("DEBUG: " + message, object, maxCharacters)
    }
}

export function addMetaData(metaData: { environment?: any; subsystem?: any; client_id?: any; build_link?: any; }) {
    metaData = metaData || {}
    metaData.environment = obfuscateSecrets(process.env)
    metaData.subsystem = {name: getCiProvider()}
    metaData.client_id = getClientId()
    metaData.build_link = getBuildLink()
    return metaData
}

export function obfuscateStringify(message: string, object?: object, maxCharacters?: number): string {
    maxCharacters = maxCharacters || 140
    let objectString = ""
    if (object) {
        object = obfuscateSecrets(object)
        objectString = ":  " + prettyJSONStringify(object)
    }
    if (maxCharacters && objectString.length > maxCharacters) {
        objectString = objectString.substring(0, maxCharacters) + "..."
    }
    message += objectString
    message = obfuscateString(message)
    return message
}

export function isSecretWord(propertyName: string) {
    const lowerCaseProperty = propertyName.toLowerCase()
    return lowerCaseProperty.indexOf("secret") !== -1 ||
        lowerCaseProperty.indexOf("password") !== -1 ||
        lowerCaseProperty.indexOf("key") !== -1 ||
        lowerCaseProperty.indexOf("database") !== -1 ||
        lowerCaseProperty.indexOf("token") !== -1
}

export function obfuscateString(str: string) {
    const env = process.env
    for (const propertyName in env) {
        if (env.hasOwnProperty(propertyName)) {
            const val = env[propertyName]
            if (isSecretWord(propertyName)) {
                // @ts-ignore
                str = qm.stringHelper.replaceAll(str, val, "["+propertyName+" hidden by obfuscateString]")
            }
        }
    }
    return str
}

export function obfuscateSecrets(object: any) {
    if (typeof object !== "object") {
        return object
    }
    object = JSON.parse(JSON.stringify(object)) // Decouple so we don't screw up original object
    for (const propertyName in object) {
        if (object.hasOwnProperty(propertyName)) {
            if (isSecretWord(propertyName)) {
                object[propertyName] = "["+propertyName+" hidden by obfuscateSecrets]"
            } else {
                object[propertyName] = obfuscateSecrets(object[propertyName])
            }
        }
    }
    return object
}

export function prettyJSONStringify(object: any) {
    return JSON.stringify(object, null, "\t")
}

export function logBugsnagLink(suite: string, start: string, end: string) {
    const query = `filters[event.since][0]=` + start +
        `&filters[error.status][0]=open&filters[event.before][0]=` + end +
        `&sort=last_seen`
    console.error(`https://app.bugsnag.com/quantimodo/` + suite + `/errors?` + query)
}

export function getCurrentServerContext() {
    if (process.env.CIRCLE_BRANCH) {
        return "circleci"
    }
    if (process.env.BUDDYBUILD_BRANCH) {
        return "buddybuild"
    }
    return process.env.HOSTNAME
}

export function throwError(message: string, metaData?: any, maxCharacters?: number) {
    error(message, metaData, maxCharacters)
    throw Error(message)
}
