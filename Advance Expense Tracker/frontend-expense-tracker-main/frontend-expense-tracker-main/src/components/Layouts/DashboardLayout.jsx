import React, { useContext } from "react";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";
import { UserContext } from "../../context/UserContext";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  return (
    <div className="">
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div
          className="flex"
          style={{
            background: "linear-gradient(120deg, rgb(255, 244, 224) 0%, rgb(255, 224, 178) 60%, rgb(255, 236, 209) 100%)",
          }}
        >
          <div className="max-[1080px]:hidden ">
            <SideMenu activeMenu={activeMenu} />
          </div>


          <div
            className="grow mx-5"
            style={{
              background: "linear-gradient(120deg, rgb(255, 249, 235) 0%, rgb(255, 236, 209) 60%, rgb(255, 224, 178) 100%)",
              minHeight: "100vh",
              borderRadius: "18px",
            }}
          >
            {children}
          </div>

        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
