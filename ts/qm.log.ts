import {getBuildLink, getCiProvider} from "./test-helpers"

const QUANTIMODO_CLIENT_ID = process.env.QUANTIMODO_CLIENT_ID || process.env.CLIENT_ID
// tslint:disable-next-line:max-line-length
const AWS_SECRET_ACCESS_KEY = process.env.QM_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY // Netlify has their own
function isTruthy(value: any) {return (value && value !== "false") }

export function error(message: string, metaData?: any, maxCharacters?: number) {
    metaData = addMetaData(metaData)
    console.error(obfuscateStringify(message, metaData, maxCharacters))
    // bugsnag.notify(new Error(obfuscateStringify(message)));
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
    metaData.client_id = QUANTIMODO_CLIENT_ID
    metaData.build_link = getBuildLink()
    return metaData
}
export function obfuscateStringify(message: string, object: undefined, maxCharacters?: number) {
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
    if (process.env.QUANTIMODO_CLIENT_SECRET) {
        message = message.replace(process.env.QUANTIMODO_CLIENT_SECRET, "HIDDEN")
    }
    if (AWS_SECRET_ACCESS_KEY) {
        message = message.replace(AWS_SECRET_ACCESS_KEY, "HIDDEN")
    }
    if (process.env.ENCRYPTION_SECRET) {
        message = message.replace(process.env.ENCRYPTION_SECRET, "HIDDEN")
    }
    if (process.env.QUANTIMODO_ACCESS_TOKEN) {
        message = message.replace(process.env.QUANTIMODO_ACCESS_TOKEN, "HIDDEN")
    }
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
            if (isSecretWord(propertyName)) {
                // @ts-ignore
                str = str.replace(env[propertyName], "[SECURE]")
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
                object[propertyName] = "[SECURE]"
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
