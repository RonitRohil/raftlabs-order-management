import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { update_quantity, remove_from_cart } = useCart();
  const { menu_item, quantity } = item;

  return (
    <div data-testid="cart-item" className="flex items-center gap-4 py-4 border-b border-gray-100">
      <img
        src={menu_item.image_url}
        alt={menu_item.name}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100";
        }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate">{menu_item.name}</h4>
        <p className="text-gray-500 text-sm">₹{menu_item.price} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          data-testid="decrease-qty"
          onClick={() => update_quantity(menu_item.id, quantity - 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
        >
          −
        </button>
        <span data-testid="item-quantity" className="w-8 text-center font-semibold">
          {quantity}
        </span>
        <button
          data-testid="increase-qty"
          onClick={() => update_quantity(menu_item.id, quantity + 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
        >
          +
        </button>
      </div>
      <span className="font-bold text-brand-600 w-16 text-right">₹{menu_item.price * quantity}</span>
      <button
        data-testid="remove-item"
        onClick={() => remove_from_cart(menu_item.id)}
        className="text-red-400 hover:text-red-600 ml-2"
        aria-label="Remove item"
      >
        ✕
      </button>
    </div>
  );
}
