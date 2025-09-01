import React, { useState } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import "./SignIn.css";
import LoginImg from "../assets/pawel-czerwinski-eimEio8958o-unsplash.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: ""
  });

  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleGetOtp = async () => {
    if (!form.email) return alert("Please enter your email first");
    try {
      const res = await axios.post("https://highway-delite-backend-irk1.onrender.com/get-otp", { email: form.email });
      alert("OTP sent to your email ✅");
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleSignin = async () => {
    if (!form.email || !form.password || !form.otp) {
      return alert("All fields are required");
    }

    try {
      const res = await axios.post("https://highway-delite-backend-irk1.onrender.com/signin", form);
      alert(res.data.message);

      // Navigate to dashboard
      navigate("/dashboard", { state: { user: res.data.user } });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Signin failed");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-left">
          <h2>Sign in</h2>
          <p className="subtitle">Please login to continue to your account.</p>

          <InputField type="email" value={form.email} onChange={handleChange("email")} placeholder="Email" />
          <InputField type="password" value={form.password} onChange={handleChange("password")} placeholder="Password" />

          {otpSent && (
            <InputField type="text" value={form.otp} onChange={handleChange("otp")} placeholder="OTP" />
          )}

          <div className="signin-links">
            <button type="button" onClick={handleGetOtp} className="resend-otp-btn">
              {otpSent ? "Resend OTP" : "Get OTP"}
            </button>
            <label>
              <input type="checkbox" /> Keep me logged in
            </label>
          </div>

          <Button text="Sign in" onClick={handleSignin} />

          <p className="signup-account-text">
            Need an account? <a href="/signup">Create one</a>
          </p>
        </div>

        <div className="signin-illustration">
          <img src={LoginImg} alt="Abstract swirling lines" />
        </div>
      </div>
    </div>
  );
};

export default Signin;
