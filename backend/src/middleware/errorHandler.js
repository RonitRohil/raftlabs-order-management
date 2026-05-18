const apiResponse = require("../utils/apiResponse");

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ZodError") {
    const issues = err.issues || err.errors || [];
    const message = issues.map((e) => e.message).join(", ");
    return res.status(400).json(apiResponse(0, 400, message, null));
  }

  if (err.code === "P2025") {
    return res.status(404).json(apiResponse(0, 404, "Resource not found", null));
  }

  return res.status(500).json(apiResponse(0, 500, "Internal server error", null));
}

module.exports = errorHandler;
