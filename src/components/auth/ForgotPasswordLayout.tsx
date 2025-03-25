import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "../../assets/epulse.png";
import bg_img from "../../assets/ep-background.jpg";
import { forgotPasswordService } from "../../services/authService";

interface ForgotPasswordProps {
    role: "user" | "tutor"; // 
  }

const ForgotPasswordLayout = ({ role }:ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Enter email.");
      return;
    }

    try {
      const response = await forgotPasswordService(email, true);
      if (response?.data?.success) {
        toast.success("OTP sent successfully");
        setTimeout(() =>
          navigate("/verify-otp", { state: { email, source: "forgotPassword", role } }),
          1000
        );
      } else {
        toast.error("OTP sending failed.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Request failed. Please try again.");
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bg_img})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-md bg-white/10 rounded-3xl border border-white/30 backdrop-blur-lg p-10 shadow-xl">
        <img src={logo} alt="Logo" className="w-40 h-auto mb-6" />
        <h2 className="text-3xl font-semibold text-white mb-3 tracking-wide text-center">
          Forgot Password
        </h2>
        <label className="block text-white font-medium mb-2 text-lg text-center">
          Enter your Email
        </label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-white/30 rounded-lg bg-transparent text-white shadow-md focus:outline-none text-center transition duration-300 placeholder-gray-300"
          placeholder="Enter your email"
        />
        <button
          onClick={handleSubmit}
          className="mt-5 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordLayout;