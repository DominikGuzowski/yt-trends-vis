import React, { useState } from "react";

export const Slider = ({ min, max, onChange }) => {
    const [value, setValue] = useState(min);

    const handleSliderChange = (event) => {
        const newValue = parseInt(event.target.value, 10);
        setValue(newValue);
        onChange(newValue);
    };

    return (
        <div>
            <input type='range' min={min} max={max} value={value} onChange={handleSliderChange} />
            <span>{value}</span>
        </div>
    );
};
