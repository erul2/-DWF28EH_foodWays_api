const express = require("express");
const router = require("./src/routes");

const app = express();
app.use(express.json());
const port = 5000;

// Endpoint grouping and router
app.use("/api/v1/", router);

app.listen(port, () => console.log(`Listening on port ${port}!`));
