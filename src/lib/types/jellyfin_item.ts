export interface JellyfinItem {
    Name: string;
    ServerId?: string;
    Id?: string;
    Etag?: string;
    DateCreated?: string;
    CanDownload?: boolean;
    HasSubtitles?: boolean;
    Container?: string;
    SortName?: string;
    PremiereDate?: string;
    MediaSources?: MediaSource[];
    Path?: string;
    Overview?: string;
    Genres?: string[];
    CommunityRating?: number;
    ProductionYear?: number;
    IndexNumber?: number;
    ParentIndexNumber?: number;
    ParentId?: string;
    Type?: string;
    SeriesName?: string;
    SeasonName?: string;
    MediaStreams?: MediaStream[];
    Width?: number;
    Height?: number;
}

interface MediaSource {

    Protocol?: string;
    Id?: string;
    Path?: string;
    Type?: string;
    Container?: string;
    Size?: number;
    Name?: string;
    IsRemote?: false;
    ETag?: string;
    RunTimeTicks?: number;
    ReadAtNativeFramerate?: false;
    IgnoreDts?: false;
    IgnoreIndex?: false;
    GenPtsInput?: false;
    SupportsTranscoding?: boolean;
    SupportsDirectStream?: boolean;
    SupportsDirectPlay?: boolean;
    IsInfiniteStream?: false;
    UseMostCompatibleTranscodingProfile?: false;
    RequiresOpening?: false;
    RequiresClosing?: false;
    RequiresLooping?: false;
    SupportsProbing?: boolean;
    VideoType?: string;
    MediaStreams?: MediaStream[];
    Bitrate?: number;
}

interface MediaStream {
    Codec?: string;
    Language?: string;
}