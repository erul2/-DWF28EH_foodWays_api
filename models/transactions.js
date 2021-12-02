"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transactions.belongsTo(models.user, {
        as: "buyer",
        foreignKey: "idBuyer",
      });

      transactions.belongsTo(models.user, {
        as: "seller",
        foreignKey: "idSeller",
      });

      transactions.belongsToMany(models.products, {
        through: "orders",
        foreignKey: "idTransaction",
      });
    }
  }
  transactions.init(
    {
      idBuyer: DataTypes.INTEGER,
      idSeller: DataTypes.INTEGER,
      status: DataTypes.ENUM([
        "Waiting approve",
        "On the way",
        "Order success",
      ]),
    },
    {
      sequelize,
      modelName: "transactions",
    }
  );
  return transactions;
};
