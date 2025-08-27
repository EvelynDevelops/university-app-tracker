import React from "react";
import { IconProps } from "./type";

const UsersIcon = ({ 
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m22 21-2-2" />
      <path d="M16 16h6" />
    </svg>
  );
};

export default UsersIcon; 