export interface User {
  _id?: string;
  email: string;
  password: string; // hashed
  name: string;
  bio?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  bio?: string;
  profileImage?: string;
}

