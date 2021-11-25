const express = require("express");
// import dotenv and call config function to load environment
require("dotenv").config();

const router = express.Router();

// Controller
const { login, register } = require("../controllers/auth");

// Route
router.post("/login", login);
router.post("/register", register);

module.exports = router;
