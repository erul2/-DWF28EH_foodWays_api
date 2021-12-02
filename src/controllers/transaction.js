// import models
const { transactions, orders, products, user } = require("../../models");

// controller

// get transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactionsData = await transactions.findAll({
      where: { idSeller: req.params.userId },
      include: [
        {
          model: user,
          as: "buyer",
          attributes: ["id", "fullName", "email", "location"],
        },
        {
          model: products,
          through: {
            model: orders,
            attributes: ["qty"],
          },
          attributes: ["id", "title", "price", "image"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idBuyer", "idSeller"],
      },
    });

    const data = transactionsData.map((trx) => {
      return {
        id: trx.id,
        userOrder: trx.buyer,
        status: trx.status,
        order: trx.products.map((order) => {
          const { id, title, price, image } = order;
          return {
            id,
            title,
            price,
            image: process.env.UPLOADS + image,
            qty: order.orders.qty,
          };
        }),
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
    const transactionsData = await transactions.findOne({
      where: { id: req.params.transactionId },
      include: [
        {
          model: user,
          as: "buyer",
          attributes: ["id", "fullName", "email", "location"],
        },
        {
          model: products,
          through: {
            model: orders,
            attributes: ["qty"],
          },
          attributes: ["id", "title", "price", "image"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "idBuyer", "idSeller"],
      },
    });

    const data = {
      id: transactionsData.id,
      userOrder: transactionsData.buyer,
      status: transactionsData.status,
      order: transactionsData.products.map((order) => {
        const { id, title, price, image } = order;
        return {
          id,
          title,
          price,
          image: process.env.UPLOADS + image,
          qty: order.orders.qty,
        };
      }),
    };

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

// add transaction
exports.addTransaction = async (req, res) => {
  const newOrders = req.body.products;

  try {
    // get seller id from product that user buy
    const seller = await products.findOne({
      where: { id: 1 },
      attributes: ["idUser"],
    });

    // get buyer detail
    const userOrder = await user.findOne({
      where: { id: req.user.id },
      attributes: ["id", "fullName", "location", "email"],
    });

    const transaction = await transactions.create({
      idBuyer: req.user.id,
      idSeller: seller.idUser,
      status: "Waiting approve",
    });

    const dataNewOrders = await newOrders.map((order) => {
      return {
        qty: order.qty,
        idProduct: order.id,
        idTransaction: transaction.id,
      };
    });

    await orders.bulkCreate(dataNewOrders);

    const order = await orders.findAll({
      where: { idTransaction: transaction.id },
      include: [
        {
          model: products,
          attributes: ["id", "title", "price", "image"],
        },
      ],
      attributes: ["qty"],
    });

    const data = order.map((order) => {
      const { id, title, price, image } = order.product;
      return {
        id,
        title,
        price,
        image: process.env.UPLOADS + image,
        qty: order.qty,
      };
    });

    res.send({
      status: "success",
      data: {
        transaction: {
          id: transaction.id,
          userOrder: userOrder,
          status: transaction.status,
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
          as: "buyer",
          attributes: ["id", "fullName", "location", "email"],
        },
        {
          model: products,
          through: {
            model: orders,
            attributes: ["qty"],
          },
          attributes: ["id", "title", "price"],
        },
      ],
      attributes: ["id", "status"],
    });

    await transaction.update({ status: status });

    const order = transaction.products.map((order) => {
      return {
        id: order.id,
        title: order.title,
        price: order.price,
        image: process.env.UPLOADS + order.image,
        qty: order.orders.qty,
      };
    });

    res.send({
      status: "success",
      data: {
        transaction,
        transaction: {
          id: transaction.id,
          userOrder: transaction.buyer,
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
    const transactionData = await transactions.findAll({
      where: { idBuyer: req.user.id },
      include: [
        {
          model: products,
          through: {
            model: orders,
            attributes: ["qty"],
          },
          attributes: ["id", "title", "price", "image"],
        },
      ],
      attributes: ["id", "status"],
    });

    const data = transactionData.map((trx) => {
      return {
        id: trx.id,
        status: trx.status,
        order: trx.products.map((product) => {
          const { id, title, price, image } = product;
          return {
            id,
            title,
            price,
            image: process.env.UPLOADS + image,
            qty: product.orders.qty,
          };
        }),
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
