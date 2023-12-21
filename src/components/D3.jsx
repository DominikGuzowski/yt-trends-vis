import * as d3 from "d3";
import { useEffect, useRef } from "react";

function stringToColor(str) {
    // Simple hash function to generate a color code
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert the hash to a 6-digit hexadecimal color code
    const color = (hash & 0x00ffffff).toString(16).toUpperCase();

    // Add leading zeros if necessary
    return "#" + "00000".substring(0, 6 - color.length) + color;
}

export const LineGraph = ({ data, dataKey }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (data.value[dataKey]?.data?.length > 0) {
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();
            svg.attr("width", 900);
            svg.attr("height", 400);
            svg.style("background", "#FFF");

            const xScale = d3.scaleLinear();
            xScale.domain(data.value[dataKey].axes.x);
            xScale.range([0, 900]);

            const yScale = d3.scaleLinear();
            yScale.domain(data.value[dataKey].axes.y);
            yScale.range([400, 0]);

            const line = d3.line();
            line.x((d) => xScale(d.x));
            line.y((d) => yScale(d.y));
            line.curve(d3.curveCardinal);

            svg.selectAll(".line")
                .data(data.value[dataKey].data.map((category) => category))
                .join("path")
                .attr("d", (d) => line(d.data))
                .attr("fill", "none")
                .attr("stroke", (d, i) => d3.schemeCategory10[i % 10]);

            svg.append("text")
                .attr("x", svg.attr("width") / 2)
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .style("text-decoration", "underline")
                .text(`${dataKey} Trending Categories`);
        }
    }, [data.value]);

    return (
        <div>
            <svg ref={svgRef} />
        </div>
    );
};
