  import { ReactNode } from "react";

  
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

export interface Category {
  _id: string;
  name: string;
  description: string;
  isListed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface SidebarItem {
  path: string;
  label: string;
  icon: ReactNode;
}

export interface SidebarProps {
  // Required props
  sidebarItems?: SidebarItem[];
  
  // Optional customization props
  backgroundColor?: string;
  activeColor?: string;
  hoverColor?: string;
  textColor?: string;
}

export interface SidebarItem {
  path: string;
  label: string;
  icon: ReactNode;
}