import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../api/client";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function CartPage() {
  const { cart, cart_total, clear_cart } = useCart();
  const navigate = useNavigate();
  const [form, set_form] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
  });
  const [form_errors, set_form_errors] = useState({});
  const [api_error, set_api_error] = useState(null);
  const [submitting, set_submitting] = useState(false);

  function validate() {
    const errors = {};
    if (!form.customer_name.trim()) errors.customer_name = "Name is required";
    if (!PHONE_REGEX.test(form.customer_phone))
      errors.customer_phone = "Enter a valid 10-digit Indian mobile number";
    if (!form.customer_address.trim()) errors.customer_address = "Address is required";
    return errors;
  }

  async function handle_submit(e) {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      set_form_errors(errors);
      return;
    }
    set_form_errors({});
    set_api_error(null);
    set_submitting(true);
    try {
      const payload = {
        ...form,
        items: cart.map((i) => ({ menu_item_id: i.menu_item.id, quantity: i.quantity })),
      };
      const res = await placeOrder(payload);
      const order_id = res.data.result.order.id;
      clear_cart();
      navigate(`/orders/${order_id}`);
    } catch (err) {
      set_api_error(
        err.response?.data?.message || "Failed to place order. Please try again."
      );
    } finally {
      set_submitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">🛒</span>
        <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-brand-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-600 transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-800">Your Cart</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/5 bg-white rounded-xl shadow-md p-6">
            {cart.map((item) => (
              <CartItem key={item.menu_item.id} item={item} />
            ))}
            <div className="flex justify-between items-center pt-4 mt-2 font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-600">₹{cart_total}</span>
            </div>
          </div>

          <div className="lg:w-2/5 bg-white rounded-xl shadow-md p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Details</h2>
            <form onSubmit={handle_submit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => set_form({ ...form, customer_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
                  placeholder="Ronit Jain"
                />
                {form_errors.customer_name && (
                  <p className="text-red-500 text-xs mt-1">{form_errors.customer_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => set_form({ ...form, customer_phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
                  placeholder="9876543210"
                />
                {form_errors.customer_phone && (
                  <p className="text-red-500 text-xs mt-1">{form_errors.customer_phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Delivery Address
                </label>
                <textarea
                  value={form.customer_address}
                  onChange={(e) => set_form({ ...form, customer_address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 resize-none"
                  rows={3}
                  placeholder="123, MG Road, Bengaluru - 560001"
                />
                {form_errors.customer_address && (
                  <p className="text-red-500 text-xs mt-1">{form_errors.customer_address}</p>
                )}
              </div>
              {api_error && <p className="text-red-500 text-sm">{api_error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 transition-colors disabled:opacity-60"
              >
                {submitting ? "Placing Order..." : `Place Order · ₹${cart_total}`}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
