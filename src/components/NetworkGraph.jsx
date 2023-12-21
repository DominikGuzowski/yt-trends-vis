import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { CountryColor } from "./YTCategory";
import { CommonTrendingVideos, FormatDateString, DateRange, Milliseconds, Videos } from "../signals/Computed";
const GetDateString = (day) =>
    FormatDateString(new Date(DateRange.value.minValue * Milliseconds.ToDays + day * Milliseconds.ToDays));

const convertToNodesAndLinks = (data) => {
    if (!data) return { nodes: [], links: [] };
    console.log(data);
    let nodes = [
        { id: "US", group: 1 },
        { id: "FR", group: 2 },
        { id: "KR", group: 3 },
        { id: "IN", group: 4 },
        { id: "JP", group: 5 },
        { id: "MX", group: 6 },
        { id: "DE", group: 7 },
        { id: "GB", group: 8 },
        { id: "RU", group: 9 },
        { id: "CA", group: 10 },
    ];
    const links = [];

    for (const item of data) {
        const video = item.video;
        nodes.push({ id: video, group: 11, title: Videos.value[video]?.title, size: item.countries.length });
        const countries = item.countries;
        for (const country of countries) {
            links.push({ source: country, target: video, value: 1 });
        }
    }

    nodes = nodes.filter((n) => n.group > 10 || links.find((l) => l.source === n.id));

    return { nodes, links };
};

const NetworkGraph = ({ date }) => {
    const svgRef = useRef(null);
    useEffect(() => {
        const data = convertToNodesAndLinks(CommonTrendingVideos.value[date]);
        const parent = d3.select(svgRef.current).node().parentNode;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        const types = Array.from(new Set(data.links.map((d) => d.source)));
        const nodes = data.nodes.map((d) => ({ ...d }));
        const links = data.links.map((d) => ({ ...d }));

        const color = d3.scaleOrdinal(types, d3.schemeCategory10);

        function boxingForce() {
            const radius = Math.min(width, height) / 2 - 10;

            for (let node of nodes) {
                node.x = Math.max(-(width - 20) / 2, Math.min((width - 20) / 2, node.x));
                node.y = Math.max(-(height - 20) / 2, Math.min((height - 20) / 2, node.y));
            }
        }

        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3.forceLink(links).id((d) => d.id)
            )
            .force("charge", d3.forceManyBody().strength(-60))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .force("bounds", boxingForce);

        d3.select(svgRef.current).selectAll("*").remove();
        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

        // Per-type markers, as they don't inherit styles.
        svg.append("defs")
            .selectAll("marker")
            .data(types)
            .join("marker")
            .attr("id", (d) => `arrow-${d}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", -0.5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", color)
            .attr("d", "M -5 10, L 0 5");

        const link = svg
            .append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("stroke", (d) => {
                return CountryColor[d.source.id];
            })
            .attr("marker-end", (d) => `url(${new URL(`#arrow-${d.source}`, location)})`);

        const node = svg
            .append("g")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr("fill", "white")
            .call(drag(simulation));

        node.append("text")
            .style("user-select", "none")
            .attr("x", 8)
            .attr("y", "0.25em")
            .attr("fill", "white")
            .attr("stroke", "black")
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .attr("stroke-width", 1)
            .text((d) => (d.group === 11 ? "" : d.id));

        node.append("circle")
            .attr("fill", (d) => (d.group === 11 ? "black" : CountryColor[d.id]))
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("r", (d) => (d.group === 11 ? d.size + 1 : 5));

        node.append("title").text((d) => {
            console.log(d);
            return d.title ?? d.id;
        });

        simulation.on("tick", () => {
            link.attr("d", linkArc);
            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });
        function linkArc(d) {
            const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            return `
              M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}
            `;
        }

        function drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }
    }, [date]);
    return <svg ref={svgRef} />;
};

export default NetworkGraph;
