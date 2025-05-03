  export interface Admin {
    
    email: string
    password: string
    
  }
export interface AdminState{
    tutorInfo: Admin | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}