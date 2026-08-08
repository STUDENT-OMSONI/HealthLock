import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRGenerator() {
  const [token, setToken] = useState("");

  const generate = () => {
    const t = "TEMP_TOKEN_" + Date.now();
    setToken(t);
  };

  return (
    <div>
      <button
        onClick={generate}
        className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
      >
        Generate QR
      </button>

      {token && (
        <div style={{ marginTop: 16, textAlign: "center" }} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 inline-block">
          <QRCodeCanvas value={token} size={180} />
          <div className="text-xs text-gray-500 mt-2">
            Share this QR with the doctor
          </div>
        </div>
      )}
    </div>
  );
}
