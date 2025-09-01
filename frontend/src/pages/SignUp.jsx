// Signup.jsx
import React, { useState } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import "./SignUp.css";
import LoginImg from "../assets/pawel-czerwinski-eimEio8958o-unsplash.jpg";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    email: "",
    password: "",
    otp: ""
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // Send OTP to email
  const handleGetOtp = async () => {
    if (!form.email) return alert("Please enter your email first");

    try {
      const res = await axios.post("https://highway-delite-backend-irk1.onrender.com/get-otp", { email: form.email });
      alert("OTP sent to your email ✅");
      setStep(2);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error sending OTP");
    }
  };

  // Signup user
  const handleSignup = async () => {
    if (!form.name || !form.dob || !form.email || !form.password || !form.otp) {
      return alert("All fields are required");
    }

    try {
      const res = await axios.post("https://highway-delite-backend-irk1.onrender.com/signup", form);
      alert(res.data.message);

      // Navigate to signin page after successful signup
      navigate("/signin");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Left Form */}
        <div className="signup-left">
          <h2>Sign up</h2>
          <p>Please signup to continue to your account.</p>

          <InputField type='text' value={form.name} onChange={handleChange("name")} placeholder="Name" />
          <InputField type="date" value={form.dob} onChange={handleChange('dob')} />
          <InputField type="email" value={form.email} onChange={handleChange("email")} placeholder="Email" />
          <InputField type="password" value={form.password} onChange={handleChange("password")} placeholder="Password" />

          {step === 1 ? (
            <Button text="Get OTP" onClick={handleGetOtp} />
          ) : (
            <>
              <InputField value={form.otp} onChange={handleChange("otp")} className="otp-input" placeholder="OTP" />
              <Button text="Sign up" onClick={handleSignup} />
            </>
          )}

          <p className="signin-account-text">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>

        </div>

        {/* Right Illustration */}
        <div className="signup-illustration">
          <img
            src={LoginImg}
            alt="illustration"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
