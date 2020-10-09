import dotenv from "dotenv"
export function getArgumentOrEnv(name: string, defaultValue: null | string): string | null {
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
