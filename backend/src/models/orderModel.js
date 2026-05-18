const db = require("../helpers/dbHelper");
const apiResponse = require("../utils/apiResponse");

const VALID_STATUSES = ["ORDER_RECEIVED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

async function placeOrder(order_data) {
	const { customer_name, customer_address, customer_phone, items } = order_data;

	const menu_item_ids = items.map((i) => i.menu_item_id);

	const found_items = await db.menuItem.findMany({
		where: { id: { in: menu_item_ids }, is_available: true },
	});

	if (found_items.length !== menu_item_ids.length) {
		return apiResponse(0, 400, "One or more menu items are invalid or unavailable", null);
	}

	const price_map = {};
	found_items.forEach((item) => {
		price_map[item.id] = item.price;
	});

	const order = await db.order.create({
		data: {
			customer_name,
			customer_address,
			customer_phone,
			items: {
				create: items.map((i) => ({
					menu_item_id: i.menu_item_id,
					quantity: i.quantity,
					unit_price: price_map[i.menu_item_id],
				})),
			},
		},
		include: {
			items: { include: { menu_item: true } },
		},
	});

	return apiResponse(1, 201, "Order placed successfully", { order });
}

async function getOrderById(order_id) {
	const order = await db.order.findUnique({
		where: { id: order_id },
		include: { items: { include: { menu_item: true } } },
	});

	if (!order) {
		return apiResponse(0, 404, `Order with id ${order_id} not found`, null);
	}

	return apiResponse(1, 200, "Order fetched successfully", { order });
}

async function updateOrderStatus(order_id, status) {
	if (!VALID_STATUSES.includes(status)) {
		return apiResponse(
			0,
			400,
			`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
			null
		);
	}

	const existing = await db.order.findUnique({ where: { id: order_id } });
	if (!existing) {
		return apiResponse(0, 404, `Order with id ${order_id} not found`, null);
	}

	const updated_order = await db.order.update({
		where: { id: order_id },
		data: { status },
	});

	return apiResponse(1, 200, "Order status updated successfully", { order: updated_order });
}

module.exports = { placeOrder, getOrderById, updateOrderStatus };
