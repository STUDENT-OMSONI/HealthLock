# Fix: camera turns ON immediately when scanner opens

Write-Host "Applying camera fix..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null

$content_0 = @'
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, AlertTriangle, RefreshCw, Camera } from "lucide-react";

export default function QRScanner({ onDecode }) {
  const idRef = useRef("qr-reader-" + Math.random().toString(36).slice(2));
  const html5QrRef = useRef(null);

  // Keep the latest onDecode callback in a ref so the camera effect below
  // doesn't need to depend on it -- otherwise a new inline function from
  // the parent on every render would restart the camera constantly.
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;

  const [status, setStatus] = useState("starting"); // starting | scanning | success | camera-error
  const [scannedValue, setScannedValue] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("starting");
    setScannedValue(null);

    const html5QrCode = new Html5Qrcode(idRef.current);
    html5QrRef.current = html5QrCode;

    const onScanSuccess = (decodedText) => {
      if (cancelled) return;
      setStatus("success");
      setScannedValue(decodedText);
      onDecodeRef.current?.(decodedText);
      html5QrCode.stop().catch(() => {});
    };

    const onScanFailure = () => {
      // Called continuously while no QR code is in view -- this is normal
      // and not an actual error, so we intentionally do nothing here.
    };

    const config = { fps: 10, qrbox: { width: 240, height: 240 } };

    // Try the back/rear camera first (best for scanning on phones).
    html5QrCode
      .start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
      .then(() => {
        if (!cancelled) setStatus("scanning");
      })
      .catch(() => {
        // No rear camera (common on laptops) -- fall back to any camera.
        Html5Qrcode.getCameras()
          .then((devices) => {
            if (cancelled) return;
            if (!devices || devices.length === 0) {
              setStatus("camera-error");
              return;
            }
            html5QrCode
              .start(devices[0].id, config, onScanSuccess, onScanFailure)
              .then(() => {
                if (!cancelled) setStatus("scanning");
              })
              .catch(() => {
                if (!cancelled) setStatus("camera-error");
              });
          })
          .catch(() => {
            if (!cancelled) setStatus("camera-error");
          });
      });

    return () => {
      cancelled = true;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const handleScanAgain = () => setResetKey((k) => k + 1);

  return (
    <div>
      {status === "success" ? (
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto text-green-600 mb-3" size={40} />
          <p className="font-semibold text-gray-900">Scan successful</p>
          <p className="text-xs text-gray-500 mt-1 break-all px-4">{scannedValue}</p>
          <button
            onClick={handleScanAgain}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
          >
            <RefreshCw size={14} /> Scan another patient
          </button>
        </div>
      ) : status === "camera-error" ? (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto text-yellow-600 mb-3" size={40} />
          <p className="font-semibold text-gray-900">Camera not available</p>
          <p className="text-xs text-gray-500 mt-1 px-4">
            Allow camera permission in your browser's address bar, close any
            other app/tab using the camera, and make sure you're on
            http://localhost (or HTTPS) -- browsers block camera access
            otherwise.
          </p>
          <button
            onClick={handleScanAgain}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : (
        <>
          {status === "starting" && (
            <p className="text-xs text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
              <Camera size={14} className="animate-pulse" /> Requesting camera access...
            </p>
          )}
          <div id={idRef.current} style={{ width: "100%" }} />
          <p className="text-xs text-gray-500 mt-2 text-center">
            Point the camera at the patient's QR code to securely load their records.
          </p>
        </>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\Components\QRScanner.jsx" -Value $content_0 -NoNewline
Write-Host "Updated src\Components\QRScanner.jsx" -ForegroundColor Green

Write-Host "Done! Now run: npm run dev" -ForegroundColor Cyan