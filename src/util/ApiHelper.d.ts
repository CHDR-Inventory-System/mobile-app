export type UserRole = 'Super' | 'Admin' | 'User';

export type User = {
  ID: number;
  created: string;
  email: string;
  role: UserRole;
  nid: string;
};
