export function is_valid_url(url_string: string): boolean {
    try {
        new URL(url_string)
    } catch {
        console.log("Invalid url", url_string)
        return false
    }
    return true
}

export function get_search_params(url_string: string): [URL, Record<string, string>] {
    const base_url = new URL(url_string)
    const result: Record<string, string> = {}
    for (const [key, value] of base_url.searchParams) {
        result[key] = value
    }
    return [base_url, result]
}
