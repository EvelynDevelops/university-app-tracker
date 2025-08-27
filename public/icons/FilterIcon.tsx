import React from "react";
import { IconProps } from "./type";

const FilterIcon = ({ 
  className = "", 
  width = 24, 
  height = 24,
  viewBox = "0 0 24 24",
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  );
};

export default FilterIcon; 