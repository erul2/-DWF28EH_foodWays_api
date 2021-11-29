const { products, user, profile } = require("../../models");
const fs = require("fs");

// controller get all products
exports.getProducts = async (req, res) => {
  try {
    const dataProduct = await products.findAll({
      include: [
        {
          model: user,
          as: "user",
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt", "id", "image", "idUser"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "gender", "role"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });

<<<<<<< HEAD
    // check if product not exists
    // if (!dataProduct) {
    //   return res.status(404).send({
    //     status: "failed",
    //     message: "Products not found",
    //   });
    // }

=======
>>>>>>> 4.Product
    const data = await dataProduct.map((product) => {
      let location = null;
      product.user.profile.location
        ? (location = product.user.profile.location)
        : null;
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        user: {
          id: product.user.id,
          fullName: product.user.fullName,
          email: product.user.email,
          phone: product.user.phone,
          location,
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

// controller get a product by id partner
exports.getProduct = async (req, res) => {
  const id = req.params.userId;
  try {
    const data = await products.findAll({
      where: {
        idUser: id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
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
    const data = await products.findAll({
      where: { id: id },
      include: [
        {
          model: user,
          as: "user",
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt", "id", "image", "idUser"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "gender", "role"],
          },
        },
      ],
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "password",
          "gender",
          "role",
          "idUser",
        ],
      },
    });

    if (data.length === 0) {
      return res
        .status(404)
        .send({ status: "failed", message: "Product not found" });
    }

    const dataProduct = data.map((product) => {
      const { id, title, price, image, user } = product;
      return {
        id,
        title,
        price,
        image,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          location: user.profile.location,
        },
      };
    });

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

  // check user role, just partner can add product
  if (req.user.role != "partner") {
    return res.status(401).send({
      status: "failed",
      message: "You are not a partner",
    });
  }

  try {
    const newProduct = await products.create({
      title,
      price,
      image,
      idUser: req.user.id,
    });

    const userData = await user.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: profile,
          as: "profile",
          attributes: {
            exclude: ["createdAt", "updatedAt", "id", "image", "idUser"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "password", "gender", "role"],
      },
    });

    const userDataModified = () => {
      const { id, fullName, email, phone } = userData;
      const location =
        userData.profile != null ? userData.profile.location : null;
      return {
        id,
        fullName,
        email,
        phone,
        location,
      };
    };
    res.send({
      status: "success",
      data: {
        product: {
          id: newProduct.id,
          title: newProduct.title,
          price: newProduct.price,
          image: newProduct.image,
          user: userDataModified(),
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
  // check user role, just partner can edit
  if (req.user.role != "partner") {
    return res.status(401).send({
      status: "failed",
      message: "You are not a partner",
    });
  }

  try {
    const dataProduct = await products.findOne({
      where: { id: req.params.productId },
    });

    // check user id (just owner can edit)
    if (req.user.id === dataProduct.userId) {
      return res.status(401).send({
        status: "failed",
        message: "You are not owner",
      });
    }
    await dataProduct.update(req.body);
    const dataUser = await user.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: profile,
          as: "profile",
          attributes: {
            exclude: ["createdAt", "updatedAt", "id", "image", "idUser"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "password", "gender", "role"],
      },
    });

    res.send({
      data: {
        product: {
          id: dataProduct.id,
          title: dataProduct.title,
          price: dataProduct.price,
          image: dataProduct.image,
          user: {
            id: dataUser.id,
            fullName: dataUser.fullName,
            email: dataUser.email,
            phone: dataUser.phone,
            location: dataUser.profile.location,
          },
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
