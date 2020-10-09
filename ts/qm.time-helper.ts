export function getUnixTimestampInSeconds(dateTimeString?: number) {
    if (!dateTimeString) {
        dateTimeString = new Date().getTime()
    }
    return Math.round(getUnixTimestampInMilliseconds(dateTimeString) / 1000)
}

export function getUnixTimestampInMilliseconds(dateTimeString?: string | number | Date) {
    if (!dateTimeString) {
        return new Date().getTime()
    }
    return new Date(dateTimeString).getTime()
}

export function getTimeSinceString(unixTimestamp: any) {
    if (!unixTimestamp) {
        return "never"
    }
    // @ts-ignore
    const secondsAgo = getSecondsAgo(unixTimestamp)
    if (secondsAgo > 2 * 24 * 60 * 60) {
        return Math.round(secondsAgo / (24 * 60 * 60)) + " days ago"
    }
    if (secondsAgo > 2 * 60 * 60) {
        return Math.round(secondsAgo / (60 * 60)) + " hours ago"
    }
    if (secondsAgo > 2 * 60) {
        return Math.round(secondsAgo / (60)) + " minutes ago"
    }
    return secondsAgo + " seconds ago"
}

export function getSecondsAgo(unixTimestamp: number) {
    return Math.round((getUnixTimestampInSeconds() - unixTimestamp))
}
