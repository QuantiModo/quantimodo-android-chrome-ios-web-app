import * as env from "./env-helper"
import * as qmLog from "./qm.log"
function outputApiErrorResponse(err: { response: any; }, options: { uri: string; }) {
    if(!err || !err.response) {
        qmLog.error("No err.response provided to outputApiErrorResponse!  err: ", err)
        qmLog.error("Request options: ", options)
        return
    }
    qmLog.error(options.uri + " error response", err.response.body)
    if(err.response.statusCode === 401) {
        throw new Error("Credentials invalid.  Please correct them in " + env.paths.src.devCredentials + " and try again.")
    }
}
export function makeApiRequest(options: { uri: any; strictSSL?: any; qs?: any; }, successHandler: (arg0: any) => void) {
    const rp = require("request-promise")
    qmLog.info("Making request to " + options.uri + " with clientId: " + env.getQMClientIdOrException())
    qmLog.debug(options.uri, options, 280)
    // options.uri = options.uri.replace('app', 'staging');
    if(options.uri.indexOf("staging") !== -1) {options.strictSSL = false}
    return rp(options).then(function(response: { success: any; }) {
        if(response.success) {
            qmLog.info("Successful response from " + options.uri + " for client id " + options.qs.clientId)
            qmLog.debug(options.uri + " response", response)
            if(successHandler) {successHandler(response)}
        } else {
            outputApiErrorResponse({response}, options)
            throw new Error("Success is false in response: "+ JSON.stringify(response))
        }
    }).catch(function(err: { response: any; }) {
        outputApiErrorResponse(err, options)
        throw err
    })
}
