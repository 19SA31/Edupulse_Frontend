export interface Tutor{
    id?: string
    name: string
    email: string
    phone: string
    password: string
    dob?: string
    gender?: string
    isBlocked?: boolean
}

export interface TutorSignup{
    
    name: string
    email: string
    phone: string
    password: string
    
}

export interface VerifyOtpArgs {
    name: string
    email: string
    phone: string
    password: string
    otp: string;
  }


  export interface TutorLogin {
    
    email: string
    password: string
    
  }
export interface TutorState{
    tutorInfo: Tutor | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}
export interface OtpResponse {
    message: string;
  }