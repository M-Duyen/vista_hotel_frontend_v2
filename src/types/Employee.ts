export type UserRole = "ADMIN" | "EMPLOYEE" | "CUSTOMER" | "GUEST" | string;

export interface Employee {
  id: string;
  userName: string;
  password: string;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  address?: string | null;
  userRole: UserRole;
  department: string;
  position: string;
  salary: number;
  hireDate?: string | null;
  status: "ACTIVE" | "INACTIVE" | string;
}

export interface EmployeeFormData {
    userName: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    salary: string;
    hireDate: string;
    address: string;
    status: 'ACTIVE' | 'INACTIVE';
    userRole: 'EMPLOYEE';
}
