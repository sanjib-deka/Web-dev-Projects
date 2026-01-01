import React, { useState, useRef, useEffect, useContext } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();
import { dataContext } from "../context/UserContext";
import axios from "axios";

// Update this path to match your actual image location
const BG_IMAGE = "/forest-bg.jpg";

// Define fonts - mixing standard and custom handwriting fonts
const FONT_OPTIONS = [
  // Handwriting / Signature Fonts
  { name: "Great Vibes", type: "custom", url: "/fonts/GreatVibes-Regular.ttf", fontFamily: "'Great Vibes', cursive" },
  { name: "Sacramento", type: "custom", url: "/fonts/Sacramento-Regular.ttf", fontFamily: "'Sacramento', cursive" },
  { name: "Allura", type: "custom", url: "/fonts/Allura-Regular.ttf", fontFamily: "'Allura', cursive" },

  // Standard Fonts
  { name: "Helvetica", type: "standard", font: StandardFonts.Helvetica, fontFamily: "Helvetica, Arial, sans-serif" },
  { name: "Helvetica-Oblique", type: "standard", font: StandardFonts.HelveticaOblique, fontFamily: "Helvetica, Arial, sans-serif", fontStyle: "italic" },
  { name: "TimesRoman-Italic", type: "standard", font: StandardFonts.TimesRomanItalic, fontFamily: "Times New Roman, Times, serif", fontStyle: "italic" },
  { name: "Courier-Oblique", type: "standard", font: StandardFonts.CourierOblique, fontFamily: "Courier New, Courier, monospace", fontStyle: "italic" },
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
  const sigRef = useRef(null);

  const [activeDrag, setActiveDrag] = useState(null); // 'signature' | 'seal' | null
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [showSealSuccess, setShowSealSuccess] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" }); // type: "success" | "error"
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // Current viewed page
  const [sigPage, setSigPage] = useState(1); // Page where signature is placed
  const [pageContainerRef, setPageContainerRef] = useState(null); // Ref for the actual PDF page container

  // Load custom fonts styles for preview
  useEffect(() => {
    const styleId = 'custom-fonts-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
            @font-face { font-family: 'Great Vibes'; src: url('/fonts/GreatVibes-Regular.ttf'); }
            @font-face { font-family: 'Sacramento'; src: url('/fonts/Sacramento-Regular.ttf'); }
            @font-face { font-family: 'Allura'; src: url('/fonts/Allura-Regular.ttf'); }
        `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (showKeyboardHint && sigRef.current) {
      sigRef.current.focus();
    }
  }, [showKeyboardHint]);

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
    const container = pageContainerRef || pdfContainerRef.current;
    if (!container) return;

    setActiveDrag('signature');
    setDragging(true);
    const rect = container.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - sigPosition.x,
      y: e.clientY - rect.top - sigPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (activeDrag !== 'signature' || !dragging) return;
    const container = pageContainerRef || pdfContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
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
    if (dragging && activeDrag === "signature") {
      setSigPage(pageNumber)
    }
    setDragging(false);
    setActiveDrag(null);
  };

  // Set signature position by clicking on PDF area
  const handlePdfClick = (e) => {
    const container = pageContainerRef || pdfContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSigPosition({ x: x - 60, y: y - 24 }); // Center the signature
    setSigPage(pageNumber); // Assign signature to current page

    if (!showSignature) {
      setShowKeyboardHint(true);
      setTimeout(() => setShowKeyboardHint(false), 5000);
    }
    setShowSignature(true);
  };

  // Download signed PDF using pdf-lib
  const handleDownload = async () => {
    if (!pdfFile) return;

    // Load the existing PDF
    const existingPdfBytes = await fetch(fileUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Register fontkit to support custom fonts
    pdfDoc.registerFontkit(fontkit);

    // Get the specific page where signature is placed
    const pages = pdfDoc.getPages();
    const pageIndex = sigPage - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) {
      console.error("Invalid signature page index");
      // Fallback logic could go here
    }
    const page = pages[Math.max(0, pageIndex)];

    const pdfWidth = page.getWidth();
    const pdfHeight = page.getHeight();

    const container = pageContainerRef || pdfContainerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Calculate scaling between preview and PDF
    const scaleX = pdfWidth / containerRect.width;
    const scaleY = pdfHeight / containerRect.height;

    // Map signature position from preview to PDF coordinates
    const pdfX = sigPosition.x * scaleX;
    const pdfY = pdfHeight - ((sigPosition.y + sigSize) * scaleY);

    // Embed the selected font
    let embeddedFont;
    try {
      if (sigFont.type === "custom") {
        const fontBytes = await fetch(sigFont.url).then((res) => res.arrayBuffer());
        embeddedFont = await pdfDoc.embedFont(fontBytes);
      } else {
        embeddedFont = await pdfDoc.embedFont(sigFont.font);
      }
    } catch (e) {
      console.error("Font embedding failed:", e);
      embeddedFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
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
      size: sigSize * scaleX,
      font: embeddedFont,
      color: rgb(color.r, color.g, color.b),
    });

    // Add this block to also draw the DigiSeal tag if attached
    if (sealTagAttached) {
      // Calculate the seal tag Y position just below the signature
      const sealTagHeight = 18 * scaleY;
      const pdfSealX = pdfX;
      const pdfSealY = pdfY - sealTagHeight - 4 * scaleY; // 4px gap

      const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
      const courier = await pdfDoc.embedFont(StandardFonts.Courier);

      // Draw the seal number
      page.drawText(String(sealNumber), {
        x: pdfSealX,
        y: pdfSealY + 10 * scaleY,
        size: 8 * scaleX,
        font: courierBold,
        color: rgb(0.02, 0.59, 0.41), // #059669
      });

      // Draw the message
      page.drawText("Digitally Signed using signkaro\nTo verify visit signkaro", {
        x: pdfSealX,
        y: pdfSealY,
        size: 5 * scaleX,
        font: courier,
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

  return (
    <div className="flex h-full w-full relative">
      {/* Overlay for glass effect */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Sidebar */}
      <aside className="w-[300px] bg-[#1a2e22]/95 border-r border-[#14532d] shadow-lg flex flex-col px-4 py-6 overflow-y-auto h-full backdrop-blur-md z-20 flex-shrink-0 custom-scrollbar">
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
          className="mb-6 block w-full text-xs text-white file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#22c55e] file:text-white hover:file:bg-[#16a34a] cursor-pointer"
        />

        <label className="block mb-2 text-sm font-medium text-[#a7f3d0]">
          Type your name
        </label>
        <input
          type="text"
          value={sigText}
          onChange={(e) => {
            setSigText(e.target.value);
            if (!showSignature) {
              setSigPage(pageNumber);
              setShowSignature(true);
            }
          }}
          className="w-full mb-4 px-3 py-2 border border-[#3f614c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] bg-[#18281e] text-[#d1fae5] placeholder-[#5c8d73] text-sm"
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
              className={`px-3 py-1 rounded border ${sigFont.name === font.name
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
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${sigColor === color.value
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
          <div className="text-xs text-[#a7f3d0] mb-1">Live Preview</div>
          <div
            className="border border-[#3f614c] rounded-lg bg-[#0f1512] flex items-center justify-center h-16"
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
            onClick={() => {
              setSigPage(pageNumber);
              setShowSignature(true);
            }}
          >
            {sigText}
          </div>
        </div>

        <button
          className="w-full py-3 bg-gradient-to-r from-[#22c55e] to-[#14532d] text-white rounded-lg font-semibold shadow hover:from-[#16a34a] hover:to-[#14532d] transition"
          onClick={() => {
            setSigPage(pageNumber);
            if (!showSignature) {
              setShowKeyboardHint(true);
              setTimeout(() => setShowKeyboardHint(false), 5000);
            }
            setShowSignature(true);
          }}
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
        </div>

        {/* DigiSeal Modal - Moved outside the relative container to be fixed */}
        <AnimatePresence>
          {showDigiSealPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.35 }}
                className="bg-[#d1fae5] border-2 border-[#14532d] rounded-2xl shadow-2xl p-6 flex flex-col gap-4 w-full max-w-[400px] overflow-y-auto max-h-[90vh] custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[#14532d] font-bold text-2xl">Activate DigiSeal</div>
                  <button
                    onClick={() => setShowDigiSealPopup(false)}
                    className="text-[#14532d] hover:bg-[#a7f3d0] p-1 rounded-full transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form className="w-full flex flex-col gap-4">
                  {/* Seal Number */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sealNumber" className="text-[#14532d] text-sm font-bold">Seal Number</label>
                    <div className="relative">
                      <input
                        id="sealNumber"
                        type="number"
                        value={sealNumber}
                        onChange={e => setSealNumber(e.target.value)}
                        placeholder="Enter seal number"
                        className="w-full h-10 px-3 pr-20 rounded bg-[#064e3b] text-[#d1fae5] placeholder-[#6ee7b7] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                        min={10000}
                        max={999999}
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#22c55e] text-white rounded text-xs font-semibold hover:bg-[#16a34a] transition"
                        onClick={() => setSealNumber(Math.floor(10000 + Math.random() * 900000))}
                        tabIndex={-1}
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-[#14532d] text-sm font-bold">Name</label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Enter your name"
                      className="w-full h-10 px-3 rounded bg-[#064e3b] text-[#d1fae5] placeholder-[#6ee7b7] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                    />
                  </div>
                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-[#14532d] text-sm font-bold">Email</label>
                    <input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Enter your email"
                      className="w-full h-10 px-3 rounded bg-[#064e3b] text-[#d1fae5] placeholder-[#6ee7b7] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                    />
                  </div>
                  {/* IP Address */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ipAdress" className="text-[#14532d] text-sm font-bold">IP Address</label>
                    <input
                      id="ipAdress"
                      type="text"
                      value={ipAddress}
                      readOnly
                      placeholder="Fetching IP..."
                      className="w-full h-10 px-3 rounded bg-[#064e3b] text-[#d1fae5] placeholder-[#6ee7b7] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                    />
                  </div>
                  {/* Geo Location */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="geoLocation" className="text-[#14532d] text-sm font-bold">Geo Location</label>
                    <div className="relative">
                      <input
                        id="geoLocation"
                        type="text"
                        value={geoLocation}
                        onChange={e => setGeoLocation(e.target.value)}
                        placeholder="Enter geo location"
                        className="w-full h-10 px-3 pr-24 rounded bg-[#064e3b] text-[#d1fae5] placeholder-[#6ee7b7] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#22c55e] text-white rounded text-xs font-semibold hover:bg-[#16a34a] transition"
                        onClick={async () => {
                          if (!navigator.geolocation) return setGeoLocation("Unavailable");
                          navigator.geolocation.getCurrentPosition(
                            async (pos) => {
                              const { latitude, longitude } = pos.coords;
                              try {
                                const res = await fetch(
                                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                                );
                                const data = await res.json();
                                const address = data.address || {};
                                const city = address.city || address.town || address.county || "";
                                const state = address.state || "";
                                setGeoLocation([city, state].filter(Boolean).join(", ") || "Location unavailable");
                              } catch {
                                setGeoLocation("Unavailable");
                              }
                            },
                            () => setGeoLocation("Unavailable"),
                            { enableHighAccuracy: true }
                          );
                        }}
                      >
                        Get Location
                      </button>
                    </div>
                  </div>
                  {/* Reason */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="reason" className="text-[#14532d] text-sm font-bold">Reason</label>
                    <input
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      type="text"
                      placeholder="Enter reason"
                      className="w-full h-10 px-3 rounded bg-[#064e3b] text-[#d1fae5] placeholder-[#6ee7b7] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
                    />
                  </div>

                  <div className="flex gap-3 w-full mt-2">
                    <button
                      className={`flex-1 py-2 px-3 rounded-lg font-bold shadow transition text-sm
                        ${sealTagAttached ? "bg-red-500 text-white" : "bg-gradient-to-r from-[#059669] to-[#2563eb] text-white hover:bg-gray-500"}
                      `}
                      type="button"
                      onClick={() => setSealTagAttached((prev) => !prev)}
                    >
                      {sealTagAttached ? "Cancel Seal" : "Add Seal Number"}
                    </button>
                    {!sealTagAttached && (
                      <div className="absolute bottom-16 left-0 w-full text-center pointer-events-none">
                        <p className="text-[10px] text-red-600 animate-pulse font-bold bg-white/80 inline-block px-2 rounded">
                          First add seal to enable activation
                        </p>
                      </div>
                    )}
                    <motion.button
                      className={`flex-1 py-2 rounded-lg font-bold shadow transition text-sm relative
                        bg-gradient-to-r from-[#2563eb] to-[#059669] text-white hover:opacity-90
                        ${!sealTagAttached ? "opacity-60 cursor-not-allowed" : ""}
                      `}
                      type="button"
                      onClick={handleDigiSeal}
                      disabled={!sealTagAttached}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Wait...
                        </span>
                      ) : (
                        "Activate"
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-xs text-[#a7f3d0] text-center">
          Signature font, color, size, and position will be used in the final PDF.
        </div>
      </aside>

      {/* PDF Preview Area */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-transparent">
        <div
          ref={pdfContainerRef}
          className="relative rounded-lg shadow-2xl border border-[#14532d] w-full max-w-[800px] h-[85vh] flex justify-center overflow-auto bg-black/20 backdrop-blur-sm custom-scrollbar"
          style={{ cursor: fileUrl ? "default" : "default" }}
        >
          {fileUrl ? (
            <div className="relative w-fit h-fit shadow-2xl flex flex-col items-center gap-4">
              <Document
                file={fileUrl}
                onLoadSuccess={({ numPages }) => {
                  setNumPages(numPages);
                  setPageNumber(1);
                  setSigPage(1);
                }}
                className="flex justify-center"
              >
                <div
                  ref={(el) => setPageContainerRef(el)}
                  className="relative transition-transform duration-200"
                  onMouseDown={(e) => {
                    // Allow clicking on the page to place signature if not dragging
                    if (!dragging && e.target.closest('.react-pdf__Page')) {
                      handlePdfClick(e);
                    }
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={750} // Fixed width or dynamic based on container
                  />

                  {/* Signature Overlay - Only show if on the correct page */}
                  {showSignature && sigPage === pageNumber && (
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
                        outline: "none",
                        // Prevent inheriting transform from parents if any
                        transform: "none"
                      }}
                      ref={sigRef}
                      tabIndex={0} // Make focusable
                      onKeyDown={(e) => {
                        // Move signature with arrow keys
                        const step = e.shiftKey ? 10 : 2;
                        let { x, y } = sigPosition;
                        const container = pageContainerRef;
                        const width = container ? container.getBoundingClientRect().width : 750;
                        const height = container ? container.getBoundingClientRect().height : 1000;

                        if (e.key === "ArrowLeft") {
                          x = Math.max(0, x - step);
                        } else if (e.key === "ArrowRight") {
                          x = Math.min(width - 120, x + step);
                        } else if (e.key === "ArrowUp") {
                          y = Math.max(0, y - step);
                        } else if (e.key === "ArrowDown") {
                          y = Math.min(height - 48, y + step);
                        } else {
                          return;
                        }
                        setSigPosition({ x, y });
                        e.preventDefault();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation(); // Prevent triggering page click
                        handleMouseDown(e);
                      }}
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
                </div>
              </Document>

              {/* Page Thumbnails (Left Side of Preview) */}
              {numPages && numPages > 1 && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar bg-[#1a2e22]/90 p-2 rounded-xl backdrop-blur-sm border border-[#14532d] z-40">
                  {Array.from(new Array(numPages), (el, index) => (
                    <div
                      key={`page_${index + 1}`}
                      className={`relative cursor-pointer transition-all duration-200 ${pageNumber === index + 1 ? 'ring-2 ring-[#22c55e] scale-105' : 'opacity-70 hover:opacity-100'}`}
                      onClick={() => setPageNumber(index + 1)}
                    >
                      <div className="w-16 h-20 bg-white rounded overflow-hidden flex items-center justify-center text-black text-xs font-bold">
                        {/* Simple representation or actual mini Page if performance allows. Using simple span for now to avoid multiple canvas renders */}
                        <span className="text-[#1a2e22]">Pg {index + 1}</span>
                      </div>
                      {/* Show indicator if this page has the signature */}
                      {sigPage === index + 1 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#22c55e] rounded-full border border-white"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Page Navigation Controls */}
              {numPages && numPages > 1 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a2e22] border border-[#14532d] rounded-full px-4 py-2 flex items-center gap-4 shadow-xl z-50">
                  <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                    className="text-white hover:text-[#22c55e] disabled:opacity-30 disabled:hover:text-white transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-[#d1fae5] text-sm font-semibold min-w-[60px] text-center">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                    className="text-white hover:text-[#22c55e] disabled:opacity-30 disabled:hover:text-white transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-[#a7f3d0] text-xl font-semibold opacity-70 text-center w-full">
                Please select a PDF file to preview.
              </div>
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

      {/* Keyboard Hint Popup */}
      <AnimatePresence>
        {showKeyboardHint && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#22c55e] text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3 z-[100] border-2 border-[#14532d]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Please shift or move the signature using the keyboard arrow keys.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PdfPreview;