import { useRef } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Countries, CountryColor } from "./YTCategory";

const CustomScatter = ({ cx, cy, payload }) => {
    const { size } = payload;

    return <circle cx={cx} cy={cy} r={size * 50} fill='blue' />;
};

export const Bubbleplot = ({ data }) => {
    const CountryCodeColor = {
        US: "#ff0000",
        GB: "#00ff00",
        CA: "#0000ff",
        IN: "#ffff00",
        RU: "#ff00ff",
        DE: "#00ffff",
        FR: "#ff8000",
        KR: "#8000ff",
        JP: "#00ff80",
        MX: "#ff0080",
    };

    const reshape = () => {
        const result = [];
        let miny = Infinity;
        let maxy = -Infinity;

        if (data) {
            console.log(data);
            for (const c of Countries) {
                for (const [x, y] of Object.entries(data[c] ?? {})) {
                    result.push({ c, x, y, i: Countries.indexOf(c) });
                    miny = Math.min(miny, y);
                    maxy = Math.max(maxy, y);
                }
            }
        }
        for (const r of result) {
            r.size = (r.y - miny) / (maxy - miny);
        }
        return result;
    };

    const reshaped = reshape();

    return (
        <ScatterChart width='100%' height='100%' margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis dataKey='i' type='number' name='X-axis' />
            <YAxis dataKey='x' type='number' name='Y-axis' scale='log' base={2} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            {reshaped.map((entry, index) => (
                <Scatter
                    key={index}
                    name={entry.c}
                    data={[entry]}
                    fill={CountryColor[entry.c]} // Assign a random color
                />
            ))}
        </ScatterChart>
    );
};
