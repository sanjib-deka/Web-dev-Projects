import React, { useState, useRef, useEffect, useContext } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion"; // Add AnimatePresence
import { dataContext } from "../context/UserContext";
import axios from "axios";

// Update this path to match your actual image location
const BG_IMAGE = "/forest-bg.jpg";

// Replace FONT_OPTIONS with built-in fonts:
const FONT_OPTIONS = [
  // Italic fonts first
  { name: "Helvetica-Oblique", font: StandardFonts.HelveticaOblique, fontFamily: "Helvetica, Arial, sans-serif", fontStyle: "italic" },
  { name: "Helvetica-BoldOblique", font: StandardFonts.HelveticaBoldOblique, fontFamily: "Helvetica, Arial, sans-serif", fontWeight: "bold", fontStyle: "italic" },
  { name: "TimesRoman-Italic", font: StandardFonts.TimesRomanItalic, fontFamily: "Times New Roman, Times, serif", fontStyle: "italic" },
  { name: "TimesRoman-BoldItalic", font: StandardFonts.TimesRomanBoldItalic, fontFamily: "Times New Roman, Times, serif", fontWeight: "bold", fontStyle: "italic" },
  { name: "Courier-Oblique", font: StandardFonts.CourierOblique, fontFamily: "Courier New, Courier, monospace", fontStyle: "italic" },
  { name: "Courier-BoldOblique", font: StandardFonts.CourierBoldOblique, fontFamily: "Courier New, Courier, monospace", fontWeight: "bold", fontStyle: "italic" },
  // Remaining fonts
  { name: "Helvetica", font: StandardFonts.Helvetica, fontFamily: "Helvetica, Arial, sans-serif" },
  { name: "Helvetica-Bold", font: StandardFonts.HelveticaBold, fontFamily: "Helvetica, Arial, sans-serif", fontWeight: "bold" },
  { name: "TimesRoman", font: StandardFonts.TimesRoman, fontFamily: "Times New Roman, Times, serif" },
  { name: "TimesRoman-Bold", font: StandardFonts.TimesRomanBold, fontFamily: "Times New Roman, Times, serif", fontWeight: "bold" },
  { name: "Courier", font: StandardFonts.Courier, fontFamily: "Courier New, Courier, monospace" },
  { name: "Courier-Bold", font: StandardFonts.CourierBold, fontFamily: "Courier New, Courier, monospace", fontWeight: "bold" },
  { name: "ZapfDingbats", font: StandardFonts.ZapfDingbats, fontFamily: "Zapf Dingbats, serif" },
];

