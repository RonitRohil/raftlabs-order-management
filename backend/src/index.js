const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const apiResponse = require("./utils/apiResponse");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes/routes");

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST", "PATCH"],
    })
);
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use((req, res) => {
    res.status(404).json(apiResponse(0, 404, `Route ${req.originalUrl} not found`, null));
});

app.use(errorHandler);

module.exports = app;
