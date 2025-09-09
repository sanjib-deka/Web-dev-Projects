import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import bgImage from '../assets/signedpage1.jpg'

const StartPage = () => {
  const navigate = useNavigate()

  return (
    <div
      className='w-full min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden'
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Logo */}
      <div className='absolute top-6 left-6 text-[#000000] text-3xl font-bold italic tracking-wide z-10'>
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Sign<span className="text-[#22c55e]">Karo</span>
        </motion.span>
      </div>

      {/* Animated Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className='text-4xl md:text-5xl lg:text-6xl text-center font-bold text-[#105330] mb-6 z-10'
      >
        Digitally Sign Any Document
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className='text-lg md:text-xl text-[#143224] text-center max-w-2xl mb-10 z-10'
      >
        SignKaro is your one-stop solution to securely sign and share your digital documents.
      </motion.p>

      {/* Get Started Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/login')}
        className='px-8 py-3 rounded-md bg-gradient-to-r from-[#22462f] to-[#033d1a] text-white font-semibold text-lg shadow-lg hover:from-[#29593b] hover:to-[#14532d] transition-all duration-200 z-10 relative'
        style={{ zIndex: 11 }}
      >
        Get Started
      </motion.button>

      {/* Signature Animation */}

    </div>
  )
}

export default StartPage


