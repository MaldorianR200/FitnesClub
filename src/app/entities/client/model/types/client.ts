export interface Client {
  id: number;
  username: string;
  email: string;
  birth_date: string;
  address: string;
  phone?: string;
  registration_date?: string;
  update_date?: string;
}
