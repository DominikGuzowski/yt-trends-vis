import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { CountryCodeOf, CategoryColor, Categories, ColorScheme } from "./YTCategory";

const JsonUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

const useEffectOnce = (fn) => {
    const hasRun = useRef(false);
    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            fn();
        }
    }, []);
};

const useGeoData = (url) => {
    const [data, setData] = useState(null);
    useEffectOnce(() => {
        if (data == null)
            d3.json(url).then((topoData) => {
                const { countries } = topoData.objects;
                setData(feature(topoData, countries));
            });
    });
    return data;
};

const projection = d3.geoEquirectangular();
const path = d3.geoPath(projection);
export const Map = ({ countryColors }) => {
    const geoData = useGeoData(JsonUrl);
    const GetCategoryFill = (countryName, hatch = false) => {
        const countryCode = CountryCodeOf[countryName];
        if (countryCode === undefined) return "#e0e0e0";

        const fillId = countryColors.find((c) => c[0] === countryCode)?.[2];
        if (fillId === undefined) return "#e0e0e0";

        return fillId > 8 && hatch ? "url(#diagonalHatch)" : ColorScheme[fillId] ?? "#e0e0e0";
    };

    const GetCategory = (countryName) => {
        const countryCode = CountryCodeOf[countryName];
        if (countryCode === undefined) return "";

        const fillId = countryColors.find((c) => c[0] === countryCode)?.[2];
        if (fillId === undefined) return "";
        if (Categories[fillId] === undefined) return "";
        return `: ${Categories[fillId]}`;
    };
    return (
        <div style={{ background: "white", width: "60rem", height: "30rem" }}>
            <svg width='100%' height='100%'>
                <g className='earth-map'>
                    {geoData?.features
                        // .filter((c) => CountryCodeOf[c.properties.name] !== undefined)
                        .map((d, i) => (
                            <path
                                fill={GetCategoryFill(d.properties.name)}
                                stroke='#000'
                                strokeWidth={0.5}
                                key={`path-${i}`}
                                d={path(d)}
                                className={`country${CountryCodeOf[d.properties.name] ? " tooltip" : ""}`}>
                                <title>
                                    {d.properties.name}
                                    {GetCategory(d.properties.name)}
                                </title>
                            </path>
                        ))}
                    {geoData?.features
                        // .filter((c) => CountryCodeOf[c.properties.name] !== undefined)
                        .map((d, i) => {
                            const fill = GetCategoryFill(d.properties.name, true);
                            if (fill === "#e0e0e0" || fill !== "url(#diagonalHatch)") return null;
                            return (
                                <path
                                    fill={fill}
                                    stroke='#000'
                                    strokeWidth={0.5}
                                    key={`path2-${i}`}
                                    d={path(d)}
                                    className={`country${CountryCodeOf[d.properties.name] ? " tooltip" : ""}`}>
                                    <title>
                                        {d.properties.name}
                                        {GetCategory(d.properties.name)}
                                    </title>
                                </path>
                            );
                        })}
                </g>
            </svg>
        </div>
    );
};

export const MostCommonMap = ({ data }) => {
    const GetColors = () => {
        console.log(data);
        const countryColors = Object.entries(data).map(([k, v]) => [k, CategoryColor[v], Categories.indexOf(v)]);
        return countryColors;
    };
    return <Map countryColors={GetColors()} />;
};
