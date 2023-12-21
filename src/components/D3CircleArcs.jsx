import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { CountryColor } from "./YTCategory";

const D3CircleArcs = ({ data }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("g").remove();

        const width = svg.attr("width");
        const height = svg.attr("height");
        const radius = Math.min(width, height) / 2;

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        const arc = d3
            .arc()
            .innerRadius(radius * 0.875)
            .outerRadius(radius * 0.9)
            .startAngle((d) => d.startAngle)
            .padAngle(0.05)
            .endAngle((d) => d.endAngle);

        const pie = d3.pie().value(1);

        const arcs = pie(data);

        svg.selectAll("path")
            .data(arcs)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => {
                return CountryColor[d.data];
            })
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const lineCount = 2; // Set N to the desired number of lines

        // Function to generate line data for each arc
    }, [data]);

    return (
        <svg ref={svgRef} width={400} height={400}>
            {/* Add any additional SVG elements here */}
        </svg>
    );
};

export default D3CircleArcs;
