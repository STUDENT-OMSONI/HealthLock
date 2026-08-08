# REAL FIX: DOM race condition causing 'Element with id=... not found' crash

Write-Host "Applying DOM race condition fix..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null

$content_0 = @'
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Camera,
  Upload,
  Play,
  Square,
  SwitchCamera,
} from "lucide-react";

// Camera states, explicit and exhaustive -- this is the whole point of the
// fix: the camera only ever exists in ONE of these states, and every path
// that ends scanning (success, stop button, unmount, tab hidden, upload
// chosen instead) goes through the same stopCamera() function so a stream
// is never left dangling.
const CAMERA_OFF = "off";
const REQUESTING = "requesting";
const ACTIVE = "active";
const CAM_ERROR = "camera-error";

export default function QRScanner({ onDecode }) {
  const idRef = useRef("qr-reader-" + Math.random().toString(36).slice(2));
  const html5QrRef = useRef(null);
  const fileInputRef = useRef(null);
  const facingModeRef = useRef("environment");

  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;

  const [cameraState, setCameraState] = useState(CAMERA_OFF);
  const [resultStatus, setResultStatus] = useState(null); // null | "success"
  const [scannedValue, setScannedValue] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const config = {
    fps: 10,
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
      return { width: size, height: size };
    },
  };

  // The single source of truth for turning the camera off. Called on:
  // successful scan, Stop button, component unmount, tab becoming hidden,
  // and right before an image-upload scan (so only one stream ever exists).
  const stopCamera = async () => {
    const instance = html5QrRef.current;
    if (instance && instance.isScanning) {
      try {
        await instance.stop();
      } catch {
        // Already stopped/never fully started -- safe to ignore.
      }
    }
    html5QrRef.current = null;
    setCameraState(CAMERA_OFF);
  };

  const onScanSuccess = async (decodedText) => {
    const value = decodedText.trim(); // guards against whitespace mismatches
    setResultStatus("success");
    setScannedValue(value);
    await stopCamera();
    onDecodeRef.current?.(value);
  };

  const onScanFailure = () => {}; // normal while no QR is in view

  const startCamera = async (facingMode = facingModeRef.current) => {
    // Guard: never allow two instances/streams at once.
    if (html5QrRef.current) return;

    setCameraState(REQUESTING);
    setErrorMessage("");
    setResultStatus(null);
    facingModeRef.current = facingMode;

    const html5QrCode = new Html5Qrcode(idRef.current);
    html5QrRef.current = html5QrCode;

    // If the camera is held by another app/tab, getUserMedia can hang
    // indefinitely instead of rejecting -- so we race it against a timeout
    // and show a clear, actionable error instead of "Requesting..." forever.
    const TIMEOUT_MS = 10000;
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), TIMEOUT_MS)
    );

    try {
      await Promise.race([
        html5QrCode.start({ facingMode }, config, onScanSuccess, onScanFailure),
        timeout,
      ]);
      setCameraState(ACTIVE);
    } catch (err) {
      try {
        await html5QrCode.stop();
      } catch {
        // wasn't running yet -- nothing to stop
      }
      html5QrRef.current = null;
      setCameraState(CAM_ERROR);
      if (err.message === "TIMEOUT") {
        setErrorMessage(
          "Camera took too long to respond -- it may be in use by another app (Zoom, Teams, Windows Camera app, another tab). Close those and try again."
        );
      } else {
        setErrorMessage(
          "Could not access the camera. Allow camera permission, close other apps using it, or upload a QR image instead."
        );
      }
    }
  };

  const handleSwitchCamera = async () => {
    const next = facingModeRef.current === "environment" ? "user" : "environment";
    await stopCamera();
    await startCamera(next);
  };

  // Always release the camera when leaving the page, the tab is hidden,
  // or the component unmounts for any reason.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) stopCamera();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Make sure no live camera stream is running underneath the upload scan.
    await stopCamera();

    const tempId = "qr-file-scan-" + Math.random().toString(36).slice(2);
    const tempDiv = document.createElement("div");
    tempDiv.id = tempId;
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    try {
      const scanner = new Html5Qrcode(tempId);
      const decoded = await scanner.scanFile(file, false);
      const value = decoded.trim(); // same whitespace guard as the camera path
      setResultStatus("success");
      setScannedValue(value);
      onDecodeRef.current?.(value);
    } catch (err) {
      setCameraState(CAM_ERROR);
      setErrorMessage("Could not read a QR code from that image. Try a clearer photo.");
    } finally {
      document.body.removeChild(tempDiv);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRestart = async () => {
    await stopCamera();
    setResultStatus(null);
    setScannedValue(null);
    startCamera();
  };

  const statusBadge = {
    [ACTIVE]: { icon: "🟢", label: "Camera Active" },
    [CAMERA_OFF]: { icon: "🔴", label: "Camera Stopped" },
    [REQUESTING]: { icon: "🟡", label: "Requesting Permission" },
    [CAM_ERROR]: { icon: "⚪", label: "No Camera" },
  }[cameraState];

  return (
    <div>
      <div className="flex justify-center mb-3">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
          <span>{statusBadge.icon}</span> {statusBadge.label}
        </span>
      </div>

      {/* This target div must ALWAYS exist in the DOM (React state updates
          are async, so creating/destroying it based on cameraState causes
          html5-qrcode to look for it before React has actually painted it --
          that's the exact "Element with id=... not found" crash). We keep
          it permanently mounted and just hide it with CSS when not needed. */}
      <div
        className="relative w-full max-w-[280px] mx-auto"
        style={{ display: cameraState === ACTIVE || cameraState === REQUESTING ? "block" : "none" }}
      >
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

        {cameraState === ACTIVE && (
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

      <AnimatePresence mode="wait">
        {resultStatus === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
              <CheckCircle2 className="mx-auto text-green-600 mb-3" size={44} />
            </motion.div>
            <p className="font-semibold text-gray-900">Scan successful</p>
            <p className="text-xs text-gray-500 mt-1 break-all px-4">{scannedValue}</p>
            <button
              onClick={handleRestart}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
            >
              <RefreshCw size={14} /> Scan another patient
            </button>
          </motion.div>
        ) : cameraState === CAM_ERROR ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.4 }}
            className="text-center py-8"
          >
            <AlertTriangle className="mx-auto text-yellow-600 mb-3" size={40} />
            <p className="font-semibold text-gray-900">Camera not available</p>
            <p className="text-xs text-gray-500 mt-1 px-4">{errorMessage}</p>
            <div className="flex justify-center gap-2 mt-5">
              <button
                onClick={() => startCamera()}
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
        ) : cameraState === CAMERA_OFF ? (
          <motion.div key="camera-off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <Camera className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="font-semibold text-gray-900">Camera Off</p>
            <p className="text-xs text-gray-500 mt-1 mb-5">Press Start Scanner to begin scanning.</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => startCamera()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
              >
                <Play size={16} /> Start Scanner
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
              >
                <Upload size={14} /> Upload QR
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {cameraState === REQUESTING && (
              <p className="text-xs text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
                <Camera size={14} className="animate-pulse" /> Requesting camera access...
              </p>
            )}

            {cameraState === ACTIVE && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button
                  onClick={stopCamera}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                >
                  <Square size={12} /> Stop Scanner
                </button>
                <button
                  onClick={handleSwitchCamera}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  <SwitchCamera size={12} /> Switch Camera
                </button>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3 text-center">
              Point the camera at the patient's QR code to securely load their records.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
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