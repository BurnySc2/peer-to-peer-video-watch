export type Subtitles = SubtitleItem[]

export type SubtitleItem = {
    id: string,
    start_s: number,
    end_s: number,
    text: string,
}