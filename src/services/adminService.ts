import { adminAxiosInstance } from "../api/adminAxiosInstance";
import axios from "axios";
 
export const adminLoginService = async(email:string, password:string) =>{
    try {
        console.log("inside adminLoginService")
        const response = await adminAxiosInstance.post("/admin/login",{email,password})
        console.log("response adminloginservice: ",response)
        if(response.data.success){
            localStorage.setItem("accessToken",response.data.accessToken)
            localStorage.setItem("admin",JSON.stringify(response.data.admin))
        }
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Login failed";
            console.error("Login failed:", message);
            return { success: false, message };
        }
      
          
        console.error("Unexpected error:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}

export const logoutAdmin = async () => {
    try {
      const response = await adminAxiosInstance.post("/admin/logout");
      console.log(response);
      return response.data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  };