import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
});

export const getMenu = () => client.get("/menu");
export const placeOrder = (order_data) => client.post("/orders", order_data);
export const getOrder = (order_id) => client.get(`/orders/${order_id}`);
export const getStreamUrl = (order_id) => {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  return `${base}/orders/${order_id}/stream`;
};

export default client;
