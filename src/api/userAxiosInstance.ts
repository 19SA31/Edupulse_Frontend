import axios from "axios";
import { baseUrl } from "./baseUrl";



const url = `${baseUrl}/api/user`



export const userAxiosInstance = axios.create({
    baseURL:url,
    withCredentials:true,
    headers:{
        'Content-Type':'application/json'
    }
})