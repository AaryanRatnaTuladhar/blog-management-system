export type Role = 'user' | 'admin';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

export type User = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
};

export type BlogStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type Blog = {
  id: string;
  title: string;
  content: string;
  status: BlogStatus;
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
  deletedAt?: string;
  author?: Pick<User, 'id' | 'email'>;
  blog?: Pick<Blog, 'id' | 'title'>;
  replies?: Comment[];
};

export type NotificationType =
  | 'blog_approved'
  | 'blog_rejected'
  | 'blog_comment'
  | 'blog_reply'
  | string;

export type Notification = {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt?: string;
};

export type AdminStats = {
  blogs: { draft: number; pending: number; approved: number; rejected: number };
  users: { total: number; admins: number; users: number; active: number };
};
