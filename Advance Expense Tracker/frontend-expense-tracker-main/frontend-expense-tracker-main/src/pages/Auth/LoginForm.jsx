import React, { useContext, useEffect, useState } from "react";
import AuthLayout from "../../components/Layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle Login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    //Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
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
        className="w-full max-w-md md:max-w-lg lg:w-[70%] h-auto md:h-full flex flex-col justify-center mx-auto my-8 md:my-0 shadow-lg"
        style={{
          background:
            "linear-gradient(120deg, rgb(255, 244, 224) 0%, rgb(255, 224, 178) 60%, rgb(255, 236, 209) 100%)",
          borderRadius: "18px",
          padding: "2rem",
        }}
      >
        <h3 className="text-xl font-semibold text-black text-center">
          Welcome Back
        </h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6 text-center">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="Enter your email"
            type="text"
          />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Enter your password"
            type="password"
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary bg-black w-full">
            LOGIN
          </button>

          <p className="text-[13px] text-slate-800 mt-3 text-center">
            Don't have an account?{" "}
            <Link className="font-medium text-black underline" to="/signup">
              SignUp
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
