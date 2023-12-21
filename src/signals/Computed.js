import { computed, effect, signal } from "@preact/signals-react";
import { ytTrendsData } from "./CsvSignal";
const countries = ["CA", "DE", "FR", "GB", "IN", "JP", "KR", "MX", "RU", "US"];

export const FormatDateString = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const transform = (data) => {
    const categories = {};
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    let categoryHigh = 0;
    data.forEach(({ category, trending_date }, i) => {
        const date = FormatDateString(trending_date);
        if (!categories[category]) {
            categories[category] = {};
        }
        if (!categories[category][date]) {
            categories[category][date] = 0;
        }
        categories[category][date]++;
        min = Math.min(min, date);
        max = Math.max(max, date);
        categoryHigh = Math.max(categoryHigh, categories[category][date]);
    });

    let maxI = 0;
    const catArr = Object.keys(categories).map((cat) => {
        const sorted = Object.keys(categories[cat]).sort((a, b) => parseInt(a) - parseInt(b));
        maxI = Math.max(maxI, sorted.length - 1);
        return {
            data: sorted.map((date, i) => {
                return { x: i, y: categories[cat][date], xval: date, category: cat };
            }),
        };
    });

    const result = {
        data: catArr,
        axes: {
            x: [0, maxI],
            y: [0, parseInt(categoryHigh * 1.15)],
        },
    };

    return result;
};

const getAllCountrySet = (data) => {
    return Object.keys(data).flatMap((key) => {
        return data[key].data.flatMap((x) => x.data.map((y) => ({ ...y, country: key })));
    });
};

export const TrendingCategoriesByDate = computed(() => {
    const trending = {};
    for (const c of countries) {
        trending[c] = transform(ytTrendsData.value[c] ?? []);
    }
    trending.ALL = getAllCountrySet(trending);
    return trending;
});

export const MostCommonCategoryPerDate = computed(() => {
    //   ytTrendsData layout
    /*
     {
        [country]: [
            {
                video_id: string;
                trending_date: Date;
                title: string;
                channel_title: string;
                category_id: number;
                publish_time: Date;
                tags: string;
                views: number;
                likes: number;
                dislikes: number;
                comment_count: number;
                thumbnail_link: string;
                comments_disabled: boolean;
                ratings_disabled: boolean;
                video_error_or_removed: boolean;
                description: string;
            }
        ]
    }
        {
            [country]: {
                [date]: [
                    {
                        category: string;
                        count: number;
                    }
                ]
            }
        }
     */
    // Only contain the maximum counts per date
    const trending = {};
    for (const c of countries) {
        trending[c] = {};
        for (const { category, trending_date } of ytTrendsData.value[c] ?? []) {
            const date = FormatDateString(trending_date);
            if (!trending[c][date]) {
                trending[c][date] = {};
                trending[c][date].ALL = [];
                trending[c][date].MostCommon = [];
            }
            const cat = trending[c][date].ALL.find((x) => x.category === category);
            if (cat) {
                cat.count++;
            } else {
                trending[c][date].ALL.push({ category, count: 1 });
            }
            trending[c][date].ALL.sort((a, b) => b.count - a.count);
            trending[c][date].MostCommon = trending[c][date].ALL.filter(
                (x) => x.count === trending[c][date].ALL[0].count
            );
        }
    }
    return trending;
});

export const Milliseconds = {
    ToSeconds: 1000,
    ToMinutes: 1000 * 60,
    ToHours: 1000 * 60 * 60,
    ToDays: 1000 * 60 * 60 * 24,
    ToWeeks: 1000 * 60 * 60 * 24 * 7,
    ToMonths: 1000 * 60 * 60 * 24 * 30,
    ToYears: 1000 * 60 * 60 * 24 * 365,
};

export const DateRange = computed(() => {
    let minDate = new Date(2030, 0);
    let maxDate = new Date(2000, 0);

    for (const c of countries) {
        for (const { trending_date } of ytTrendsData.value[c] ?? []) {
            minDate = trending_date < minDate ? trending_date : minDate;
            maxDate = trending_date > maxDate ? trending_date : maxDate;
        }
    }

    return {
        min: { day: minDate.getUTCDate(), month: minDate.getMonth() + 1, year: minDate.getFullYear() },
        max: { day: maxDate.getUTCDate(), month: maxDate.getMonth() + 1, year: maxDate.getFullYear() },
        minValue: Math.ceil(minDate.getTime() / Milliseconds.ToDays),
        maxValue: Math.ceil(maxDate.getTime() / Milliseconds.ToDays),
        numberOfDays: function () {
            return this.maxValue - this.minValue;
        },
    };
});

export const NumberOfCommentsPerDay = computed(() => {
    const result = {};
    for (const c of countries) {
        result[c] = {};
        for (const { comment_count, trending_date } of ytTrendsData.value[c] ?? []) {
            const date = FormatDateString(trending_date);
            if (!result[c][date]) {
                result[c][date] = 0;
            }
            result[c][date] += comment_count;
        }
    }
    return result;
});

