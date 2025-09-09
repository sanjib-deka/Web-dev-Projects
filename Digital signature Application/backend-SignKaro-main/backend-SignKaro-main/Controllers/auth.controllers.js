import uploadOnCloudinary from "../config/cloudinary.js";
import generateToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


// SIGNUP FUNCTION
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for missing fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    let profileImage;
    if (req.file) {
      profileImage = await uploadOnCloudinary(req.file.path); 
    }
    console.log(req.file)

    if(req.file){

    }
  
 
 
 


    // Check if user already exists
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImage
    });

    let token;
    try {
      token = generateToken(user._id);
    } catch (error) {
      console.log("Token error", error);
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send success response
   
    return res.status(201).json({
      user:{
        name,
        email,
        profileImage
      }
    })

    
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// LOGIN 

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const match = await bcrypt.compare(password, existUser.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    let token;
    try {
      token = generateToken(existUser._id);
    } catch (error) {
      console.log("Token error", error);
      return res.status(500).json({ message: "Token generation failed" });
    }

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENVIRONMENT === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send success response
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: existUser._id,
        name: existUser.name,
        email: existUser.email,
        profileImage: existUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// Logout

export const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENVIRONMENT === "production",
      sameSite: "strict",
    });

    // Send success response
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}



export const getUserData = async (req,res)=>{

   try {
     let userId = req.userId
     if(!userId){
      return res.status(400).json({ message: "User ID is not found" });
     }
     let user = await User.findById(userId)

     if(!user){
        return res.status(400).json({ message: "User not found" });
     }
       return res.status(200).json(user)
   
    
   } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
    
   }

}

