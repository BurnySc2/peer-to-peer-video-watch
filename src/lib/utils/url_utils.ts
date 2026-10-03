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

export function extract_jellyfin_item_id(url: URL): string {
    return url.pathname.split("/")[2]
}

export function get_api_key(params: Record<string, string>): string | undefined {
    for (const [k, v] of Object.entries(params)) {
        const lower = k.toLowerCase()
        if (lower === "api_key" || lower === "apikey") {
            return v
        }
    }
    return undefined
}

export function build_auth_headers(api_key: string | undefined): HeadersInit {
    if (!api_key) {
        return {}
    }
    return { Authorization: `MediaBrowser Token="${api_key}"` }
}
