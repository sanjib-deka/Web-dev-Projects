import React, { useContext, useState } from 'react'
import { dataContext } from '../context/UserContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import bgImage from '../assets/signedpage1.jpg' // <-- Add this line

const Login = () => {
  let { serverUrl, setUserData, getUserData , userData } = useContext(dataContext)
  let navigate = useNavigate()

  let [email, setemail] = useState('')
  let [password, setpassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      let { data } = await axios.post(
        serverUrl + "/api/login",
        { email, password },
        { withCredentials: true }
      )
      setUserData(data.user)
      await getUserData()
      console.log(data)
      // Capitalize first letter of name for navigation check
      if (data.user && data.user.name) {
        navigate("/home")
      }
    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.data.message)
        alert(error.response.data.message)
      }
    }
  }

  return (
    <div
      className='w-full min-h-screen bg-white relative overflow-hidden'
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
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
      {/* Centered Box */}
      <div className='flex justify-center items-center pt-40 pb-10 relative z-10'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className='w-[95%] max-w-[450px] bg-[#1b2e23]/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-md flex flex-col items-center gap-6'
        >
          <h1 className='text-[#d1fae5] text-[1.75rem] font-bold'>Login to Your Account</h1>
          <form className='w-full flex flex-col items-center gap-4' onSubmit={handleLogin}>
            <div className='w-[85%] flex flex-col gap-4'>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[#a7f3d0] text-sm font-semibold">Email</label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  type="email"
                  placeholder='Enter your email'
                  className='w-full h-12 px-4 rounded-md bg-[#1e3a24] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#3f614c] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition-all duration-150'
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-[#a7f3d0] text-sm font-semibold">Password</label>
                <div className="relative w-full">
                  <input
                    id="password"
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder='Enter your password'
                    className='w-full h-12 px-4 rounded-md bg-[#1e3a24] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#3f614c] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition-all duration-150 pr-12'
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a7f3d0] focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // Eye open icon (Material Design)
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    ) : (
                      // Eye closed icon (Material Design)
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.97 10.97 0 0112 19c-7 0-11-7-11-7a21.77 21.77 0 015.06-6.06M1 1l22 22" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.53 9.53A3.001 3.001 0 0012 15a3 3 0 002.47-5.47" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className='w-full h-11 rounded-md bg-gradient-to-r from-[#22c55e] to-[#14532d] text-white font-semibold shadow-md hover:from-[#16a34a] hover:to-[#14532d] transition-all duration-200'
              >
                Login
              </button>
              {/* Add this just below the Login button */}
              <div className="w-full text-right mt-1">
                <span
                  className="text-xs text-[#a7f3d0] hover:underline cursor-pointer select-none"
                  onClick={() => navigate('/forget-password')}
                >
                  Forgot password
                </span>
              </div>
            </div>
          </form>
          <p className='text-[#a7f3d0] text-sm'>
            Don&apos;t have an account?{' '}
            <span
              className='text-[#34d399] font-medium hover:underline cursor-pointer'
              onClick={() => navigate('/signup')}
            >
              Register here
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
