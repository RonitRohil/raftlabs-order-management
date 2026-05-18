const { z } = require("zod");

const PlaceOrderSchema = z.object({
  customer_name: z.string().min(2, "customer_name must be at least 2 characters").trim(),
  customer_address: z.string().min(5, "customer_address must be at least 5 characters").trim(),
  customer_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "customer_phone must be a valid 10-digit Indian mobile number"),
  items: z
    .array(
      z.object({
        menu_item_id: z.number().int().positive("menu_item_id must be a positive integer"),
        quantity: z.number().int().min(1, "quantity must be at least 1"),
      })
    )
    .min(1, "items must contain at least one item"),
});

module.exports = { PlaceOrderSchema };
