import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import OrderStatusTracker from "../src/components/OrderStatusTracker";

describe("OrderStatusTracker component", () => {
  it("renders all 4 status steps", () => {
    render(<OrderStatusTracker current_step={0} is_complete={false} />);
    expect(screen.getByTestId("status-step-ORDER_RECEIVED")).toBeInTheDocument();
    expect(screen.getByTestId("status-step-PREPARING")).toBeInTheDocument();
    expect(screen.getByTestId("status-step-OUT_FOR_DELIVERY")).toBeInTheDocument();
    expect(screen.getByTestId("status-step-DELIVERED")).toBeInTheDocument();
  });

  it("renders all step labels", () => {
    render(<OrderStatusTracker current_step={0} is_complete={false} />);
    expect(screen.getByText("Order Received")).toBeInTheDocument();
    expect(screen.getByText("Preparing")).toBeInTheDocument();
    expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("does NOT show the completion message when is_complete is false", () => {
    render(<OrderStatusTracker current_step={2} is_complete={false} />);
    expect(screen.queryByText(/Your order has been delivered/i)).not.toBeInTheDocument();
  });

  it("shows the completion message when is_complete is true", () => {
    render(<OrderStatusTracker current_step={3} is_complete={true} />);
    expect(screen.getByText(/Your order has been delivered/i)).toBeInTheDocument();
  });
});
