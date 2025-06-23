import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import OtpInput from "../auth/OtpInput";
import { 
  verifyOtpService,
  verifyForgotOtpService,
  forgotPasswordService
} from "../../services/authService";
import logo from "../../assets/epulse.png";
import bg_img from "../../assets/ep-background.jpg";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state || {};

  const handleVerify = async (otp: string) => {
    try {
      let response;
      if (userData?.source === "forgotPassword") {
        response = await verifyForgotOtpService(userData.email, otp, true);
      } else {
        response = await verifyOtpService(
          userData.name,
          userData.email,
          userData.phone,
          userData.password,
          otp
        );
      }

      if(userData.source==="forgotPassword"){
        if(response?.success){
          toast.success("OTP Verified Successfully!")
          setTimeout(()=>{
            navigate("/reset-password",{ state: { email: userData.email } })
          })
        }
      }else{
        if (response?.success) {
          toast.success("OTP Verified Successfully!");
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        } else {
          toast.error("OTP verification failed.");
        }
      }


      
    } catch (error) {
      toast.error("Error verifying OTP.");
    }
  };

  const handleResend = async () => {
    try {
      const response = await forgotPasswordService(userData.email, userData?.source === "forgotPassword");

      if (response?.data?.success) {
        toast.success("OTP Resent Successfully!");
      } else {
        toast.error("Failed to resend OTP.");
      }
    } catch (error) {
      toast.error("Error resending OTP. Please try again.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-cover" style={{ backgroundImage: `url(${bg_img})` }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-md bg-white/5 rounded-3xl border border-white/30 backdrop-blur-md p-10">
        <Toaster />
        <img src={logo} alt="Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white text-center">Verify OTP</h2>
        <p className="text-sm text-white text-center mb-4">
          A 4-digit OTP has been sent to {userData.email}
        </p>
        <OtpInput onVerify={handleVerify} onResend={handleResend} />
      </div>
    </div>
  );
};

export default VerifyOtp;
