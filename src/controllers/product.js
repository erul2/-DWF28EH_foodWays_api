const { products, user, profile } = require("../../models");

exports.getProducts = async (req, res) => {
  try {
    const dataProduct = await products.findAll({
      include: [
        {
          model: user,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password", "gender"],
            include: {
              model: profile,
              as: "profile",
            },
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idUser"],
      },
    });

    res.send({
      status: "success",
      data: {
        products: dataProduct,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};
