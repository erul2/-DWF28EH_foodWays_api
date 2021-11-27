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
        as: "userOrder",
        foreignKey: "idBuyer",
      });

      transactions.belongsTo(models.user, {
        as: "seller",
        foreignKey: "idSeller",
      });

      transactions.hasMany(models.orders, {
        as: "orders",
        foreignKey: "idTransaction",
      });
    }
  }
  transactions.init(
    {
      idBuyer: DataTypes.INTEGER,
      idSeller: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "transactions",
    }
  );
  return transactions;
};
