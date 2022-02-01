"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripLiteralBrackets = exports.replaceQuoteBracketsWithBackTicks = exports.slugify = exports.stripLineBreaks = exports.stripQuotes = exports.replaceQuotesWithBackTicks = void 0;
function replaceQuotesWithBackTicks(str) {
    var hasVariables = str.indexOf("${") !== -1;
    if (!hasVariables) {
        return str;
    }
    return str.replace(/"/g, "`").replace(/'/g, "`");
}
exports.replaceQuotesWithBackTicks = replaceQuotesWithBackTicks;
function stripQuotes(str) {
    return str.replace(/"/g, "")
        .replace(/'/g, "")
        .replace(/`/g, "");
}
exports.stripQuotes = stripQuotes;
function stripLineBreaks(str) {
    return str.replace(/(\r\n|\n|\r)/gm, "");
}
exports.stripLineBreaks = stripLineBreaks;
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
}
exports.slugify = slugify;
function replaceQuoteBracketsWithBackTicks(cmd) {
    cmd = cmd.replace("'${", "`${");
    cmd = cmd.replace("}'", "}`");
    cmd = cmd.replace('"${', "`${");
    cmd = cmd.replace('}"', "}`");
    return cmd;
}
exports.replaceQuoteBracketsWithBackTicks = replaceQuoteBracketsWithBackTicks;
function stripLiteralBrackets(cmd) {
    cmd = cmd.replace("${", "");
    cmd = cmd.replace("}", "");
    return cmd;
}
exports.stripLiteralBrackets = stripLiteralBrackets;
//# sourceMappingURL=qm.string-helper.js.map