import React, { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div
      className="flex gap-5 border boredr-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30"
      style={{
        background: "linear-gradient(90deg, rgb(255, 224, 178) 0%, rgb(255, 204, 128) 50%, rgb(255, 183, 77) 100%)",
      }}
    >
      <button
        className="block lg:hidden text-black"
        onClick={() => {
          setOpenSideMenu(!openSideMenu);
        }}
      >
        {openSideMenu ? (
          <HiOutlineX className="text-2xl" />
        ) : (
          <HiOutlineMenu className="text-2xl" />
        )}
      </button>

      <h2 className="mt-6 mb-2 tracking-tight">
        <span
          className="block text-4xl font-extrabold"
          style={{ color: "#FF6F00", letterSpacing: "2px", fontFamily: "Montserrat, sans-serif" }}
        >
          DhanPath
        </span>
        <span
          className="block text-base font-light text-gray-600 mt-1"
          style={{ fontFamily: "Roboto, sans-serif", letterSpacing: "1px" }}
        >
          Your Path Towards Financial Growth
        </span>
      </h2>

      {openSideMenu && (
        <div className="fixed top-[61px] -ml-4 bg-white">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