const COLOR_OPTIONS = [
  { name: "Indigo", value: "#3730a3" },
  { name: "Black", value: "#222" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#059669" },
  { name: "Blue", value: "#2563eb" },
  { name: "Gray", value: "#6b7280" },
  { name: "White", value: "#fff" },
];

const PdfPreview = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [pdfFile, setPdfFile] = useState(null); // Store the uploaded file
  const [sigText, setSigText] = useState("Your Name");
  const [sigFont, setSigFont] = useState(FONT_OPTIONS[0]);
  const [sigSize, setSigSize] = useState(48);
  const [sigColor, setSigColor] = useState(COLOR_OPTIONS[0].value);
  const [sigPosition, setSigPosition] = useState({ x: 200, y: 200 });
  const [showSignature, setShowSignature] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showDigiSealPopup, setShowDigiSealPopup] = useState(false);
  const [sealNumber, setSealNumber] = useState(() => Math.floor(10000 + Math.random() * 900000)); // 5 or 6 digit
  const [ipAddress, setIpAddress] = useState("");
  const [geoLocation, setGeoLocation] = useState("");
  const [sealTagAttached, setSealTagAttached] = useState(false);
  const pdfContainerRef = useRef();

  const [activeDrag, setActiveDrag] = useState(null); // 'signature' | 'seal' | null
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [showSealSuccess, setShowSealSuccess] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" }); // type: "success" | "error"
  const [loading, setLoading] = useState(false);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileUrl(URL.createObjectURL(file));
      setPdfFile(file); // Save file for download
    } else {
      setFileUrl(null);
      setPdfFile(null);
    }
  };

  // Mouse events for custom drag
  const handleMouseDown = (e) => {
    if (!pdfContainerRef.current) return;
    setActiveDrag('signature');
    setDragging(true);
    const rect = pdfContainerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - sigPosition.x,
      y: e.clientY - rect.top - sigPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (activeDrag !== 'signature' || !dragging) return;
    const rect = pdfContainerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffset.x;
    let y = e.clientY - rect.top - dragOffset.y;
    // Clamp to container
    x = Math.max(0, Math.min(x, rect.width - 120));
    y = Math.max(0, Math.min(y, rect.height - 48));
    // Prevent overlap with seal tag if attached
    if (sealTagAttached) {
      const sealRect = {
        x: sigPosition.x,
        y: sigPosition.y,
        w: 120,
        h: 32,
      };
      if (
        x < sealRect.x + sealRect.w &&
        x + 120 > sealRect.x &&
        y < sealRect.y + sealRect.h &&
        y + 48 > sealRect.y
      ) {
        // Snap signature above or below seal tag
        if (y + 48 > sealRect.y && y < sealRect.y) {
          y = sealRect.y - 48;
        } else if (y < sealRect.y + sealRect.h && y > sealRect.y) {
          y = sealRect.y + sealRect.h;
        }
      }
    }
    setSigPosition({ x, y });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setActiveDrag(null);
  };

  // Set signature position by clicking on PDF area
  const handlePdfClick = (e) => {
    if (!pdfContainerRef.current) return;
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSigPosition({ x: x - 60, y: y - 24 }); // Center the signature
    setShowSignature(true);
  };

  // Download signed PDF using pdf-lib
  const handleDownload = async () => {
    if (!pdfFile) return;
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const page = pdfDoc.getPages()[0];
    const pdfWidth = page.getWidth();
    const pdfHeight = page.getHeight();
    const containerRect = pdfContainerRef.current.getBoundingClientRect();

    // Calculate scaling between preview and PDF
    const scaleX = pdfWidth / containerRect.width;
    const scaleY = pdfHeight / containerRect.height;

    // Map signature position from preview to PDF coordinates
    const pdfX = sigPosition.x * scaleX;
    // PDF Y origin is bottom-left, browser preview is top-left
    const pdfY = pdfHeight - ((sigPosition.y + sigSize) * scaleY);

    // Embed the selected font from TTF if available, else fallback
    let font;
    try {
      font = await pdfDoc.embedFont(sigFont.font);
    } catch (e) {
      font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    }

    // Convert hex color to rgb
    const hexToRgb = (hex) => {
      const val = hex.replace("#", "");
      const num = parseInt(val, 16);
      return {
        r: ((num >> 16) & 255) / 255,
        g: ((num >> 8) & 255) / 255,
        b: (num & 255) / 255,
      };
    };
    const color = hexToRgb(sigColor);

    page.drawText(sigText, {
      x: pdfX,
      y: pdfY,
      size: sigSize * scaleX, // Use scaleX to match visual size
      font,
      color: rgb(color.r, color.g, color.b),
    });

    // Add this block to also draw the DigiSeal tag if attached
    if (sealTagAttached) {
      // Calculate the seal tag Y position just below the signature
      const sealTagHeight = 18 * scaleY;
      const pdfSealX = pdfX;
      const pdfSealY = pdfY - sealTagHeight - 4 * scaleY; // 4px gap

      // Draw the seal number
      page.drawText(String(sealNumber), {
        x: pdfSealX,
        y: pdfSealY + 10 * scaleY,
        size: 8 * scaleX,
        font: await pdfDoc.embedFont(StandardFonts.CourierBold),
        color: rgb(0.02, 0.59, 0.41), // #059669
      });

      // Draw the message (replace "✔" with "Digitally Signed")
      page.drawText("Digitally Signed using signkaro\nTo verify visit signkaro", {
        x: pdfSealX,
        y: pdfSealY,
        size: 5 * scaleX,
        font: await pdfDoc.embedFont(StandardFonts.Courier),
        color: rgb(0.145, 0.388, 0.921), // #2563eb
        lineHeight: 6 * scaleY,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "signed.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fetch IP address on popup open
  useEffect(() => {
    if (showDigiSealPopup) {
      fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => setIpAddress(data.ip))
        .catch(() => setIpAddress("Unavailable"));
    }
  }, [showDigiSealPopup]);

let { serverUrl } = useContext(dataContext)

  const handleDigiSeal = async (e) => {
    e.preventDefault();

    if (!sealTagAttached) {
      setNotification({ show: true, message: "Please add the seal number first.", type: "error" });
      setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 2200);
      return;
    }

    try {
      const payload = {
        sealNumber,
        name,
        email,
        ipAdress: ipAddress,
        geoLocation,
        reason,
      };

      const { data } = await axios.post(
        serverUrl + "/api/activateSeal",
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );
      setShowSealSuccess(true);
      setNotification({ show: true, message: "DigiSeal has been activated!", type: "success" });
      setTimeout(() => {
        setShowSealSuccess(false);
        setNotification({ show: false, message: "", type: "success" });
      }, 2200);
      setShowDigiSealPopup(false);
    } catch (error) {
      let msg = "An unexpected error occurred. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      }
      setNotification({ show: true, message: msg, type: "error" });
      setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 2200);
    }
  }
 
 
    
    // Optionally close popup or show success message
 

  return (
    <div
      className="flex min-h-screen w-full bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${BG_IMAGE})`,
      }}
    >
      {/* Overlay for glass effect */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Sidebar */}
      <aside className="z-10 w-full max-w-xl md:max-w-2xl lg:max-w-2xl bg-white/10 border-r border-[#14532d] shadow-lg flex flex-col px-6 py-8 overflow-y-auto sticky top-0 h-screen backdrop-blur-md relative">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold mb-6 tracking-wide"
        >
          Sign<span className="text-[#22c55e]">Karo</span>
        </motion.span>
        {/* PDF Upload */}
        <label className="block mb-2 text-sm font-medium text-[#a7f3d0]">
          Upload PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="mb-6 block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#d1fae5] file:text-[#14532d] hover:file:bg-[#bbf7d0]"
        />

        <label className="block mb-2 text-sm font-medium text-[#a7f3d0]">
          Type your name
        </label>
        <input
          type="text"
          value={sigText}
          onChange={(e) => {
            setSigText(e.target.value);
            setShowSignature(true);
          }}
          className="w-full mb-4 px-3 py-2 border border-[#3f614c] rounded focus:outline-none focus:ring-2 focus:ring-[#22c55e] bg-[#1e3a24]/80 text-[#d1fae5] placeholder-[#a7f3d0]"
          placeholder="Enter your name"
        />

        <label className="block mb-2 text-sm font-medium text-[#a7f3d0]">
          Select font
        </label>
        <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.name}
              type="button"
              className={`px-3 py-1 rounded border ${
                sigFont.name === font.name
                  ? "border-[#22c55e] bg-[#14532d] text-[#d1fae5]"
                  : "border-[#3f614c] text-[#a7f3d0]"
              } transition`}
              style={{
                fontFamily: font.fontFamily,
                fontWeight: font.fontWeight,
                fontStyle: font.fontStyle,
              }}
              onClick={() => setSigFont(font)}
            >
              {font.name}
            </button>
          ))}
        </div>

        <label className="block mb-2 text-sm font-medium text-[#a7f3d0]">
          Signature color
        </label>
        <div className="flex gap-2 mb-4">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                sigColor === color.value
                  ? "border-[#22c55e] ring-2 ring-[#a7f3d0]"
                  : "border-[#3f614c]"
              }`}
              style={{
                background: color.value,
                color: color.value === "#fff" ? "#222" : undefined,
              }}
              onClick={() => setSigColor(color.value)}
              aria-label={color.name}
            >
              {color.value === "#fff" ? (
                <span className="w-3 h-3 rounded-full border border-gray-300 bg-white block"></span>
              ) : color.value === "#6b7280" ? (
                <span className="w-3 h-3 rounded-full border border-gray-300 bg-gray-400 block"></span>
              ) : null}
            </button>
          ))}
        </div>

        <label className="block mb-2 text-sm font-medium text-[#a7f3d0]">
          Signature size
        </label>
        <input
          type="range"
          min={24}
          max={96}
          value={sigSize}
          onChange={(e) => setSigSize(Number(e.target.value))}
          className="w-full mb-4 accent-[#22c55e]"
        />

        <div className="mb-6">
          {/* Add instruction paragraph above live preview */}
          <p className="mb-2 text-xs text-[#a7f3d0]">
            You can move your signature on the PDF using the keyboard arrow keys. Select the signature on the PDF preview and use the arrow keys to adjust its position.
          </p>
          <div className="text-sm text-[#a7f3d0] mb-1">Live Preview</div>
          <div
            className="border border-[#3f614c] rounded bg-[#1e3a24]/60 flex items-center justify-center h-20"
            style={{
              fontFamily: sigFont.fontFamily,
              fontWeight: sigFont.fontWeight,
              fontStyle: sigFont.fontStyle,
              fontSize: `${sigSize}px`,
              color: sigColor,
              minHeight: "60px",
              minWidth: "100%",
              overflow: "hidden",
              userSelect: "none",
              cursor: "pointer",
            }}
            onClick={() => setShowSignature(true)}
          >
            {sigText}
          </div>
        </div>

        <button
          className="w-full py-3 bg-gradient-to-r from-[#22c55e] to-[#14532d] text-white rounded-lg font-semibold shadow hover:from-[#16a34a] hover:to-[#14532d] transition"
          onClick={() => setShowSignature(true)}
        >
          Drag to PDF
        </button>

        {/* Download Button in Sidebar, only show after PDF upload */}
        {fileUrl && (
          <button
            className="w-full mt-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#14532d] text-white rounded-lg font-semibold shadow hover:from-[#16a34a] hover:to-[#14532d] transition"
            onClick={handleDownload}
          >
            Download Signed PDF
          </button>
        )}

        {/* DigiSeal Button at the end of sidebar */}
        <div className="relative w-full">
          <motion.button
            className={`w-full mt-4 py-3 rounded-lg font-semibold shadow transition
              ${showDigiSealPopup
                ? "bg-gray-400 text-white cursor-default"
                : "bg-gradient-to-r from-[#2563eb] to-[#059669] text-white hover:bg-gray-500 hover:from-gray-500 hover:to-gray-500"}
            `}
            onClick={() => setShowDigiSealPopup((prev) => !prev)}
            animate={{ scale: showDigiSealPopup ? 0.93 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 20, duration: 0.15 }}
          >
            DigiSeal
          </motion.button>
          <AnimatePresence>
            {showDigiSealPopup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -40 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.35 }}
                className="absolute z-50 w-[420px] max-w-[95vw] bg-white/95 border border-[#14532d] rounded-2xl shadow-2xl p-8 flex flex-col gap-5"
                style={{
                  left: 0,
                  top: "100%",
                  transform: "none",
                  marginTop: "16px"
                }}
              >
                <div className="text-[#14532d] font-bold text-2xl mb-2">Activate DigiSeal</div>
                <form className="w-full flex flex-col items-center gap-5">
                  <div className="w-[85%] flex flex-col gap-4">
                    {/* Seal Number */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sealNumber" className="text-[#1b2e23]/60 text-sm font-medium">Seal Number</label>
                      <div className="relative">
                        <input
                          id="sealNumber"
                          type="number"
                          value={sealNumber}
                          onChange={e => setSealNumber(e.target.value)}
                          placeholder="Enter seal number"
                          className="w-full h-12 px-4 pr-20 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                          min={10000}
                          max={999999}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#22c55e] text-white rounded text-xs font-semibold hover:bg-[#16a34a] transition"
                          onClick={() => setSealNumber(Math.floor(10000 + Math.random() * 900000))}
                          tabIndex={-1}
                          title="Generate random number"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="name" className="text-[#1b2e23]/60 text-sm font-medium">Name</label>
                      <input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="Enter your name"
                        className="w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                      />
                    </div>
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="email" className="text-[#1b2e23]/60 text-sm font-medium">Email</label>
                      <input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Enter your email"
                        className="w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                      />
                    </div>
                    {/* IP Address */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="ipAdress" className="text-[#1b2e23]/60 text-sm font-medium">IP Address</label>
                      <div className="relative">
                        <input
                          id="ipAdress"
                          type="text"
                          value={ipAddress}
                          readOnly
                          placeholder="Fetching IP..."
                          className="w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                        />
                      </div>
                    </div>
                    {/* Geo Location */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="geoLocation" className="text-[#1b2e23]/60 text-sm font-medium">Geo Location</label>
                      <div className="relative">
                        <input
                          id="geoLocation"
                          type="text"
                          value={geoLocation}
                          onChange={e => setGeoLocation(e.target.value)}
                          placeholder="Enter geo location (optional)"
                          className="w-full h-12 px-4 pr-28 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#22c55e] text-white rounded text-xs font-semibold hover:bg-[#16a34a] transition"
                          onClick={async () => {
                            if (!navigator.geolocation) return setGeoLocation("Unavailable");
                            navigator.geolocation.getCurrentPosition(
                              async (pos) => {
                                // Debug: Log coordinates to verify
                                console.log("Latitude:", pos.coords.latitude, "Longitude:", pos.coords.longitude);
                                const { latitude, longitude } = pos.coords;
                                try {
                                  // Use OpenStreetMap Nominatim reverse geocoding API (no API key required)
                                  const res = await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                                  );
                                  const data = await res.json();
                                  const address = data.address || {};
                                  const city =
                                    address.city ||
                                    address.town ||
                                    address.village ||
                                    address.hamlet ||
                                    address.county ||
                                    "";
                                  const state = address.state || "";
                                  setGeoLocation(
                                    [city, state].filter(Boolean).join(", ") || "Location unavailable"
                                  );
                                } catch {
                                  setGeoLocation("Unavailable");
                                }
                              },
                              (err) => {
                                // Debug: Log geolocation error
                                console.error("Geolocation error:", err);
                                setGeoLocation("Unavailable");
                              },
                              { enableHighAccuracy: true }
                            );
                          }}
                          tabIndex={-1}
                          title="Get my location"
                        >
                          Get Location
                        </button>
                      </div>
                    </div>
                    {/* Reason */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="reason" className="text-[#1b2e23]/60 text-sm font-medium">Reason</label>
                      <input
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        type="text"
                        placeholder="Enter reason"
                        className="w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 w-full mt-2">
                    <button
                      className={`py-2 px-4 rounded-lg font-semibold shadow transition
                        ${sealTagAttached ? "bg-red-500 text-white" : "bg-gradient-to-r from-[#059669] to-[#2563eb] text-white hover:bg-gray-500"}
                      `}
                      style={{ minWidth: 140 }}
                      type="button"
                      onClick={() => setSealTagAttached((prev) => !prev)}
                    >
                      {sealTagAttached ? "Cancel" : "Add Seal Number"}
                    </button>
                    <motion.button
                      className={`w-full py-2 rounded-lg font-semibold shadow transition
                        ${showDigiSealPopup
                          ? "bg-gray-400 text-white cursor-default"
                          : "bg-gradient-to-r from-[#2563eb] to-[#059669] text-white hover:bg-gray-500 hover:from-gray-500 hover:to-gray-500"}
                      `}
                      type="button"
                      onClick={handleDigiSeal}
                      disabled={!sealTagAttached}
                      animate={{ scale: showDigiSealPopup ? 0.93 : 1 }}
                      transition={{ type: "spring", stiffness: 600, damping: 20, duration: 0.15 }}
                    >
                      Activate DigiSeal
                    </motion.button>
                  </div>
                </form>
                {!sealTagAttached && (
                  <p className="text-xs text-red-600 mb-2 animate-pulse text-center">
                    First add seal, otherwise it won't activate.
                  </p>
                )}
                <div style={{ position: "relative", width: "100%" }}>
                  <motion.button
                    className={`w-full py-2 rounded-lg font-semibold shadow transition
                      bg-gradient-to-r from-[#2563eb] to-[#059669] text-white hover:bg-gray-500 hover:from-gray-500 hover:to-gray-500
                      ${!sealTagAttached ? "opacity-70" : ""}
                    `}
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      if (!sealTagAttached) return;
                      setLoading(true);
                      await new Promise(res => setTimeout(res, 2000)); // 2 sec loading
                      setLoading(false);
                      handleDigiSeal({ preventDefault: () => {} });
                    }}
                    animate={{ scale: showDigiSealPopup ? 0.93 : 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20, duration: 0.15 }}
                    style={{ cursor: !sealTagAttached ? "not-allowed" : "pointer", position: "relative" }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                        Activating...
                      </span>
                    ) : (
                      "Activate DigiSeal"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-xs text-[#a7f3d0] text-center">
          Signature font, color, size, and position will be used in the final PDF.
        </div>
      </aside>

      {/* PDF Preview Area */}
      <main className="flex-1 flex items-start justify-center py-12 px-2 relative overflow-auto z-10">
        <div
          ref={pdfContainerRef}
          className="relative rounded-2xl shadow-xl border border-[#14532d] w-[900px] h-[90vh] min-h-[800px] flex items-center justify-center overflow-hidden backdrop-blur-md"
          onClick={(e) => {
            if (fileUrl && !dragging) handlePdfClick(e);
          }}
          style={{ cursor: fileUrl ? "crosshair" : "default" }}
        >
          {fileUrl ? (
            <>
              <iframe
                src={fileUrl}
                title="PDF Preview"
                width="100%"
                height="100%"
                className="rounded-2xl bg-[#1e293b]/80"
                style={{ minHeight: "800px", minWidth: "900px", border: "none" }}
              />
              {showSignature && (
                <div
                  style={{
                    position: "absolute",
                    left: sigPosition.x,
                    top: sigPosition.y,
                    fontFamily: sigFont.fontFamily,
                    fontWeight: sigFont.fontWeight,
                    fontStyle: sigFont.fontStyle,
                    fontSize: `${sigSize}px`,
                    color: sigColor,
                    background: "transparent",
                    borderRadius: "8px",
                    padding: "4px 18px",
                    boxShadow: "0 2px 12px rgba(34,60,38,0.15)",
                    cursor: dragging ? "grabbing" : "grab",
                    userSelect: "none",
                    zIndex: 20,
                    border: dragging || showSignature ? "1.5px solid #22c55e" : "none",
                    minWidth: "120px",
                    minHeight: sealTagAttached ? "70px" : "48px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border 0.2s",
                    outline: "none"
                  }}
                  tabIndex={0} // Make focusable
                  onKeyDown={(e) => {
                    // Move signature with arrow keys
                    const step = e.shiftKey ? 10 : 2;
                    let { x, y } = sigPosition;
                    if (e.key === "ArrowLeft") {
                      x = Math.max(0, x - step);
                    } else if (e.key === "ArrowRight") {
                      x = Math.min(
                        (pdfContainerRef.current?.getBoundingClientRect().width || 900) - 120,
                        x + step
                      );
                    } else if (e.key === "ArrowUp") {
                      y = Math.max(0, y - step);
                    } else if (e.key === "ArrowDown") {
                      y = Math.min(
                        (pdfContainerRef.current?.getBoundingClientRect().height || 800) - 48,
                        y + step
                      );
                    } else {
                      return;
                    }
                    setSigPosition({ x, y });
                    e.preventDefault();
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                >
                  <span>{sigText}</span>
                  {sealTagAttached && (
                    <span style={{
                      fontFamily: "monospace",
                      fontSize: "5px",
                      color: "#059669",
                      background: "rgba(255,255,255,0.85)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      marginTop: "6px",
                      minWidth: "120px",
                      minHeight: "18px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #d1fae5",
                      boxShadow: "0 2px 8px rgba(34,60,38,0.10)",
                    }}>
                      <div style={{ fontWeight: "bold", letterSpacing: "1px" }}>{sealNumber}</div>
                      <div style={{ fontSize: "5px", color: "#2563eb", marginTop: "2px", textAlign: "center", lineHeight: "1.2" }}>
                        Digitally Signed using signkaro<br />
                        To verify visit signkaro
                      </div>
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-[#a7f3d0] text-xl font-semibold opacity-70 text-center w-full">
              Please select a PDF file to preview.
            </div>
          )}
        </div>
      </main>

      {showSealSuccess && (
        <div
          className="fixed top-8 left-1/2 -translate-x-1/2 bg-[#183c2bcc] text-[#d1fae5] px-6 py-3 rounded-xl shadow-lg text-base font-semibold z-[9999] backdrop-blur-sm transition-all"
          style={{ pointerEvents: "none", minWidth: 220, textAlign: "center" }}
        >
          DigiSeal has been activated!
        </div>
      )}

      {notification.show && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-base font-semibold z-[9999] backdrop-blur-sm transition-all
            ${notification.type === "error" ? "bg-red-600/80 text-white" : "bg-[#183c2bcc] text-[#d1fae5]"}`}
          style={{ pointerEvents: "none", minWidth: 220, textAlign: "center" }}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default PdfPreview;