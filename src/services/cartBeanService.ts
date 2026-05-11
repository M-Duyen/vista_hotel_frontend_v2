import type { CartBean } from "../types/CartBean";
import { api } from "./apiClient";

const ENDPOINT = "/cart-beans";

export const getCartBeanByCustomerId = async (
  id: string,
): Promise<CartBean> => {
  try {
    const response = await api.get(`${ENDPOINT}/customer/${id}`);

    const item = response.data;
    const cartBean: CartBean = {
      cartBeanId: item.cartBeanId,
      customer: await api
        .get(`/customers/${item.customerId}`)
        .then((res) => res.data),
      items: await Promise.all(
        item.items.map((roomNumber: string) =>
          api.get(`/rooms/${roomNumber}`).then((res) => res.data),
        ),
      ),
    };
    return cartBean;
  } catch (error) {
    console.error(`Error fetching cart for customer ${id}:`, error);
    throw error;
  }
};

export const addRoomToCart = async (
  customerId: string,
  roomNumber: string,
): Promise<void> => {
  try {
    await api.post(`${ENDPOINT}/add/${customerId}/${roomNumber}`);
  } catch (error) {
    console.error(`Error adding room ${roomNumber} to cart:`, error);
    throw error;
  }
};

export const removeRoomFromCart = async (
  customerId: string,
  roomNumber: string,
): Promise<void> => {
  try {
    await api.delete(`${ENDPOINT}/remove/${customerId}/${roomNumber}`);
  } catch (error) {
    console.error(`Error removing room ${roomNumber} from cart:`, error);
    throw error;
  }
};
