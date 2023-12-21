import * as d3 from "d3";
import { useRef, useEffect } from "react";
import { CountryColor } from "./YTCategory";

export const LinkGraph = ({ data }) => {
    const svgRef = useRef();

    /**
     Expected data format:
     {
        [country]: [
            {
                id: string // This is used to create a link between 2 items in different countries
                name: string // The name of the item
            }
        ]
     }
     */

    useEffect(() => {
        const target = d3.select(svgRef.current);
        const parent = target.node().parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        const size = Math.min(width, height);
        target.selectAll("g").remove();

        const diameter = size - 10;
        const radius = diameter / 2;
        const innerRadius = radius - 120;

        const dataAsArray = Object.keys(data).map((country) => {
            return { name: country, items: data[country] };
        });

        const createLinksBetweenCountryItemsBasedOnIds = (data) => {
            /*
                link: {
                    id: number,
                    countries: [string]
                }
            */

            const links = [];
            const ids = new Set();

            data.forEach((country) => {
                country.items.forEach((item) => {
                    if (ids.has(item.id)) {
                        const link = links.find((l) => l.id === item.id);
                        link.countries.push(country.name);
                    } else {
                        ids.add(item.id);
                        links.push({ id: item.id, countries: [country.name] });
                    }
                });
            });

            // Add items without links
            data.forEach((country) => {
                country.items.forEach((item) => {
                    if (!ids.has(item.id)) {
                        links.push({ id: item.id, countries: [country.name] });
                    }
                });
            });
            return links;
        };

        // const itemLinks = createLinksBetweenCountryItemsBasedOnIds(dataAsArray);

        // console.log(dataAsArray);
        // console.log(itemLinks);

        // const cluster = d3.cluster().size([360, innerRadius]);

        // const line = d3
        //     .lineRadial()
        //     .curve(d3.curveBundle.beta(0.85))
        //     .radius((d) => d.y)
        //     .angle((d) => (d.x / 180) * Math.PI);

        // svg = svg
        //     .attr("width", diameter)
        //     .attr("height", diameter)
        //     .append("g")
        //     .attr("transform", "translate(" + radius + "," + radius + ")");

        // const link = svg.append("g").selectAll(".link");
        // const node = svg.append("g").selectAll(".node");
    }, [data]);

    return <svg ref={svgRef} />;
};
