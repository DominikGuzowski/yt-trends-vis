import { signal } from "@preact/signals-react";
import Papa from "papaparse";

class Timer {
    constructor() {
        this.start = Date.now();
    }

    get elapsed() {
        return Date.now() - this.start;
    }

    reset() {
        this.start = Date.now();
    }
}

export const ytTrendsData = signal({});
export const ytDataLoaded = signal(false);
export const ytTrendsDataLoading = signal(false);
export const ytCurrentCountry = signal("");

export const openFile = async (path) => {
    const file = await fetch(path);
    return file;
};

const cleanup = (data) => {
    let [year, day, month] = data.trending_date.split(".");
    year = parseInt(`20${year}`);
    month = parseInt(month) - 1;
    day = parseInt(day);
    return {
        title: data.title,
        video_id: data.video_id,
        category_id: parseInt(data.category_id),
        views: parseInt(data.views),
        likes: parseInt(data.likes),
        dislikes: parseInt(data.dislikes),
        comment_count: parseInt(data.comment_count),
        trending_date: new Date(year, month, day),
        publish_time: new Date(data.publish_time),
        comments_disabled: "true" === data.comments_disabled.toLowerCase(),
        video_error_or_removed: "true" === data.video_error_or_removed.toLowerCase(),
        ratings_disabled: "true" === data.ratings_disabled.toLowerCase(),
    };
};

const countryIdCategories = {};
const assignCategories = async (country, data) => {
    const json = await openFile(`src/assets/archive/${country}_category_id.json`);
    const value = await json.json();
    const categories = value.items.map((i) => ({ title: i.snippet.title, id: i.id }));
    const withCategories = [];
    countryIdCategories[country] = {};
    for (const d of data) {
        let category = categories.find((c) => c.id === d.category_id);

        withCategories.push({ ...cleanup(d), category: category?.title ?? "Nonprofits & Activism" });
    }

    return withCategories;
};

const readCsv = async (file) => {
    return new Promise(async (resolve, reject) => {
        const fr = new FileReader();
        fr.onload = async ({ target }) => {
            let csv = null;
            Papa.parse(target.result, {
                header: true,
                complete: (results) => {
                    csv = results;
                },
            });

            const parsedData = csv?.data;
            if (!parsedData) {
                reject([]);
            }

            resolve(parsedData);
        };
        const f = await openFile(file);
        const blob = await f.blob();
        fr.readAsText(blob);
    });
};

export const loadYTData = async (country) => {
    ytCurrentCountry.value = "Loading " + country;

    let data = await readCsv(`src/assets/archive/${country}videos.csv`);
    data = assignCategories(country, data);
    ytCurrentCountry.value = "";
    return data;
};

export const loadData = async () => {
    ytTrendsDataLoading.value = true;

    const countries = ["CA", "DE", "FR", "GB", "IN", "JP", "KR", "MX", "RU", "US"];
    const alldata = {};
    for (const c of countries) {
        const data = await loadYTData(c);

        alldata[c] = data.map((d) => (String(d.category) === "undefined" ? { ...d, category: "Not Specified" } : d));
        alldata[c].sort((a, b) => a.trending_date - b.trending_date);
        alldata[c] = alldata[c].filter((v) => v.video_id !== "#NAME?");
    }
    ytTrendsData.value = alldata;
    ytTrendsDataLoading.value = false;
    ytDataLoaded.value = true;
    console.log("LOADED");
};
