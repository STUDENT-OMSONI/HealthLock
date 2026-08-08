import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onDecode, onError }) {
  const idRef = useRef("qr-reader-" + Math.random().toString(36).slice(2));

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      idRef.current,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onDecode?.(decodedText);
        scanner.clear().catch(() => {});
      },
      (err) => {
        if (typeof onError === "function") onError(err);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onDecode, onError]);

  return (
    <div>
      <div id={idRef.current} style={{ width: "100%" }} />
      <p className="text-xs text-gray-500 mt-2">
        Tip: if camera doesn't appear, allow permission or use HTTPS when testing on phone.
      </p>
    </div>
  );
}
