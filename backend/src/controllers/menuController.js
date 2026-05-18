const menuModel = require("../models/menuModel");

async function getAllMenuItems(req, res, next) {
    try {
        const response = await menuModel.getAllMenuItems();
        res.status(response.status_code).json(response);
    } 
    
    catch (err) {
        next(err);
    }
}

module.exports = { getAllMenuItems };
