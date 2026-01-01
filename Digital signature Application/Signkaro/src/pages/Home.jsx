import React, { useContext, useState } from 'react';
import { dataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PdfPreview from '../components/pdfPreview';
import bgImage from '../assets/signedpage1.jpg';
import { motion, AnimatePresence } from 'framer-motion';


const Home = () => {
  let { userData, setUserData, serverUrl } = useContext(dataContext);
  let navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const initiateLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await axios.post(serverUrl + '/api/logout', {}, { withCredentials: true });
      setUserData(null);
      navigate('/login');
    } catch (error) {
      console.log(error);
    } finally {
      setLogoutLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen relative overflow-hidden flex flex-col bg-cover bg-center "
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay for glass effect */}
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      {/* Top right buttons and profile container */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
        <button
          className="inline-flex items-center justify-center rounded-full bg-white text-[#22c55e] border border-[#22c55e] px-4 py-1.5 text-sm font-semibold shadow transition-colors duration-150 hover:bg-[#14532d] hover:text-[#a7f3d0] hover:border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2"
          onClick={() => navigate('/Validate')}
        >
          Validate Signature
        </button>
        <button
          onClick={initiateLogout}
          className="inline-flex items-center justify-center rounded-full bg-white text-[#14532d] border border-[#22c55e] px-4 py-1.5 text-sm font-semibold shadow transition-colors duration-150 hover:bg-[#1b2e23]/60 hover:text-white hover:border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2"
        >
          Log Out
        </button>
        {/* Profile Image */}
        <div className="w-[50px] h-[50px] rounded-full bg-[#3a7a51] border-2 border-white overflow-hidden shadow-lg ml-2">
          <img
            src={userData?.profileImage}
            alt={userData?.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* Logout button in top-right */}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1b2e23] border border-[#3f614c] rounded-2xl p-6 shadow-2xl w-full max-w-sm flex flex-col items-center text-center gap-4"
            >
              <h3 className="text-[#d1fae5] text-xl font-bold">Confirm Logout</h3>
              <p className="text-[#a7f3d0]">Are you sure you want to log out?</p>
              <div className="flex gap-4 w-full mt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 rounded-md border border-[#3f614c] text-[#d1fae5] hover:bg-[#3f614c] transition font-semibold"
                  disabled={logoutLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2 rounded-md bg-gradient-to-r from-[#22c55e] to-[#14532d] text-white font-semibold hover:from-[#16a34a] hover:to-[#14532d] transition flex items-center justify-center"
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Logout"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 pt-20">
        <div className="w-full h-full flex justify-center">
          <PdfPreview />
        </div>
      </div>
    </div>
  );
};

export default Home;
