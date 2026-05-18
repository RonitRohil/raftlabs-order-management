import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CartItem from "../src/components/CartItem";
import { CartProvider } from "../src/context/CartContext";

const mock_cart_item = {
  menu_item: {
    id: 2,
    name: "Classic Cheeseburger",
    description: "Juicy beef patty",
    price: 199,
    image_url: "https://example.com/burger.jpg",
    category: "Burger",
  },
  quantity: 3,
};

const render_with_cart = (ui) => render(<CartProvider>{ui}</CartProvider>);

describe("CartItem component", () => {
  it("renders the item name", () => {
    render_with_cart(<CartItem item={mock_cart_item} />);
    expect(screen.getByText("Classic Cheeseburger")).toBeInTheDocument();
  });

  it("renders the price per unit", () => {
    render_with_cart(<CartItem item={mock_cart_item} />);
    expect(screen.getByText("₹199 each")).toBeInTheDocument();
  });

  it("renders the correct quantity", () => {
    render_with_cart(<CartItem item={mock_cart_item} />);
    expect(screen.getByTestId("item-quantity")).toHaveTextContent("3");
  });

  it("renders the line total (price * quantity)", () => {
    render_with_cart(<CartItem item={mock_cart_item} />);
    expect(screen.getByText("₹597")).toBeInTheDocument();
  });

  it("renders increase, decrease and remove controls", () => {
    render_with_cart(<CartItem item={mock_cart_item} />);
    expect(screen.getByTestId("increase-qty")).toBeInTheDocument();
    expect(screen.getByTestId("decrease-qty")).toBeInTheDocument();
    expect(screen.getByTestId("remove-item")).toBeInTheDocument();
  });
});
