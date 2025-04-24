import axios from "axios";
import { baseUrl } from "./baseUrl";

const url = `${baseUrl}/api/admin`

export const adminAxiosInstance = axios.create({
    baseURL:url,
    withCredentials:true,
    headers:{
        'Content-Type':'application/json'
    }
})