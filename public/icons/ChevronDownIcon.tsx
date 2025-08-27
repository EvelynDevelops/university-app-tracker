import React from "react";
import { IconProps } from "./type";

const ChevronDownIcon = ({ 
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
};

export default ChevronDownIcon;