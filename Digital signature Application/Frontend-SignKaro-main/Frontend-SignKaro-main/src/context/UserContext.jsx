import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom' // <-- Add this line

export const dataContext = createContext()

const UserContext = ({children}) => {

    let navigate = useNavigate()

    let [userData, setUserData] = useState({})

    const serverUrl = "https://backend-signkaro.onrender.com"

    const getUserData = async () => {
         try {
            let {data} = await axios.get(serverUrl + "/api/getuserData",{
                withCredentials: true   
                })
            setUserData(data)
         } catch (error) {
            navigate('/login')
            console.log(error)

            
         }
    }

    const value = {
        serverUrl, setUserData, userData , getUserData
    }

    useEffect(() => {
           getUserData()

    },[])
     
    return (
        <dataContext.Provider value={value}>
            {children}
        </dataContext.Provider>
    )
}

export default UserContext
