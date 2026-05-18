const request = require("supertest");
const app = require("../src/index");

describe("GET /api/menu", () => {
    it("should return 200 with menu items array", async () => {
        const res = await request(app).get("/api/menu");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(1);
        expect(res.body.message).toBe("Menu items fetched successfully");
        expect(Array.isArray(res.body.result.menu_items)).toBe(true);
    });

    it("should return items with required fields (id, name, description, price, image_url, category)", async () => {
        const res = await request(app).get("/api/menu");
        const item = res.body.result.menu_items[0];
        ["id", "name", "description", "price", "image_url", "category"].forEach((field) => {
            expect(item).toHaveProperty(field);
        });
    });

    it("should only return items where is_available is true", async () => {
        const res = await request(app).get("/api/menu");
        res.body.result.menu_items.forEach((item) => {
            expect(item.is_available).toBe(true);
        });
    });
});
