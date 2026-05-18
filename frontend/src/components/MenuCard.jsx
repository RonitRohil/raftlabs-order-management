import { useCart } from "../context/CartContext";

export default function MenuCard({ item }) {
  const { cart, add_to_cart } = useCart();

  const cart_entry = cart.find((i) => i.menu_item.id === item.id);
  const in_cart_qty = cart_entry ? cart_entry.quantity : 0;

  return (
    <div
      data-testid="menu-card"
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
    >
      <div className="relative">
        <span className="absolute top-2 left-2 z-10 bg-brand-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {item.category}
        </span>
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
          }}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 flex-1">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-brand-600 font-bold text-lg">₹{item.price}</span>
          <button
            data-testid="add-to-cart-btn"
            onClick={() => add_to_cart(item)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              in_cart_qty > 0
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-brand-500 text-white hover:bg-brand-600"
            }`}
          >
            {in_cart_qty > 0 ? `In Cart (${in_cart_qty})` : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
