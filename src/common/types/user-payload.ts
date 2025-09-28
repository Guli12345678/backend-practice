export type UserPayload = {
  id: number;
  email: string;
  role: 'ADMIN' | 'USER' | 'OWNER';
};
