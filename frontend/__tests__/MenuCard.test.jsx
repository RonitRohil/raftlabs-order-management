import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MenuCard from "../src/components/MenuCard";
import { CartProvider } from "../src/context/CartContext";

const mock_item = {
  id: 1,
  name: "Margherita Pizza",
  description: "Classic tomato base with fresh mozzarella",
  price: 299,
  image_url: "https://example.com/pizza.jpg",
  category: "Pizza",
};

const render_with_cart = (ui) => render(<CartProvider>{ui}</CartProvider>);

describe("MenuCard component", () => {
  it("renders the item name, price and category", () => {
    render_with_cart(<MenuCard item={mock_item} />);
    expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    expect(screen.getByText("₹299")).toBeInTheDocument();
    expect(screen.getByText("Pizza")).toBeInTheDocument();
  });

  it("renders the item description", () => {
    render_with_cart(<MenuCard item={mock_item} />);
    expect(screen.getByText(/Classic tomato base/i)).toBeInTheDocument();
  });

  it("shows 'Add to Cart' button initially", () => {
    render_with_cart(<MenuCard item={mock_item} />);
    expect(screen.getByTestId("add-to-cart-btn")).toHaveTextContent("Add to Cart");
  });

  it("shows 'In Cart (1)' after clicking Add to Cart", () => {
    render_with_cart(<MenuCard item={mock_item} />);
    fireEvent.click(screen.getByTestId("add-to-cart-btn"));
    expect(screen.getByTestId("add-to-cart-btn")).toHaveTextContent("In Cart (1)");
  });

  it("increments count when Add to Cart is clicked multiple times", () => {
    render_with_cart(<MenuCard item={mock_item} />);
    fireEvent.click(screen.getByTestId("add-to-cart-btn"));
    fireEvent.click(screen.getByTestId("add-to-cart-btn"));
    expect(screen.getByTestId("add-to-cart-btn")).toHaveTextContent("In Cart (2)");
  });
});
