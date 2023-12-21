import { legend } from "./RadialChart";
import { useRef, useEffect } from "react";

export const Legend = () => {
    const svgRef = useRef(null);
    useEffect(() => {
        legend(svgRef.current);
    }, []);

    return <svg ref={svgRef} />;
};
