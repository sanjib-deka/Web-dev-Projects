import React, { useState } from "react";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotification(`Link sent to your email: ${email}`);
    setEmail("");
    setTimeout(() => setNotification(""), 2500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#d1fae5] to-[#14532d] relative">
      <div className="bg-white/90 border border-[#14532d] rounded-2xl shadow-2xl px-8 py-10 w-[350px] max-w-[95vw] flex flex-col gap-6 items-center backdrop-blur-md">
        <div className="text-[#14532d] font-bold text-2xl mb-2 text-center">
          Forgot Password
        </div>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition"
            required
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg font-semibold shadow bg-gradient-to-r from-[#2563eb] to-[#059669] text-white hover:bg-gray-500 hover:from-gray-500 hover:to-gray-500 transition"
          >
            Send Reset Link
          </button>
        </form>
        {notification && (
          <div className="text-center text-[#14532d] mt-2 bg-[#d1fae5]/70 rounded p-2 w-full font-semibold">
            {notification}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;