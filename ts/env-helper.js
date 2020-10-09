"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
function getArgumentOrEnv(name, defaultValue) {
    if (typeof process.env[name] !== "undefined") {
        // @ts-ignore
        return process.env[name];
    }
    if (typeof defaultValue === "undefined") {
        throw new Error("Please specify " + name + " env or argument");
    }
    return defaultValue;
}
exports.getArgumentOrEnv = getArgumentOrEnv;
function loadDotEnvFileInRootOfProject() {
    console.info("Loading .env file from root of project. Existing env variables are not overwritten.");
    dotenv_1.default.config(); // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
}
exports.loadDotEnvFileInRootOfProject = loadDotEnvFileInRootOfProject;
function loadEnv(environment) {
    var path = "secrets/.env." + environment;
    console.info("Loading env from " + path);
    dotenv_1.default.config(); // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
    try {
        dotenv_1.default.config({ path: path });
    }
    catch (e) {
        console.info(e.message);
    }
}
exports.loadEnv = loadEnv;
//# sourceMappingURL=env-helper.js.map