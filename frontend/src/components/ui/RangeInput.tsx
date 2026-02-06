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
  disabled,
  ...props
}: RangeInputProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const fillColor = disabled ? "#94a3b8" : "#6366f1"; 
  const emptyColor = disabled ? "#020617" : "#1e293b";
  const backgroundStyle = {
    background: `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percentage}%, ${emptyColor} ${percentage}%, ${emptyColor} 100%)`,
  };

  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      disabled={disabled}
      style={backgroundStyle}
      className={`aegis-slider w-full transition-all duration-200 
        ${disabled ? "cursor-not-allowed opacity-70 grayscale" : "cursor-pointer"} 
        ${className || ""}`}
      {...props}
    />
  );
}

