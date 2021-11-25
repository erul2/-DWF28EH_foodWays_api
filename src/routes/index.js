const express = require("express");
// import dotenv and call config function to load environment
require("dotenv").config();

const router = express.Router();

// Controller
const { login, register } = require("../controllers/auth");
const { getUsers, deleteUser } = require("../controllers/users");

// Route
router.post("/login", login);
router.post("/register", register);

router.get("/users", getUsers);
router.delete("/user/:id", deleteUser);

module.exports = router;
