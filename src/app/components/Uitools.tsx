import React from "react";

interface BtnMainProps {
  text: string;
  size: string;
  weight?: string;
  onClick?: () => void;
}

export const BtnMain = ({ text, size, weight, onClick }: BtnMainProps) => {
  return (
    <button 
      className={`btn btn-primary bg-verde px-10 py-3 rounded-2xl text-${size} font-${weight}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};
