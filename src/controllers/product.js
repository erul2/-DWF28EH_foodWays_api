const { products, user } = require("../../models");
const fs = require("fs");

// controller get all products
exports.getProducts = async (req, res) => {
  try {
    const dataProduct = await products.findAll({
      include: [
        {
          model: user,
          as: "user",
          attributes: ["id", "fullName", "email", "phone", "location"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });

    const data = await dataProduct.map((product) => {
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        image: process.env.UPLOADS + product.image,
        user: {
          id: product.user.id,
          fullName: product.user.fullName,
          email: product.user.email,
          phone: product.user.phone,
          location: product.user.location,
        },
      };
    });

    res.send({
      status: "success",
      data: {
        products: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// controller get all product by id partner
exports.getProduct = async (req, res) => {
  const id = req.params.userId;
  try {
    const dataProduct = await products.findAll({
      where: {
        idUser: id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });

    const data = await dataProduct.map((product) => {
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        image: process.env.UPLOADS + product.image,
      };
    });
    if (data.length === 0) {
      return res.status(404).send({
        status: "failed",
        message: "Product not found",
      });
    }

    res.send({
      status: "success",
      data: {
        products: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// controller get product details
exports.getDetailProduct = async (req, res) => {
  const id = req.params.productId;
  try {
    const data = await products.findOne({
      where: { id },
      include: [
        {
          model: user,
          as: "user",
          attributes: ["id", "fullName", "email", "phone", "location"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });

    if (data.length === 0) {
      return res
        .status(404)
        .send({ status: "failed", message: "Product not found" });
    }

    const { title, price, image } = data;
    const dataProduct = {
      id,
      title,
      price,
      image: process.env.UPLOADS + image,
      user: data.user,
    };

    res.send({
      status: "success",
      data: dataProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// controller add product
exports.addProduct = async (req, res) => {
  const { title, price } = req.body;
  let image = req.file ? req.file.filename : null;

  try {
    const newProduct = await products.create({
      title,
      price,
      image,
      idUser: req.user.id,
    });

    const userData = await user.findOne({
      where: { id: req.user.id },

      attributes: ["id", "fullName", "email", "phone", "location"],
    });

    res.send({
      status: "success",
      data: {
        product: {
          id: newProduct.id,
          title: newProduct.title,
          price: newProduct.price,
          image: process.env.UPLOADS + newProduct.image,
          user: userData,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// controller edit product
exports.editProduct = async function (req, res) {
  try {
    const dataProduct = await products.findOne({
      where: { id: req.params.productId },
    });

    // check user id (just owner can edit)
    if (req.user.id === dataProduct.userId) {
      return res.status(401).send({
        status: "failed",
        message: "You are not owner of this product!",
      });
    }

    let image = "";
    // chek image updated or not
    if (req.file) {
      image = req.file.filename;
      // if image updated preform delte old image
      fs.unlink(`uploads/${dataProduct.image}`, (err) => {
        err ? console.log(err) : null;
      });
    } else {
      image = dataProduct.image;
    }

    await dataProduct.update({
      ...req.body,
      image,
    });

    const dataUser = await user.findOne({
      where: { id: req.user.id },
      attributes: ["id", "fullName", "email", "phone", "location"],
    });

    res.send({
      data: {
        product: {
          id: dataProduct.id,
          title: dataProduct.title,
          price: dataProduct.price,
          image: process.env.UPLOADS + dataProduct.image,
          user: dataUser,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

// controller delete product
exports.deleteProduct = async (req, res) => {
  try {
    const productData = await products.findOne({
      where: { id: req.params.productId },
    });

    // chek product, if not exist send errors
    if (!productData) {
      return res.status(404).send({
        status: "failed",
        message: "Product not found",
      });
    }

    // chek user, if not owner send errors
    if (productData.idUser != req.user.id) {
      return res.status(403).send({
        status: "failed",
        message: "you don't have permission to delete the product",
      });
    }

    // preform delte image
    fs.unlink(`uploads/${productData.image}`, (err) => {
      err ? console.log(err) : null;
    });

    // preform delete product
    await productData.destroy();

    res.send({
      status: "success",
      data: {
        id: req.params.productId,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};
