import type { Customer } from "./Customer";
import type { Room } from "./Room";

export interface CartBean {
  cartBeanId: string;
  customer: Customer;
  items: Room[];
}
