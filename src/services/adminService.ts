// import { adminAxiosInstance } from "../api/adminAxiosInstance";
import { createAxiosInstance } from "../api/axiosInstance";

const adminAxiosInstance = createAxiosInstance("admin");

export const adminLoginService = async (email: string, password: string) => {
  const response = await adminAxiosInstance.post("/login", { email, password });

  if (response.data.success) {
    localStorage.setItem("adminAccessToken", response.data.data.accessToken);
  }

  return response.data;
};

export const logoutAdmin = async () => {
  const response = await adminAxiosInstance.post("/logout");

  if (response.data.success) {
    localStorage.removeItem("adminAccessToken");
  }

  return response.data;
};

export const getUsers = (page: number, search: string) => {
  return adminAxiosInstance.get("/users", {
    params: { page, limit: 7, search },
  });
};

export const listUnlistUser = (id: string) => {
  return adminAxiosInstance.put(`/listUnlistUser/${id}`);
};

export const getTutors = (page: number, search: string) => {
  return adminAxiosInstance.get("/tutors", {
    params: { page, limit: 7, search },
  });
};

export const listUnlistTutor = (id: string) => {
  return adminAxiosInstance.put(`/listUnlistTutor/${id}`);
};

export const getCategories = (page: number, search: string) => {
  return adminAxiosInstance.get("/categories", {
    params: { page, limit: 10, search },
  });
};

export const addCategoryService = async (name: string, description: string) => {
  const response = await adminAxiosInstance.post("/add-category", {
    name,
    description,
  });

  return response.data;
};

export const toggleCategoryStatus = async (id: string) => {
  const response = await adminAxiosInstance.put(`/toggle-category/${id}`);
  return response.data;
};

export const updateCategoryService = async (
  id: string,
  name: string,
  description: string
) => {
  const response = await adminAxiosInstance.put(`/update-category/${id}`, {
    name,
    description,
  });
  return response.data;
};

export const getTutorsForVerification = async (
  page: number,
  search: string = ""
) => {
  const response = await adminAxiosInstance.get("/tutors-verification", {
    params: {
      page,
      search,
      limit: 7,
    },
  });
  return response.data;
};

export const verifyTutor = async (tutorId: string) => {
  const response = await adminAxiosInstance.put(`/verify-tutor/${tutorId}`);
  return response.data;
};

export const rejectTutor = async (tutorId: string, reason?: string) => {
  const response = await adminAxiosInstance.put(`/reject-tutor/${tutorId}`, {
    reason,
  });
  return response.data;
};

export const getTutorVerificationDetails = async (tutorId: string) => {
  const response = await adminAxiosInstance.get(
    `/tutor-verification-details/${tutorId}`
  );
  return response.data;
};

export const getUnpublishedCourses = async (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  const response = await adminAxiosInstance.get(`/publish-courses`, {
    params: { page, limit, search },
  });
  return response.data;
};

export const publishCourse = async (id:string)=>{
  console.log(id)
  const response = await adminAxiosInstance.put(`/publish-course/${id}`)
  return response.data
}
export const rejectCourse = async (id:string, reason?: string)=>{
  const response = await adminAxiosInstance.put(`/reject-course/${id}`,{
    reason
  })
  return response.data
}
export const getPublishedCourses = async(page: number, search: string)=>{
  const response = await adminAxiosInstance.get(`/course-listing`, {
    params: { page, limit: 7, search },
  });
  return response.data
};

export const listUnlistCourse = async (id:string)=>{
  const response = await adminAxiosInstance.put(`/listunlist-course/${id}`)
  return response.data
}