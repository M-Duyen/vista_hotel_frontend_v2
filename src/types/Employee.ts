export type UserRole =
  | "ADMIN"
  | "EMPLOYEE"
  | "CUSTOMER"
  | "GUEST";

export interface Employee {
  id: string;
  username?: string;
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
  employeeStatus?: "ACTIVE" | "INACTIVE" | "LEAVE" | "RETIRED" | string;
  status: "ACTIVE" | "INACTIVE" | string;
  roles?: string[];
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
    userRole: 'ADMIN' | 'EMPLOYEE';
}
