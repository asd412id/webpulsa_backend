const { DataTypes } = require("sequelize");
const db = require("../../configs/Database");
const PulsaModel = require("./PulsaModel");

const PulsaCategoryModel = db.define('pulsa_categories', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

PulsaCategoryModel.hasMany(PulsaModel);
PulsaModel.belongsTo(PulsaCategoryModel);

module.exports = PulsaCategoryModel;