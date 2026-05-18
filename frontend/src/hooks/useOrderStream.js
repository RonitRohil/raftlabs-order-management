import { useEffect, useRef, useState } from "react";
import { getStreamUrl } from "../api/client";

const STATUS_LABELS = {
  ORDER_RECEIVED:   { label: "Order Received",   step: 0 },
  PREPARING:        { label: "Preparing",         step: 1 },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",  step: 2 },
  DELIVERED:        { label: "Delivered",         step: 3 },
};

export function useOrderStream(order_id) {
  const [status, set_status] = useState("ORDER_RECEIVED");
  const [is_complete, set_is_complete] = useState(false);
  const [error, set_error] = useState(null);
  const es_ref = useRef(null);

  useEffect(() => {
    if (!order_id) return;

    const es = new EventSource(getStreamUrl(order_id));
    es_ref.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      set_status(data.status);
      if (data.status === "DELIVERED") {
        set_is_complete(true);
        es.close();
      }
    };

    es.onerror = () => {
      set_error("Connection lost. Please refresh the page.");
      es.close();
    };

    return () => {
      es.close();
    };
  }, [order_id]);

  const status_info = STATUS_LABELS[status] || STATUS_LABELS.ORDER_RECEIVED;

  return {
    status,
    status_label: status_info.label,
    current_step: status_info.step,
    is_complete,
    error,
  };
}
