"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var qmLog = __importStar(require("./qm.log"));
function executeSynchronously(cmd, catchExceptions) {
    var execSync = require("child_process").execSync;
    console.info(cmd);
    try {
        var res = execSync(cmd);
        qmLog.info(res);
    }
    catch (error) {
        if (catchExceptions) {
            console.error(error);
        }
        else {
            throw error;
        }
    }
}
exports.executeSynchronously = executeSynchronously;
//# sourceMappingURL=qm.shell.js.map