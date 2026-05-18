import { createContext, useCallback, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, set_cart] = useState([]);

  const add_to_cart = useCallback((menu_item) => {
    set_cart((prev) => {
      const existing = prev.find((i) => i.menu_item.id === menu_item.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item.id === menu_item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menu_item, quantity: 1 }];
    });
  }, []);

  const remove_from_cart = useCallback((menu_item_id) => {
    set_cart((prev) => prev.filter((i) => i.menu_item.id !== menu_item_id));
  }, []);

  const update_quantity = useCallback(
    (menu_item_id, quantity) => {
      if (quantity <= 0) {
        remove_from_cart(menu_item_id);
      } else {
        set_cart((prev) =>
          prev.map((i) => (i.menu_item.id === menu_item_id ? { ...i, quantity } : i))
        );
      }
    },
    [remove_from_cart]
  );

  const clear_cart = useCallback(() => set_cart([]), []);

  const cart_total = cart.reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0);
  const cart_count = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, add_to_cart, remove_from_cart, update_quantity, clear_cart, cart_total, cart_count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
