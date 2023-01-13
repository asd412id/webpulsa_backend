const { DataTypes } = require("sequelize");
const db = require("../../configs/Database");

const PulsaModel = db.define('pulsas', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(11, 0)
  },
  opt: {
    type: DataTypes.TEXT,
    set(value) {
      this.setDataValue('opt', JSON.stringify(value));
    },
    get() {
      return JSON.parse(this.getDataValue('opt'));
    }
  }
});

module.exports = PulsaModel;