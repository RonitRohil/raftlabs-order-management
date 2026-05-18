const db = require("../helpers/dbHelper");
const apiResponse = require("../utils/apiResponse");

async function getAllMenuItems() {
	try {
		const menu_items = await db.menuItem.findMany({
			where: { is_available: true },
			orderBy: { category: "asc" },
		});

		const menu_items_count = menu_items.length;

		return apiResponse(1, 200, "Menu items fetched successfully", { data: menu_items, count: menu_items_count });
	} 
	
	catch (err) {
		throw err;
	}
}

module.exports = { getAllMenuItems };
