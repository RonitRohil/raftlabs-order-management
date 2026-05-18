const db = require("../helpers/dbHelper");
const apiResponse = require("../utils/apiResponse");

async function getAllMenuItems() {
  try {
    const menu_items = await db.menuItem.findMany({
      where: { is_available: true },
      orderBy: { category: "asc" },
    });
    return apiResponse(1, 200, "Menu items fetched successfully", { menu_items });
  } catch (err) {
    throw err;
  }
}

module.exports = { getAllMenuItems };
