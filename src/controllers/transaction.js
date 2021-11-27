// import models
const {
  transactions,
  orders,
  products,
  user,
  profile,
} = require("../../models");

// controller

// get transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactionsData = await transactions.findAll({
      where: { idSeller: req.params.userId },
      include: [
        {
          model: user,
          as: "userOrder",
          include: [
            {
              model: profile,
              as: "profile",
              attributes: ["location"],
            },
          ],
          attributes: ["id", "fullName", "email"],
        },
        {
          model: orders,
          as: "orders",
          include: [
            {
              model: products,
              attributes: ["title", "price", "image"],
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "idTransaction", "idProduct"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idBuyer", "idSeller"],
      },
    });

    const data = await transactionsData.map((tr) => {
      let orders = tr.orders.map((order) => {
        return {
          id: order.id,
          title: order.product.title,
          price: order.product.price,
          image: order.product.image,
          qty: order.qty,
        };
      });
      return {
        id: tr.id,
        userOrder: {
          id: tr.userOrder.id,
          fullName: tr.userOrder.fullName,
          location: tr.userOrder.profile.location,
          email: tr.userOrder.image,
        },
        status: tr.status,
        order: orders,
      };
    });

    res.send({
      status: "success",
      data: {
        transactions: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// get detail transaction
exports.getDetailTransaction = async (req, res) => {
  try {
    const transactionData = await transactions.findOne({
      where: { id: req.params.transactionId },
      include: [
        {
          model: user,
          as: "userOrder",
          include: [
            {
              model: profile,
              as: "profile",
              attributes: ["location"],
            },
          ],
          attributes: ["id", "fullName", "email"],
        },
        {
          model: orders,
          as: "orders",
          include: [
            {
              model: products,
              attributes: ["title", "price", "image"],
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "idTransaction", "idProduct"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idBuyer", "idSeller"],
      },
    });

    const data = () => {
      let orders = transactionData.orders.map((order) => {
        return {
          id: order.id,
          title: order.product.title,
          price: order.product.price,
          image: order.product.image,
          qty: order.qty,
        };
      });

      return {
        id: transactionData.id,
        userOrder: {
          id: transactionData.userOrder.id,
          fullName: transactionData.userOrder.fullName,
          location: transactionData.userOrder.profile.location,
          email: transactionData.userOrder.email,
        },
        status: transactionData.status,
        order: orders,
      };
    };

    res.send({
      status: "success",
      data: {
        transaction: data(),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// add transaction
exports.addTransaction = async (req, res) => {
  const newProducts = req.body.products;

  try {
    const seller = await products.findOne({
      where: { id: 1 },
      attributes: ["idUser"],
    });

    const userOrder = await user.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: profile,
          as: "profile",
          attributes: ["location"],
        },
      ],
      attributes: ["id", "fullName", "email"],
    });

    const userData = {
      id: userOrder.id,
      fullName: userOrder.fullName,
      location: userOrder.profile.location,
      email: userOrder.email,
    };

    const transaction = await transactions.create({
      idBuyer: req.user.id,
      idSeller: seller.idUser,
      status: "On the way",
    });

    const dataNewProduct = await newProducts.map((product) => {
      return {
        qty: product.qty,
        idProduct: product.id,
        idTransaction: transaction.id,
      };
    });

    const order = await orders.bulkCreate(dataNewProduct).then(() => {
      const orderData = orders.findAll({
        where: { idTransaction: transaction.id },
        include: [
          {
            model: products,
            attributes: ["title", "price", "image"],
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt", "idTransaction", "idProduct"],
        },
      });
      return orderData;
    });

    const data = await order.map((o) => {
      return {
        id: o.id,
        title: o.product.title,
        price: o.product.price,
        image: o.product.image,
        qty: o.qty,
      };
    });

    res.send({
      status: "success",
      data: {
        transaction: {
          id: transaction.id,
          userOrder: userData,
          status: "on the way",
          order: data,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// edit transaction
exports.editTransaction = async (req, res) => {
  try {
    const status = req.body.status;

    const transaction = await transactions.findOne({
      where: { id: req.params.transactionId },
      include: [
        {
          model: user,
          as: "userOrder",
          include: [
            {
              model: profile,
              as: "profile",
              attributes: ["location"],
            },
          ],
          attributes: ["id", "fullName", "email"],
        },
        {
          model: orders,
          as: "orders",
          include: [
            {
              model: products,
              as: "product",
              attributes: ["title", "price", "image"],
            },
          ],
          attributes: ["id", "qty"],
        },
      ],
      attributes: ["id", "status"],
    });

    await transaction.update({ status: status });

    const userOrder = {
      id: transaction.userOrder.id,
      fullName: transaction.userOrder.fullName,
      location: transaction.userOrder.profile.location,
      email: transaction.userOrder.email,
    };

    const order = transaction.orders.map((o) => {
      return {
        id: o.id,
        title: o.product.title,
        price: o.product.price,
        image: o.product.image,
        qty: o.qty,
      };
    });

    res.send({
      status: "success",
      data: {
        transaction: {
          id: transaction.id,
          userOrder,
          status: transaction.status,
          order,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transactionData = await transactions.findOne({
      where: { id: req.params.transactionId },
    });

    if (!transactionData) {
      return res.status(404).send({
        status: "failed",
        message: "Product not found",
      });
    }

    transactionData.destroy();

    res.send({
      status: "success",
      data: {
        id: req.params.transactionId,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};

// get user getTransactions
exports.getUserTransactions = async (req, res) => {
  try {
    const transactionsData = await transactions.findAll({
      where: { idBuyer: req.userId },
      include: [
        {
          model: user,
          as: "userOrder",
          include: [
            {
              model: profile,
              as: "profile",
              attributes: ["location"],
            },
          ],
          attributes: ["id", "fullName", "email"],
        },
        {
          model: orders,
          as: "orders",
          include: [
            {
              model: products,
              attributes: ["title", "price", "image"],
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "idTransaction", "idProduct"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idBuyer", "idSeller"],
      },
    });

    const data = await transactionsData.map((tr) => {
      let orders = tr.orders.map((order) => {
        return {
          id: order.id,
          title: order.product.title,
          price: order.product.price,
          image: order.product.image,
          qty: order.qty,
        };
      });
      return {
        id: tr.id,
        userOrder: {
          id: tr.userOrder.id,
          fullName: tr.userOrder.fullName,
          location: tr.userOrder.profile.location,
          email: tr.userOrder.image,
        },
        status: tr.status,
        order: orders,
      };
    });

    res.send({
      status: "success",
      data: {
        transactions: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: "Server Error" });
  }
};
