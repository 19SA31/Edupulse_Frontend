import { adminAxiosInstance } from "../api/adminAxiosInstance";
import axios from "axios";
 
export const adminLoginService = async (email: string, password: string) => {
  const response = await adminAxiosInstance.post("/admin/login", {
    email,
    password,
  });

  if (response.data.success) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("admin", JSON.stringify(response.data.admin));
  }

  return response.data;
};

export const logoutAdmin = async () => {
  const response = await adminAxiosInstance.post("/admin/logout");
  return response.data;
};

export const getUsers=(page:number,search:string)=>{
   
    
    return adminAxiosInstance.get('/admin/getUsers',{
        params: { page, limit: 7 ,search }
      });
    
}

export const listUnlistUser=(id:string)=>{
   
    
    return adminAxiosInstance.put(`/admin/listUnlistUser/${id}`);
    
}

export const getTutors=(page:number,search:string)=>{
   
    
    return adminAxiosInstance.get('/admin/getTutors',{
        params: { page, limit: 7,search  }
      });
    
}

export const listUnlistTutor=(id:string)=>{
   
    
    return adminAxiosInstance.put(`/admin/listUnlistTutor/${id}`);
    
}