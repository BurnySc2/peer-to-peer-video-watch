export function is_valid_url(url_string: string): boolean {
    try {
        new URL(url_string)
    } catch {
        console.log("Invalid url", url_string)
        return false
    }
    return true
}
