import type { SubtitleItem } from "$lib/types/subtitle_item"

export async function parse_srt(url: string): Promise<SubtitleItem[]> {
    const res = await fetch(url)
    const raw_text = await res.text()
    const normalised_text = raw_text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/^\uFEFF/, "")

    const subtitles: SubtitleItem[] = []
    const blocks = normalised_text.trim().split(/\n{2,}/)
    blocks.forEach((item) => {
        const pieces = item.split("\n")

        if (pieces.length < 2) return

        const [start_time, end_time] = pieces[1].split("-->")

        if (!start_time || !end_time) return

        subtitles.push({
            id: pieces[0].trim(),
            start_s: srt_time_to_s(start_time.trim()),
            end_s: srt_time_to_s(end_time.trim()),
            text: pieces
                .slice(2)
                .join("\n")
                .trim()
                .replace(/\{\\an8\}/g, ""),
        })
    })

    console.log(subtitles)
    return subtitles
}

export function srt_time_to_s(timestamp: string): number {
    const match = timestamp.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/)

    if (!match) {
        throw new Error(`Invalid SRT timestamp: ${timestamp}`)
    }

    const [, hours, minutes, seconds, milliseconds] = match

    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) * 0.001
}
