import React from "react";
import medikeyLogoImg from "../assets/medikey-logo.png";

export default function Logo({ size = "text-2xl", imgHeight = "h-8 md:h-9", textColor = "text-gray-900", showText = true }) {
  return (
    <div className={`inline-flex items-center gap-2.5 font-black tracking-tight select-none ${size}`}>
      <img
        src={medikeyLogoImg}
        alt="MediKey Logo"
        className={`${imgHeight} w-auto object-contain transition-transform duration-200 hover:scale-105`}
      />
      {showText && (
        <span className={textColor}>
          Medi<span className="text-red-600">Key</span>
        </span>
      )}
    </div>
  );
}
