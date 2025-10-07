import React from "react";

interface BtnMainProps {
  text: string;
  size: string;
  weight?: string;
}

export const BtnMain = ({ text, size, weight }: BtnMainProps) => {
  return (
    <button className={`btn btn-primary bg-verde px-10 py-3 rounded-2xl text-${size} font-${weight}`}>
      {text}
    </button>
  );
};
