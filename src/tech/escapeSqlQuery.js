export function escape (string) {
    try {
        return string.replaceAll(`'`, `%27`)
    } catch {
        return string
    }
}

export function unescape (string) {
    try {
        return string.replaceAll(`%27`, `'`)
    } catch {
        return string
    }
}