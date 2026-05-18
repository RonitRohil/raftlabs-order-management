const STEPS = [
  { key: "ORDER_RECEIVED",   label: "Order Received",   icon: "🧾" },
  { key: "PREPARING",        label: "Preparing",         icon: "👨‍🍳" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery",  icon: "🛵" },
  { key: "DELIVERED",        label: "Delivered",         icon: "✅" },
];

export default function OrderStatusTracker({ current_step, is_complete }) {
  const progress_pct = (current_step / (STEPS.length - 1)) * 100;

  return (
    <div data-testid="order-status-tracker" className="w-full px-4 py-6">
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded" />
        <div
          className="absolute top-5 left-0 h-1 bg-brand-500 rounded transition-all duration-700"
          style={{ width: `${progress_pct}%` }}
        />
        <div className="relative flex justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.key}
              data-testid={`status-step-${step.key}`}
              className="flex flex-col items-center"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-colors duration-500 ${
                  index <= current_step
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`mt-2 text-xs font-semibold text-center ${
                  index <= current_step ? "text-brand-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      {is_complete && (
        <p className="text-center text-green-600 font-semibold mt-6 text-lg">
          Your order has been delivered! Enjoy your meal. 🎉
        </p>
      )}
    </div>
  );
}
