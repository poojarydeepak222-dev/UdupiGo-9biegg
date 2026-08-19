export interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  area: string;
  phone: string;
  tags: string[];
  isVerified: boolean;
  isClosed: boolean;
  image?: string;
  openTime?: string;
  closeTime?: string;
  description?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  badge?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isLoggedIn: boolean;
}
