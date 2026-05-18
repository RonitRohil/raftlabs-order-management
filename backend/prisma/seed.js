require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

const menu_items = [
    {
        name: "Margherita Pizza",
        description: "Classic tomato base with fresh mozzarella and basil leaves",
        price: 299,
        image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
        category: "Pizza",
        is_available: true,
    },
    {
        name: "Pepperoni Pizza",
        description: "Loaded with spicy pepperoni slices and melted mozzarella",
        price: 349,
        image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
        category: "Pizza",
        is_available: true,
    },
    {
        name: "Classic Cheeseburger",
        description: "Juicy beef patty with cheddar cheese, lettuce, tomato and pickles",
        price: 199,
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        category: "Burger",
        is_available: true,
    },
    {
        name: "Crispy Chicken Burger",
        description: "Golden fried chicken fillet with coleslaw and mayo sauce",
        price: 229,
        image_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
        category: "Burger",
        is_available: true,
    },
    {
        name: "Paneer Tikka",
        description: "Marinated cottage cheese cubes grilled in tandoor with spices",
        price: 249,
        image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
        category: "Starters",
        is_available: true,
    },
    {
        name: "Chicken Wings",
        description: "Crispy buffalo chicken wings tossed in tangy hot sauce",
        price: 279,
        image_url: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400",
        category: "Starters",
        is_available: true,
    },
    {
        name: "Creamy Pasta Alfredo",
        description: "Penne pasta in rich creamy white sauce with garlic and parmesan",
        price: 219,
        image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
        category: "Pasta",
        is_available: true,
    },
    {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with gooey molten center served with vanilla ice cream",
        price: 149,
        image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
        category: "Desserts",
        is_available: true,
    },
];

async function main() {
    await db.menuItem.deleteMany();
    const result = await db.menuItem.createMany({ data: menu_items });
    console.log(`Seeded ${result.count} menu items`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
