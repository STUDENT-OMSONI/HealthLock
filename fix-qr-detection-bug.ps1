# Root-cause fix: QR detection failing due to size mismatch between
# the library's scan region and the actual rendered video

Write-Host "Applying QR detection fix..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null

$content_0 = @'
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, RefreshCw, Camera, Upload } from "lucide-react";

export default function QRScanner({ onDecode }) {
  const idRef = useRef("qr-reader-" + Math.random().toString(36).slice(2));
  const html5QrRef = useRef(null);
  const fileInputRef = useRef(null);

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

    const onScanFailure = () => {}; // normal while no QR is in view, not an error

    // Fixed-size boxes (e.g. { width: 240, height: 240 }) get computed
    // against the container's dimensions at start() time -- if that ever
    // differs from what's actually rendered (nested containers, CSS
    // resizing after mount, etc.), the visible scan box and the actual
    // sampled pixel region drift apart, and QR codes stop detecting even
    // though the camera clearly works. Using the function form ties the
    // box directly to the real rendered viewfinder size every time.
    const config = {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
        return { width: size, height: size };
      },
    };

    html5QrCode
      .start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
      .then(() => { if (!cancelled) setStatus("scanning"); })
      .catch(() => {
        Html5Qrcode.getCameras()
          .then((devices) => {
            if (cancelled) return;
            if (!devices || devices.length === 0) {
              setStatus("camera-error");
              return;
            }
            html5QrCode
              .start(devices[0].id, config, onScanSuccess, onScanFailure)
              .then(() => { if (!cancelled) setStatus("scanning"); })
              .catch(() => { if (!cancelled) setStatus("camera-error"); });
          })
          .catch(() => { if (!cancelled) setStatus("camera-error"); });
      });

    return () => {
      cancelled = true;
      if (html5QrCode.isScanning) html5QrCode.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const handleScanAgain = () => setResetKey((k) => k + 1);

  // Upload-a-QR-image option -- scans a static image file instead of the camera.
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const tempId = "qr-file-scan-" + Math.random().toString(36).slice(2);
      const tempDiv = document.createElement("div");
      tempDiv.id = tempId;
      tempDiv.style.display = "none";
      document.body.appendChild(tempDiv);
      const scanner = new Html5Qrcode(tempId);
      const decoded = await scanner.scanFile(file, false);
      document.body.removeChild(tempDiv);
      setStatus("success");
      setScannedValue(decoded);
      onDecodeRef.current?.(decoded);
    } catch (err) {
      setStatus("camera-error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircle2 className="mx-auto text-green-600 mb-3" size={44} />
            </motion.div>
            <p className="font-semibold text-gray-900">Scan successful</p>
            <p className="text-xs text-gray-500 mt-1 break-all px-4">{scannedValue}</p>
            <button
              onClick={handleScanAgain}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
            >
              <RefreshCw size={14} /> Scan another patient
            </button>
          </motion.div>
        ) : status === "camera-error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.4 }}
            className="text-center py-8"
          >
            <AlertTriangle className="mx-auto text-yellow-600 mb-3" size={40} />
            <p className="font-semibold text-gray-900">Camera not available</p>
            <p className="text-xs text-gray-500 mt-1 px-4">
              Allow camera permission, close other apps/tabs using the camera,
              or try uploading a QR image instead below.
            </p>
            <div className="flex justify-center gap-2 mt-5">
              <button
                onClick={handleScanAgain}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                <RefreshCw size={14} /> Try again
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                <Upload size={14} /> Upload QR image
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {status === "starting" && (
              <p className="text-xs text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
                <Camera size={14} className="animate-pulse" /> Requesting camera access...
              </p>
            )}
            <div className="relative w-full max-w-[280px] mx-auto">
              <style>{`
                #${idRef.current} {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                #${idRef.current} video,
                #${idRef.current} canvas,
                #${idRef.current} img {
                  border-radius: 16px;
                  display: block;
                }
                #${idRef.current} select, #${idRef.current} button { max-width: 100%; font-size: 12px; }
              `}</style>
              <div id={idRef.current} className="w-full overflow-hidden rounded-2xl" />

              {/* Animated scan frame overlay */}
              {status === "scanning" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[180px] h-[180px]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-lg" />
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_2px_rgba(220,38,38,0.6)]"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Point the camera at the patient's QR code to securely load their records.
            </p>
            <div className="text-center mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
              >
                <Upload size={12} /> Or upload a QR image instead
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUploadImage}
        className="hidden"
      />
    </div>
  );
}

'@
Set-Content -Path "src\Components\QRScanner.jsx" -Value $content_0 -NoNewline
Write-Host "Updated src\Components\QRScanner.jsx" -ForegroundColor Green

Write-Host "Done! Now run: npm run dev" -ForegroundColor Cyan