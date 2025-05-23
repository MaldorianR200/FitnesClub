export interface Manager {
  id: number;
  username: string;
  email: string;
  password: string;
  phone?: string;
  position?: string;
  registration_date?: string;
  update_date?: string;
}
