const request = require("supertest");
const app = require("../src/index");

let valid_menu_item_id;

beforeAll(async () => {
    const menu_res = await request(app).get("/api/menu");
    valid_menu_item_id = menu_res.body.result.menu_items[0].id;
});

const valid_payload = () => ({
    customer_name: "Ronit Jain",
    customer_address: "123, MG Road, Bengaluru - 560001",
    customer_phone: "9876543210",
    items: [{ menu_item_id: valid_menu_item_id, quantity: 2 }],
});

// ── POST /api/orders ─────────────────────────────────

describe("POST /api/orders — success", () => {
    it("should return 201 and create an order with ORDER_RECEIVED status", async () => {
        const res = await request(app).post("/api/orders").send(valid_payload());
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(1);
        expect(res.body.result.order).toHaveProperty("id");
        expect(res.body.result.order.status).toBe("ORDER_RECEIVED");
        expect(res.body.result.order.items).toHaveLength(1);
    });

    it("should snapshot the unit_price at time of order", async () => {
        const res = await request(app).post("/api/orders").send(valid_payload());
        const item = res.body.result.order.items[0];
        expect(item).toHaveProperty("unit_price");
        expect(typeof item.unit_price).toBe("number");
    });
});

describe("POST /api/orders — validation failures", () => {
    it("should return 400 when customer_name is missing", async () => {
        const res = await request(app).post("/api/orders").send({ ...valid_payload(), customer_name: "" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(0);
    });

    it("should return 400 when customer_phone is not a valid 10-digit number", async () => {
        const res = await request(app).post("/api/orders").send({ ...valid_payload(), customer_phone: "12345" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(0);
    });

    it("should return 400 when items array is empty", async () => {
        const res = await request(app).post("/api/orders").send({ ...valid_payload(), items: [] });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(0);
    });

    it("should return 400 when item quantity is 0", async () => {
        const res = await request(app).post("/api/orders").send({ ...valid_payload(), items: [{ menu_item_id: valid_menu_item_id, quantity: 0 }] });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(0);
    });

    it("should return 400 when menu_item_id does not exist in DB", async () => {
        const res = await request(app).post("/api/orders").send({ ...valid_payload(), items: [{ menu_item_id: 999999, quantity: 1 }] });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(0);
    });
});

// ── GET /api/orders/:id ──────────────────────────────

describe("GET /api/orders/:id", () => {
    let order_id;

    beforeAll(async () => {
        const res = await request(app).post("/api/orders").send(valid_payload());
        order_id = res.body.result.order.id;
    });

    it("should return 200 with full order details for a valid id", async () => {
        const res = await request(app).get(`/api/orders/${order_id}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(1);
        expect(res.body.result.order.id).toBe(order_id);
        expect(res.body.result.order).toHaveProperty("customer_name");
        expect(res.body.result.order).toHaveProperty("items");
    });

    it("should return 404 for a non-existent order id", async () => {
        const res = await request(app).get("/api/orders/999999");
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(0);
    });

    it("should return 400 for a non-numeric order id", async () => {
        const res = await request(app).get("/api/orders/abc");
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(0);
    });
});

// ── PATCH /api/orders/:id/status ─────────────────────

describe("PATCH /api/orders/:id/status", () => {
    let order_id;

    beforeAll(async () => {
        const res = await request(app).post("/api/orders").send(valid_payload());
        order_id = res.body.result.order.id;
    });

    it("should update status to PREPARING", async () => {
        const res = await request(app).patch(`/api/orders/${order_id}/status`).send({ status: "PREPARING" });
        expect(res.status).toBe(200);
        expect(res.body.result.order.status).toBe("PREPARING");
    });

    it("should update status to OUT_FOR_DELIVERY", async () => {
        const res = await request(app).patch(`/api/orders/${order_id}/status`).send({ status: "OUT_FOR_DELIVERY" });
        expect(res.status).toBe(200);
        expect(res.body.result.order.status).toBe("OUT_FOR_DELIVERY");
    });

    it("should update status to DELIVERED", async () => {
        const res = await request(app).patch(`/api/orders/${order_id}/status`).send({ status: "DELIVERED" });
        expect(res.status).toBe(200);
        expect(res.body.result.order.status).toBe("DELIVERED");
    });

    it("should return 400 for an invalid status value", async () => {
        const res = await request(app).patch(`/api/orders/${order_id}/status`).send({ status: "FLYING" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(0);
    });

    it("should return 404 for a non-existent order", async () => {
        const res = await request(app).patch("/api/orders/999999/status").send({ status: "PREPARING" });
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(0);
    });
});