export const NumberOfDisabledComments = computed(() => {
    const result = {};
    for (const c of countries) {
        result[c] = {};
        for (const { comments_disabled, trending_date } of ytTrendsData.value[c] ?? []) {
            const date = FormatDateString(trending_date);
            if (!result[c][date]) {
                result[c][date] = {
                    disabled: 0,
                    total: 0,
                };
            }
            if (comments_disabled) {
                result[c][date].disabled++;
            }
            result[c][date].total++;
        }
    }
    return result;
});

export const TotalEngagement = computed(() => {
    const result = {};
    for (const c of countries) {
        result[c] = {};
        for (const { likes, dislikes, comment_count, trending_date, publish_time } of ytTrendsData.value[c] ?? []) {
            if (Math.ceil((trending_date.getTime() - publish_time.getTime()) / Milliseconds.ToDays) > 1) continue;
            const date = FormatDateString(trending_date);
            if (!result[c][date]) {
                result[c][date] = {
                    likes: 0,
                    dislikes: 0,
                    comments: 0,
                    total: 0,
                };
            }
            result[c][date].likes += likes;
            result[c][date].dislikes += dislikes;
            result[c][date].comments += comment_count;
            result[c][date].total += likes + dislikes + comment_count;
        }
    }

    const reshaped = {};
    for (const c of countries) {
        for (const date of Object.keys(result[c])) {
            if (!reshaped[date]) {
                reshaped[date] = {};
            }
            reshaped[date][c] = result[c][date];
        }
    }
    return reshaped;
});

export const DaysSincePublishPerVideoPerCountryPerDate = computed(() => {
    const result = {};
    for (const c of countries) {
        result[c] = {};
        for (const { trending_date, publish_time } of ytTrendsData.value[c] ?? []) {
            const date = FormatDateString(trending_date);
            if (!result[c][date]) {
                result[c][date] = [];
            }
            const diff = Math.ceil((trending_date.getTime() - publish_time.getTime()) / Milliseconds.ToDays);
            result[c][date].push(diff);
        }
    }
    return result;
});

export const DaysSincePublishOccurenceCount = computed(() => {
    const result = {};
    for (const c of countries) {
        result[c] = {};
        for (const { trending_date, publish_time } of ytTrendsData.value[c] ?? []) {
            const date = FormatDateString(trending_date);
            if (!result[c][date]) {
                result[c][date] = {};
            }
            const diff = Math.ceil((trending_date.getTime() - publish_time.getTime()) / Milliseconds.ToDays);
            if (!result[c][date][diff]) {
                result[c][date][diff] = 0;
            }
            result[c][date][diff]++;
        }
    }

    const reshape = {};
    for (const c of countries) {
        for (const date of Object.keys(result[c])) {
            if (!reshape[date]) {
                reshape[date] = {};
            }
            reshape[date][c] = result[c][date];
        }
    }
    return reshape;
});

export const TrendingOnDate = computed(() => {
    const reshapeByDate = {};

    for (const c of countries) {
        for (const data of ytTrendsData.value[c] ?? []) {
            const date = FormatDateString(data.trending_date);
            if (!reshapeByDate[date]) {
                reshapeByDate[date] = {};
            }

            if (!reshapeByDate[date][c]) {
                reshapeByDate[date][c] = [];
            }

            reshapeByDate[date][c].push(data);
        }
    }

    return reshapeByDate;
});

export const CommonTrendingVideos = computed(() => {
    const result = {};

    for (const date of Object.keys(TrendingOnDate.value)) {
        const sets = {
            CA: new Set(),
            DE: new Set(),
            FR: new Set(),
            GB: new Set(),
            IN: new Set(),
            JP: new Set(),
            KR: new Set(),
            MX: new Set(),
            RU: new Set(),
            US: new Set(),
            ALL: new Set(),
        };
        for (const c of Object.keys(TrendingOnDate.value[date])) {
            for (const video of TrendingOnDate.value[date][c]) {
                sets[c].add(video.video_id);
                sets.ALL.add(video.video_id);
            }
        }
        const videomap = {};

        for (const video of sets.ALL) {
            videomap[video] = [];
            for (const c of countries) {
                if (sets[c].has(video)) {
                    videomap[video].push(c);
                }
            }

            if (videomap[video].length > 1) {
                if (!result[date]) result[date] = [];
                result[date].push({ video, countries: videomap[video] });
            }
        }
    }

    console.log("common videos", result);
    return result;
});

export const AvailableDates = computed(() => Object.keys(TrendingOnDate.value ?? {}));

export const Videos = computed(() => {
    const videoMap = {};
    const videoData = ytTrendsData.value;
    const data = Object.values(videoData).flat();
    for (const video of data) {
        videoMap[video.video_id] = video;
    }
    console.log("VIDEO MAP", videoMap);
    return videoMap;
});
