import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMenu } from "../api/client";
import MenuCard from "../components/MenuCard";
import { useCart } from "../context/CartContext";

export default function MenuPage() {
  const [menu_items, set_menu_items] = useState([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState(null);
  const [selected_category, set_selected_category] = useState("All");
  const { cart_count, cart_total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getMenu()
      .then((res) => {
        set_menu_items(res.data.result.menu_items);
        set_loading(false);
      })
      .catch(() => {
        set_error("Failed to load menu. Please try again.");
        set_loading(false);
      });
  }, []);

  const categories = ["All", ...new Set(menu_items.map((i) => i.category))];
  const filtered_items =
    selected_category === "All"
      ? menu_items
      : menu_items.filter((i) => i.category === selected_category);

  return (
    <div className="min-h-screen bg-brand-50">
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-600">🍔 FoodieHub</h1>
          {cart_count > 0 && (
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-brand-600 transition-colors"
            >
              🛒 {cart_count} · ₹{cart_total}
            </button>
          )}
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => set_selected_category(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                selected_category === cat
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-5xl animate-bounce">🍕</span>
            <p className="text-gray-500 text-lg">Loading menu...</p>
          </div>
        )}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered_items.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
