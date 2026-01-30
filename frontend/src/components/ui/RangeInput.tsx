import React from "react";

interface RangeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  min: number;
  max: number;
}

export function RangeInput({
  value,
  min,
  max,
  className,
  ...props
}: RangeInputProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const backgroundStyle = {
    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`,
  };

  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      style={backgroundStyle}
      className={`aegis-slider w-full ${className || ""}`}
      {...props}
    />
  );
}
