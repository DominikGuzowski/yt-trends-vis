import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FormatDateString, TotalEngagement, DateRange, Milliseconds } from "../signals/Computed";

const createStackedBarchart = (ref, data) => {
    const parent = d3.select(ref).node().parentNode;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    console.log("width", width, "height", height);
    if (data.data?.length === 0) {
        d3.select(ref).selectAll("g").remove();
        const svg = d3
            .select(ref)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left / 2},${margin.top})`);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", `${Math.min(width, height) / 19}px`)
            .text("No Data");

        return;
    }
    data.data.sort((a, b) => b.value.total - a.value.total);
    const maxTotal = Math.max(...data.data.map((d) => d.value.total));

    d3.select(ref).selectAll("g").remove();
    const svg = d3
        .select(ref)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left / 2},${margin.top})`);

    const subgroups = ["likes", "dislikes", "comments"];
    const groups = d3.map(data.data, (d) => d.key);
    const stackedData = d3.stack().keys(d3.union(subgroups))(data.data.map((d) => d.value));

    const title = `Video Engagement`;
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", `${Math.min(width, height) / 19}px`)
        .style("font-weight", "bold")
        .text(title);

    const x = d3
        .scaleBand()
        .domain(groups)
        .range([margin.left, width - margin.right])
        .padding([0.2]);

    const y = d3
        .scaleLinear()
        .domain([0, maxTotal * 1.05])
        .range([height - margin.top - margin.bottom, 0]);

    const color = d3.scaleOrdinal().domain(subgroups).range(["#0c0", "#d20", "#08f"]);

    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", (d) => color(d.key))
        .selectAll("rect")
        .data((d) => d)
        .enter()
        .append("rect")
        .attr("x", (d, i) => x(groups[i]))
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .append("title")
        .text((d) => {
            return `Likes: ${d.data.likes}\nDislikes: ${d.data.dislikes}\nComments: ${d.data.comments}\nTotal: ${d.data.total}`;
        });

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom - margin.top})`)
        .attr("color", "black")
        .call(d3.axisBottom(x).tickSizeOuter(0));
    svg.append("g").attr("color", "black").call(d3.axisRight(y).ticks(5));
};

export const Barchart = ({ date }) => {
    const svgRef = useRef();

    const data = TotalEngagement.value[date];

    console.log(date, data);

    useEffect(() => {
        createStackedBarchart(svgRef.current, {
            date,
            data: data ? Object.entries(data).reduce((p, [k, v]) => [...p, { key: k, value: v }], []) : [],
        });
    }, [date]);

    return <svg ref={svgRef} />;
};
