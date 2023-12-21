import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { LineGraph } from "./components/D3";
import { ytTrendsDataLoading, ytCurrentCountry, loadData, ytTrendsData, ytDataLoaded } from "./signals/CsvSignal";
import { computed } from "@preact/signals-react";
import "./App.css";
import { TrendingCategoriesByDate, MostCommonCategoryPerDate, DateRange, Milliseconds } from "./signals/Computed";
import { RadialChart } from "./components/RadialChart";
import { Map, MostCommonMap } from "./components/EarthMap";
import { Dashboard } from "./components/Dashboard";
import { signal } from "@preact/signals-react";

const loaded = { isLoaded: false };
function App() {
    useEffect(() => {
        if (!loaded.isLoaded) {
            loaded.isLoaded = true;
            console.log("Maths", [1, 2, 3, 4, -4, -2, -4, -6, -7].sort);
            loadData();
        }
    }, []);

    console.log("render app");
    console.log(DateRange.value, DateRange.value.numberOfDays());
    console.log(new Date(DateRange.value.minValue * Milliseconds.ToDays));

    return (
        <>
            <Dashboard loaded={ytDataLoaded.value} />
        </>
    );
}

export default App;
