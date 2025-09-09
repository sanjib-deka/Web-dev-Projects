'use client'
import React from "react";

const ContactForm = () => {
  return (
    <section className="-mt-6 "> {/* 👈 this moves everything slightly upward */}
      <h2 className="text-2xl font-bold mb-5 text-black">Contact Me</h2>

      <div className="space-y-4">
        {/* LinkedIn */}
              <button
        onClick={() => window.open("https://www.linkedin.com/in/sanjib-kumar-deka/", "_blank")}
        className="w-full px-4 py-2 text-sm font-semibold text-gray-800 bg-white/10 border border-gray-500 rounded shadow-md backdrop-blur-md
                  hover:bg-gray-700 hover:text-white transition duration-300 relative overflow-hidden group"
      >
        <span className="z-10 relative">LinkedIn</span>
        <span className="absolute inset-0 rounded bg-gradient-to-r from-black via-gray-400 to-black opacity-20 blur-lg animate-pulse 
                        group-hover:opacity-40 group-hover:blur-xl transition-all duration-500 ease-in-out"></span>
      </button>


        {/* Email */}
                <button
          onClick={() => window.open("mailto:sanjibkumardeka14@gmail.com")}
          className="w-full px-4 py-2 text-sm font-semibold text-gray-800 bg-white/10 border border-gray-500 rounded shadow-md backdrop-blur-md
                    hover:bg-gray-700 hover:text-white transition duration-300 relative overflow-hidden group"
        >
          <span className="z-10 relative">sanjibkumardeka14@gmail.com</span>
          <span className="absolute inset-0 rounded bg-gradient-to-r from-black via-gray-400 to-black opacity-20 blur-lg animate-pulse 
                          group-hover:opacity-40 group-hover:blur-xl transition-all duration-500 ease-in-out"></span>
        </button>

      </div>
    </section>
  );
};

export default ContactForm;
