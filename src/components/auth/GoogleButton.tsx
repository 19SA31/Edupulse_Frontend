import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { toast } from 'sonner';

interface GoogleLoginButtonProps {
  role: 'user' | 'tutor';
  onSuccess: () => void;
  loginAction: any; 
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  role,
  onSuccess,
  loginAction,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const result = await dispatch(
        loginAction(credentialResponse.credential)
      ).unwrap();

      toast.success(
        `Welcome ${result.user?.name || result.tutor?.name || 'back'}!`
      );
      onSuccess();
    } catch (error: any) {
      toast.error(error || 'Google authentication failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google authentication failed. Please try again.');
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        theme="filled_blue"
        size="large"
        width="100%"
        text={role === 'user' ? 'signin_with' : 'signup_with'}
      />
    </div>
  );
};

export default GoogleLoginButton;