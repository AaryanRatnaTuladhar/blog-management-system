export type User = {
  id: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
};

export type Blog = {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: Pick<User, 'id' | 'email' | 'role' | 'isActive'>;
};

export type Comment = {
  id: string;
  content: string;
  createdAt?: string;
  author?: Pick<User, 'id' | 'email'>;
  blog?: Pick<Blog, 'id' | 'title'>;
  replies?: Comment[];
};

export type Notification = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt?: string;
};
