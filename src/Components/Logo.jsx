import React from "react";
import { Lock } from "lucide-react";

export default function Logo({ size = "text-2xl" }) {
  return (
    <div className={`flex items-center gap-2 font-extrabold ${size}`}>
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white">
        <Lock size={18} strokeWidth={2.5} />
      </span>
      <span className="text-gray-900">
        health<span className="text-red-600">lock</span>
      </span>
    </div>
  );
}
