export function replaceQuotesWithBackTicks(str: string) {
    const hasVariables = str.indexOf("${") !== -1
    if (!hasVariables) {
        return str
    }
    return str.replace(/"/g, "`").replace(/'/g, "`")
}
export function stripQuotes(str: string) {
    return str.replace(/"/g, "")
        .replace(/'/g, "")
        .replace(/`/g, "")
}
export function stripLineBreaks(str: string) {
    return str.replace(/(\r\n|\n|\r)/gm, "")
}
export function slugify(text: { toString: () => string; }) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, "-")           // Replace spaces with -
        .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
        .replace(/--+/g, "-")         // Replace multiple - with single -
        .replace(/^-+/, "")             // Trim - from start of text
        .replace(/-+$/, "")            // Trim - from end of text
}
export function replaceQuoteBracketsWithBackTicks(cmd: string) {
    cmd = cmd.replace("'${", "`${")
    cmd = cmd.replace("}'", "}`")
    cmd = cmd.replace('"${', "`${")
    cmd = cmd.replace('}"', "}`")
    return cmd
}
export function stripLiteralBrackets(cmd: string) {
    cmd = cmd.replace("${", "")
    cmd = cmd.replace("}", "")
    return cmd
}
