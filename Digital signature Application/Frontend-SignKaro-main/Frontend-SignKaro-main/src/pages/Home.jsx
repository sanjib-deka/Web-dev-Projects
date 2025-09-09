import React, { useContext } from 'react';
import { dataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PdfPreview from '../components/pdfPreview';
import bgImage from '../assets/signedpage1.jpg'; // Use the same image as Login.jsx


const Home = () => {
  let { userData, setUserData, serverUrl } = useContext(dataContext);
  let navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(serverUrl + '/api/logout', {}, { withCredentials: true });
      setUserData(null);
      navigate('/login');
    } catch (error) {
      console.log(error);
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

      {/* Profile image and name in top-left */}
      <div className="absolute top-6 left-6 flex flex-col items-center gap-2 z-20">
        <div className="w-[60px] h-[60px] rounded-full bg-[#3a7a51] border-2 border-white overflow-hidden shadow-lg">
          <img
            src={userData.profileImage}
            alt={userData.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <span className="text-[#0f4329d4] text-xl font-semibold drop-shadow">
          {userData.name
            ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1)
            : ''}
        </span>
      </div>

      {/* Logout button in top-right */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 inline-flex items-center justify-center rounded-full bg-white text-[#14532d] border border-[#22c55e] px-4 py-1.5 text-sm font-semibold shadow transition-colors duration-150 hover:bg-[#1b2e23]/60 hover:text-white hover:border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 z-20"
        style={{ zIndex: 20 }}
      >
        Log Out
      </button>
      <button
        className="absolute top-20 right-6 inline-flex items-center justify-center rounded-full bg-white text-[#22c55e] border border-[#22c55e] px-4 py-1.5 text-sm font-semibold shadow transition-colors duration-150 hover:bg-[#14532d] hover:text-[#a7f3d0] hover:border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 z-20"
        style={{ zIndex: 20 }}
        onClick={() => navigate('/Validate')}
      >
        Validate Signature
      </button>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10 gap-6 w-full relative z-10">
        <div className="mt-40 w-full flex justify-center">
          <PdfPreview />
        </div>
      </div>
    </div>
  );
};

export default Home;
