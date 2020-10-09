import * as qmLog from "./qm.log"
export function executeSynchronously(cmd: string , catchExceptions: boolean) {
    const execSync = require("child_process").execSync
    console.info(cmd)
    try {
        const res = execSync(cmd)
        qmLog.info(res)
    } catch (error) {
        if (catchExceptions) {
            console.error(error)
        } else {
            throw error
        }
    }
}
