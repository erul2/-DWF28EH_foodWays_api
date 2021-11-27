const express = require("express");
// import dotenv and call config function to load environment
require("dotenv").config();

const router = express.Router();

// Controller
const { login, register } = require("../controllers/auth");
const { getUsers, deleteUser } = require("../controllers/user");
const {
  getProducts,
  getProduct,
  getDetailProduct,
  addProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/product");

// Middlewares
const { auth } = require("../middlewares/auth");
const { uploadFile } = require("../middlewares/uploadFile");

// Route
router.post("/login", login); // Login -> send token
router.post("/register", register); // Register -> send token

router.get("/users", getUsers); // Get all users
router.delete("/user/:id", deleteUser); // delete a user

router.get("/products", getProducts); // get all products
router.get("/products/:userId", getProduct); // Get all products by partnerId
router.get("/product/:productId", getDetailProduct); // Get the detail product
router.post("/product", auth, uploadFile("image"), addProduct); // Add product, need auth (token)(partner)
router.put("/product/:productId", auth, editProduct); // Edit a product need auth (token) (partner)
router.delete("/product/:productId", auth, deleteProduct); // delte product

module.exports = router;
