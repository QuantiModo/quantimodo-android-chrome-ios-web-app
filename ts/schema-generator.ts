import * as api from "../src/api/node"
import * as env from "./env-helper"
import * as qmLog from "./qm.log"
// tslint:disable-next-line:no-var-requires
const GenerateSchema = require("generate-schema/src/index.js")
api.AppSettingsService.getAppSettings(env.getQMClientIdOrException(), true)
    .then(function(AppSettingsResponse) {
        if (AppSettingsResponse.staticData) {
            const as = AppSettingsResponse.staticData.appSettings
            let output = GenerateSchema.mysql("AppSettings", as)
            console.log("mysql", output)
            output = GenerateSchema.json("AppSettings", as)
            console.log("json", output)
            output = GenerateSchema.generic("AppSettings", as)
            console.log("generic", output)
        }
    })
