"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApiRequest = void 0;
var env = require("./env-helper");
var qmLog = require("./qm.log");
function outputApiErrorResponse(err, options) {
    if (!err || !err.response) {
        qmLog.error("No err.response provided to outputApiErrorResponse!  err: ", err);
        qmLog.error("Request options: ", options);
        return;
    }
    qmLog.error(options.uri + " error response", err.response.body);
    if (err.response.statusCode === 401) {
        throw new Error("Credentials invalid.  Please correct them in " + env.paths.src.devCredentials + " and try again.");
    }
}
function makeApiRequest(options, successHandler) {
    var rp = require("request-promise");
    qmLog.info("Making request to " + options.uri + " with clientId: " + env.getClientId());
    qmLog.debug(options.uri, options, 280);
    // options.uri = options.uri.replace('app', 'staging');
    if (options.uri.indexOf("staging") !== -1) {
        options.strictSSL = false;
    }
    return rp(options).then(function (response) {
        if (response.success) {
            qmLog.info("Successful response from " + options.uri + " for client id " + options.qs.clientId);
            qmLog.debug(options.uri + " response", response);
            if (successHandler) {
                successHandler(response);
            }
        }
        else {
            outputApiErrorResponse({ response: response }, options);
            throw new Error("Success is false in response: " + JSON.stringify(response));
        }
    }).catch(function (err) {
        outputApiErrorResponse(err, options);
        throw err;
    });
}
exports.makeApiRequest = makeApiRequest;
