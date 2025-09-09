import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Home from './pages/Home'
import StartPage from './pages/startPage' // ✅ Add this line
import ValidateSeal from './pages/validateSeal';
import ForgetPassword from './pages/forgetPassword';
import { dataContext } from './context/UserContext'

const App = () => {
  let { userData, setUserData } = useContext(dataContext)

  return (
    <Routes>
      {/*  Default landing page route */}
      <Route path='/' element={<StartPage />} />

      <Route path='/signup' element={<SignUp />} />
      <Route path='/login' element={<Login />} />
      <Route path='/home' element={userData ? <Home /> :<Login/>} />
       <Route path='/Validate' element={<ValidateSeal />} />
      <Route path='/forget-password' element={<ForgetPassword />} />
      
      {/*  Fallback to login for any unknown route */}
      <Route path='*' element={<Navigate to="/login" />} /> 
    </Routes>
  )
}

export default App
