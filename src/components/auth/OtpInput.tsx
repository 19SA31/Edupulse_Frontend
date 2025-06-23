import React, { useState, useEffect } from "react";

interface OtpInputProps {
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}

const OtpInput: React.FC<OtpInputProps> = ({ onVerify, onResend }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let timer: number | null = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleResendClick = async () => {
    setIsResendDisabled(true);
    setCountdown(60);
    await onResend();
  };

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-md bg-white/5 rounded-3xl border border-white/30 backdrop-blur-md p-8 shadow-lg">
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            className="w-14 h-14 text-2xl text-center border border-white/30 rounded-xl bg-transparent text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        ))}
      </div>
      {countdown > 0 ? (
        <>
          <button
            type="button"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
            onClick={() => onVerify(otp.join(""))}
          >
            Verify OTP
          </button>
          <p className="text-white text-sm mt-3">Resend OTP in {countdown}s</p>
        </>
      ) : (
        <button
          type="button"
          className="w-full py-3 bg-gray-600 text-white font-semibold rounded-xl shadow-md hover:bg-gray-700 transition duration-200 disabled:opacity-50"
          onClick={handleResendClick}
          disabled={isResendDisabled}
        >
          Resend OTP
        </button>
      )}
    </div>
  );
};

export default OtpInput;