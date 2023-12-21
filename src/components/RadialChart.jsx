import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { CategoryColor, Categories, ColorScheme } from "./YTCategory";

export const legend = (svgRef) => {
    const parentContainer = d3.select(svgRef).node().parentNode;
    const w = parentContainer.clientWidth;
    const h = parentContainer.clientHeight;
    const svg = d3
        .select(svgRef)
        .attr("width", w)
        .attr("height", h)
        .attr("viewBox", [-w / 2, -h / 2, w, h])
        .attr("style", `width: 100%; height: auto; font: ${Math.min(w, h) / 22}px sans-serif; background: transparent`);
    svg.selectAll("g").remove();

    svg.append("defs")
        .append("pattern")
        .attr("id", "diagonalHatch")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 4)
        .attr("height", 4)
        .append("path")
        .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5);

    svg.append("g")
        .selectAll()
        .data(Categories)
        .join("g")
        .attr(
            "transform",
            (d, i) =>
                `translate(${i < 9 || i === 18 ? -w / 2 + 10 : -5},${
                    -h / 2 + 5 + (i === 18 ? 0 : ((i % 9) + 1) * (h / 10))
                })`
        )
        .call((g) => {
            g.append("rect")
                .attr("width", "1em")
                .attr("height", "1em")
                .style("fill", (d, i) => {
                    return CategoryColor[d];
                });
        })
        .call((g) => {
            g.append("rect")
                .attr("width", "1em")
                .attr("height", "1em")
                .style("fill", (d, i) => {
                    return i > 8 && i !== 18 ? "url(#diagonalHatch)" : "none";
                });
        })
        .call((g) =>
            g
                .append("text")
                .attr("x", "1.25em")
                .attr("y", "1em")
                .attr("dy", "-0.1em")
                .text((d) => d)
                .attr("font-size", "1em")
        );
};

const chart = (svgRef, data, date, categories, size) => {
    const filtered = data.filter((d) => d.xval === date && categories.includes(d.category));
    const diameter = size;
    const outerRadius = diameter / 2 - 5;
    const innerRadius = outerRadius / 2.5;

    const series = d3
        .stack()
        .keys(d3.union(filtered.map((d) => d.category)))
        .value(([, D], key) => {
            return D.get(key)?.y ?? 0;
        })(
        d3.index(
            filtered,
            (d) => d.country,
            (d) => d.category
        )
    );

    const y = d3
        .scaleRadial()
        .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
        .range([innerRadius, outerRadius]);

    const x = d3
        .scaleBand()
        .domain(filtered.map((d) => d.country))
        .range([0, 2 * Math.PI])
        .align(0);

    const arc = d3
        .arc()
        .innerRadius((d) => y(d[0]))
        .outerRadius((d) => y(d[1]))
        .startAngle((d) => x(d.data[0]))
        .endAngle((d) => x(d.data[0]) + x.bandwidth())
        .padAngle(5.5 / innerRadius)
        .padRadius(innerRadius);

    const formatValue = (x) => (isNaN(x) ? "N/A" : x.toLocaleString("en"));
    d3.select(svgRef).selectAll("*").remove();
    const svg = d3
        .select(svgRef)
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("viewBox", [-diameter / 2, -diameter / 2, diameter, diameter])
        .attr("style", "width: 100%; height: auto; font: 0.5rem sans-serif; background: transparent");

    svg.append("g")
        .selectAll()
        .data(series)
        .join("g")
        .style("fill", (d, i) => CategoryColor[d.key])
        .selectAll("path")
        .data((D) => D.map((d) => ((d.key = D.key), d)))
        .join("path")
        .attr("d", arc)
        .append("title")
        .text((d) => `${d.data[0]} ${d.key}: ${formatValue(d.data[1].get(d.key)?.y)}`);

    svg.append("g")
        .selectAll()
        .data(series)
        .join("g")
        .style("fill", (d, i) => {
            return Categories.indexOf(d.key) < 9 ? "none" : "url(#diagonalHatch)";
        })
        .selectAll("path")
        .data((D) => D.map((d) => ((d.key = D.key), d)))
        .join("path")
        .attr("d", arc)
        .append("title")
        .text((d) => `${d.data[0]} ${d.key}: ${formatValue(d.data[1].get(d.key)?.y)}`);

    svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll()
        .data(x.domain())
        .join("g")
        .attr(
            "transform",
            (d) => `
          rotate(${((x(d) + x.bandwidth() / 2) * 180) / Math.PI - 90})
          translate(${innerRadius},0)
        `
        )
        .call((g) => {
            g.append("line").attr("x2", -5).attr("stroke", "#000");
        })
        .call((g) =>
            g
                .append("text")
                .attr("font-size", "0.325rem")
                .attr("transform", (d) =>
                    (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                        ? "rotate(90)translate(0,10)"
                        : "rotate(-90)translate(0,-7)"
                )
                .text((d) => d)
        );

    svg.append("g")
        .attr("text-anchor", "middle")
        .call((g) =>
            g
                .selectAll("g")
                .data(y.ticks(1).slice(1))
                .join("g")
                .attr("fill", "none")
                .call((g) =>
                    g
                        .append("circle")
                        .attr("stroke", "#000")
                        .attr("stroke-width", 0.5)
                        .attr("stroke-opacity", 0.5)
                        .attr("r", y)
                )
                .call((g) =>
                    g
                        .append("text")
                        .attr("y", (d) => -y(d))
                        .attr("dy", "0.35rem")
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 5)
                        .clone(true)
                        .attr("fill", "#000")
                        .attr("stroke", "none")
                )
        );
};

export const RadialChart = ({ data, date, radius = 800 }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (data.length > 0) {
            console.log(d3.schemeSpectral);
            chart(svgRef.current, data, date, Categories, radius);
        }
    }, [data, date]);
    return <svg ref={svgRef}></svg>;
};
