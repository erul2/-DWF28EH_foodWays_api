const express = require("express");
// import dotenv and call config function to load environment
require("dotenv").config();

const router = express.Router();

// Controller
const { login } = require("../controllers/auth");

// Route
router.post("/login", login);

module.exports = router;
