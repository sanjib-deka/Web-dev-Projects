import React, { useContext, useState, useRef } from 'react'
import dp from '../assets/dp.webp'
import { dataContext } from '../context/UserContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import bgImage from '../assets/signedpage1.jpg' // <-- Add this line

const SignUp = () => {
  let { serverUrl, setUserData, getUserData, userData } = useContext(dataContext)
  const navigate = useNavigate()

  const [name, setname] = useState('')
  const [email, setemail] = useState('')
  const [password, setpassword] = useState('')
  const [frontendImage, setfrontendImage] = useState(dp)
  const [backendImage, setbackendImage] = useState(dp)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const file = useRef(null)

  function handleImage(e) {
    let file = e.target.files[0]
    if (!file) return
    setbackendImage(file)
    setfrontendImage(URL.createObjectURL(file))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let formdata = new FormData()
      formdata.append('name', name)
      formdata.append('email', email)
      formdata.append('password', password)
      if (backendImage) formdata.append('profileImage', backendImage)

      const { data } = await axios.post(
        serverUrl + "/api/signup",
        formdata,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      )
      await getUserData()
      setUserData(data.user)
      navigate('/home')
    } catch (error) {
      console.error("Error during signup:", error)
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message)
      }
    } finally {
      setLoading(false)
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
      <div className='flex justify-center items-center pt-28 pb-10 relative z-10'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className='w-[95%] max-w-[500px] bg-[#1b2e23]/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-md flex flex-col items-center gap-6'
        >
          <h1 className='text-[#d1fae5] text-[1.75rem] font-bold'>Register your account here</h1>
          <form className='w-full flex flex-col items-center gap-5' onSubmit={handleSignup}>
            <input type="file" accept="image/*" className='hidden' ref={file} onChange={handleImage} />
            <div className='w-[110px] h-[110px] rounded-full bg-[#3a7a51] mb-2 overflow-hidden relative border-2 border-white'>
              <img src={frontendImage} alt="" className='w-[100%] h-[100%] rounded-full object-cover' />
              <div
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#14532d] border-2 border-white text-white text-center text-[22px] font-bold cursor-pointer flex items-center justify-center hover:bg-[#1e9e3c] transition"
                onClick={() => file.current.click()}
              >
                +
              </div>
            </div>

            <div className='w-[85%] flex flex-col gap-4'>
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-[#a7f3d0] text-sm font-medium">Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  type="text"
                  placeholder='Enter your full name'
                  className='w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition'
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[#a7f3d0] text-sm font-medium">Email</label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  type="email"
                  placeholder='Enter your email'
                  className='w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition'
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-[#a7f3d0] text-sm font-medium">Password</label>
                <div className="relative w-full">
                  <input
                    id="password"
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder='Enter your password'
                    className='w-full h-12 px-4 rounded bg-[#183c2b] text-[#d1fae5] placeholder-[#a7f3d0] border border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#22c55e] transition pr-12'
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a7f3d0] focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // Eye open icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    ) : (
                      // Eye closed icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.97 10.97 0 0112 19c-7 0-11-7-11-7a21.77 21.77 0 015.06-6.06M1 1l22 22" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.53 9.53A3.001 3.001 0 0012 15a3 3 0 002.47-5.47" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-36 h-11 mt-2 rounded-md bg-gradient-to-r from-[#22c55e] to-[#14532d] text-white font-semibold shadow-lg hover:from-[#16a34a] hover:to-[#14532d] transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <p className='text-[#a7f3d0] text-sm'>
            Already have an account?{' '}
            <span
              className='text-[#22c55e] font-medium hover:underline cursor-pointer'
              onClick={() => navigate('/login')}
            >
              Login here
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SignUp
