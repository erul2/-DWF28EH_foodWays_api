const express = require("express");
const router = require("./src/routes");
const path = require("path");

const app = express();
app.use(express.json());
// app.use(express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const port = 5000;

// Endpoint grouping and router
app.use("/api/v1/", router);

app.listen(port, () => console.log(`Listening on port ${port}!`));
