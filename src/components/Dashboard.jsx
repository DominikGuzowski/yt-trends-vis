import { MostCommonMap } from "./EarthMap";
import { Legend } from "./Legend";
import { MostCommonCategoryPerDate, TrendingCategoriesByDate, AvailableDates } from "../signals/Computed";
import { ytDataLoaded } from "../signals/CsvSignal";
import { useEffect, useState } from "react";
import { RadialChart } from "./RadialChart";
import { Barchart } from "./Barchart";
import NetworkGraph from "./NetworkGraph";

const height = 23;
const width = height * Math.sqrt(2);
const DashboardStyle = {
    width: `${width}cm`,
    height: `${height}cm`,
    backgroundColor: "white",
    // borderRadius: "0.5rem",
    boxShadow: "0.125rem 0.125rem 0.125rem 0.125rem #3333",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    position: "relative",
    color: "black",
};

const GetDateString = (day) => {
    return AvailableDates.value[day];
};

const GetMostCommonOnDate = (day) => {
    const dateString = GetDateString(day);

    return Object.keys(MostCommonCategoryPerDate.value)
        .map((c) => {
            return {
                country: c,
                category: MostCommonCategoryPerDate.value[c][dateString]?.MostCommon?.[0]?.category,
            };
        })
        .reduce((prev, curr) => {
            return { ...prev, [curr.country]: curr.category };
        }, {});
};

const Component = ({
    style = {},
    x,
    y,
    w,
    h,
    children,
    anchorRight = false,
    anchorBottom = false,
    anchorCenterX = false,
    anchorCenterY = false,
}) => {
    const AnchorTransform = `translate(${anchorCenterX ? "-50%" : "0"},${anchorCenterY ? "-50%" : "0"})`;
    return (
        <div
            style={{
                position: "absolute",
                [anchorBottom ? "bottom" : "top"]: `${anchorBottom ? 100 - y : y}%`,
                [anchorRight ? "right" : "left"]: `${anchorRight ? 100 - x : x}%`,
                width: `${w}cm`,
                height: `${h}cm`,
                backgroundColor: "white",
                borderRadius: "0.5rem",
                boxShadow: "0.075rem 0.05rem 0.075rem 0.075rem #3336",
                margin: "0.25rem",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "0.25rem",
                [anchorCenterX || anchorCenterY ? "transform" : ""]: AnchorTransform,
                ...style,
            }}>
            {children}
        </div>
    );
};

export const Dashboard = () => {
    const [dayValue, setDay] = useState(23);

    return (
        <div
            style={{
                display: "flex",
                gap: "0.25rem",
                minHeight: "100vh",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}>
            <div style={{ display: "flex", gap: "1rem", flexDirection: "row" }}>
                <button onClick={() => setDay((d) => d - 1)}>Prev Day</button>
                <button onClick={() => setDay((d) => d + 1)}>Next Day</button>
            </div>

            <div style={DashboardStyle}>
                {!ytDataLoaded.value && "Loading..."}
                <Component x={0} y={0} w={10} h={1} style={{ fontWeight: "bold" }}>
                    Trending Category Composition
                </Component>
                <Component x={0} y={5} w={10} h={9}>
                    <RadialChart
                        data={TrendingCategoriesByDate.value.ALL}
                        date={GetDateString(dayValue)}
                        radius={200}
                    />
                </Component>
                <Component anchorBottom x={0} y={100} w={25.4} h={11.25}>
                    <span style={{ fontWeight: "bold" }}>Majority Trending Category</span>
                    <MostCommonMap data={GetMostCommonOnDate(dayValue)} />
                </Component>
                <Component anchorRight x={100} y={0} w={10} h={1} style={{ fontWeight: "bold" }}>
                    Category Legend
                </Component>
                <Component anchorRight x={100} y={5} w={10} h={9}>
                    <Legend />
                </Component>
                <Component anchorBottom anchorRight x={100} y={100} w={6.75} h={11.25}>
                    <Barchart date={GetDateString(dayValue)} />
                </Component>
                <Component anchorCenterX x={49.75} y={0} w={12} h={1} style={{ fontWeight: "bold" }}>
                    Common Trending Videos
                </Component>
                <Component anchorCenterX x={49.75} y={5} w={12} h={9}>
                    <NetworkGraph date={GetDateString(dayValue)} />
                </Component>
                <Component anchorBottom x={0} y={50.25} w={width - 0.2} h={1} style={{ fontSize: "20px" }}>
                    <span>
                        <strong>YouTube Trending Data</strong>{" "}
                        <em>
                            {new Date(GetDateString(dayValue)).toLocaleString("en-IE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </em>
                    </span>
                </Component>
            </div>
        </div>
    );
};
