import React, { useContext, useState } from "react";
import bgImage from "../assets/signedpage1.jpg";
import { dataContext } from "../context/UserContext";
import axios from "axios";
import { motion } from "framer-motion"; // Add this import if not already

const ValidateSeal = () => {
  const [sealNumber, setSealNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { serverUrl } = useContext(dataContext);

  const handleSealData = async (sealNumber) => {
    try {
      let { data } = await axios.post(
        serverUrl + "/api/verifySeal",
        { sealNumber },
        { withCredentials: true }
      );
      setResult({
        success: true,
        message: data.message,
        seal: data.seal,
      });
    } catch (error) {
      if (error.response) {
        setResult({
          success: false,
          message: error.response.data.message,
        });
      } else {
        setResult({
          success: false,
          message: "Network error, please try again later.",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    await handleSealData(sealNumber);
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Logo */}
      <div className='absolute top-6 left-6 text-[#14532d] text-3xl font-bold italic tracking-wide z-10'>
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Sign<span className="text-[#22c55e]">Karo</span>
        </motion.span>
      </div>

      {/* Overlay for glass effect */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="w-full flex justify-center pt-20 z-10 relative">
        <div className="bg-white/90 border border-[#14532d] rounded-2xl shadow-2xl px-12 py-12 w-[520px] max-w-[98vw] flex flex-col gap-8 items-center backdrop-blur-md">
          <div className="text-[#14532d] font-bold text-2xl mb-2 text-center">
            Validate DigiSeal
          </div>
          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            <input
              type="number"
              value={sealNumber}
              onChange={(e) => setSealNumber(e.target.value)}
              placeholder="Enter seal number"
              className="w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
              min={10000}
              max={999999}
              required
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg font-semibold shadow bg-gradient-to-r from-[#2563eb] to-[#059669] text-white hover:bg-gray-500 hover:from-gray-500 hover:to-gray-500 transition flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Validating...
                </span>
              ) : (
                "Validate"
              )}
            </button>
          </form>
          {result && (
            <div
              className={`mt-4 w-full rounded p-5 ${
                result.success
                  ? "bg-[#d1fae5]/80 text-[#14532d]"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {result.success ? (
                <div>
                  <div className="font-bold text-2xl mb-4 text-[#059669] text-center">
                    {result.message}
                  </div>
                  <div className="flex flex-col gap-4 text-xl">
                    <div>
                      <span className="font-semibold">Seal Number:</span>{" "}
                      <span className="text-2xl">{result.seal.sealNumber}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Name:</span>{" "}
                      <span className="text-2xl">{result.seal.name}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Email:</span>{" "}
                      <span className="text-2xl">{result.seal.email}</span>
                    </div>
                    <div>
                      <span className="font-semibold">IP Address:</span>{" "}
                      <span className="text-2xl">{result.seal.ipAdress}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Geo Location:</span>{" "}
                      <span className="text-2xl">{result.seal.geoLocation}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Reason:</span>{" "}
                      <span className="text-2xl">{result.seal.reason}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Date:</span>{" "}
                      <span className="text-2xl">
                        {result.seal.createdAt &&
                          new Date(result.seal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Time:</span>{" "}
                      <span className="text-2xl">{result.seal.time}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="font-semibold text-lg text-center">{result.message}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidateSeal;