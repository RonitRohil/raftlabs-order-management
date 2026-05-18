import { useParams, useNavigate } from "react-router-dom";
import { useOrderStream } from "../hooks/useOrderStream";
import OrderStatusTracker from "../components/OrderStatusTracker";

export default function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status_label, current_step, is_complete, error } = useOrderStream(id);

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 Order Confirmed!</h1>
          <p className="text-gray-500 text-lg">
            Order <span className="font-bold text-brand-600">#{id}</span>
          </p>
          <span className="inline-block mt-2 bg-brand-50 text-brand-600 font-semibold text-sm px-4 py-1.5 rounded-full border border-brand-500">
            {status_label}
          </span>
        </div>

        <OrderStatusTracker current_step={current_step} is_complete={is_complete} />

        {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}

        {is_complete && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="bg-brand-500 text-white px-6 py-3 rounded-full font-bold hover:bg-brand-600 transition-colors"
            >
              Order Again 🍕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
