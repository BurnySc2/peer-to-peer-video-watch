export interface JellyfinItem {
    Name: string
    ServerId?: string
    Id?: string
    Etag?: string
    DateCreated?: string
    CanDownload?: boolean
    HasSubtitles?: boolean
    Container?: string
    SortName?: string
    PremiereDate?: string
    MediaSources?: MediaSource[]
    Path?: string
    Overview?: string
    Genres?: string[]
    CommunityRating?: number
    ProductionYear?: number
    IndexNumber?: number
    ParentIndexNumber?: number
    ParentId?: string
    Type?: string
    SeasonId?: string
    SeasonName?: string
    SeriesId?: string
    SeriesName?: string
    MediaStreams?: MediaStream[]
    Width?: number
    Height?: number
}

interface MediaSource {
    Protocol?: string
    Id?: string
    Path?: string
    Type?: string
    Container?: string
    Size?: number
    Name?: string
    IsRemote?: boolean
    ETag?: string
    RunTimeTicks?: number
    ReadAtNativeFramerate?: boolean
    IgnoreDts?: boolean
    IgnoreIndex?: boolean
    GenPtsInput?: boolean
    SupportsTranscoding?: boolean
    SupportsDirectStream?: boolean
    SupportsDirectPlay?: boolean
    IsInfiniteStream?: boolean
    UseMostCompatibleTranscodingProfile?: boolean
    RequiresOpening?: boolean
    RequiresClosing?: boolean
    RequiresLooping?: boolean
    SupportsProbing?: boolean
    VideoType?: string
    MediaStreams?: MediaStream[]
    Bitrate?: number
}

interface MediaStream {
    Codec?: string
    Language?: string
    Index?: number
    Type?: string
    IsTextSubtitleStream?: boolean
}
