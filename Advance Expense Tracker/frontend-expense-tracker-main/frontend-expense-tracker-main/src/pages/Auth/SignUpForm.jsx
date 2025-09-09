import React, { useContext, useState } from "react";
import AuthLayout from "../../components/Layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { UserContext } from "../../context/UserContext";
import axiosInstance from "../../utils/axiosInstance";

const SignUpForm = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle Sign Up Form Submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    if (!fullName) {
      setError("Please enter your name");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    // SignUp API Call
    try {
      // Upload image if present
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName,
        email,
        password,
        profileImageUrl,
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <AuthLayout>
      <div
        className="w-full max-w-lg mx-auto flex flex-col justify-center shadow-lg my-8 md:my-0"
        style={{
          background:
            "linear-gradient(120deg, rgb(255, 244, 224) 0%, rgb(255, 224, 178) 60%, rgb(255, 236, 209) 100%)",
          borderRadius: "18px",
          padding: "2rem",
        }}
      >
        <h3 className="text-xl font-semibold text-black text-center">
          Create an Account
        </h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6 text-center">
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp}>
          
         <div className="hidden">
  <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
</div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Enter your full name"
              type="text"
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="Enter your email"
              type="text"
            />

            <div className="col-span-1 md:col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Min 8 Characters"
                type="password"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary w-full mt-4">
            SIGN UP
          </button>

          <p className="text-[13px] text-slate-800 mt-3 text-center">
            Already have an account?{" "}
            <Link className="font-medium text-black underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUpForm;
