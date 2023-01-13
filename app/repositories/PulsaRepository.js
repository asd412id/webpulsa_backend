const { Op } = require("sequelize");
const { getPage, paginate } = require("../../helpers/Pagination");
const { statusData, statusMessage } = require("../../helpers/Status");
const PulsaModel = require("../models/PulsaModel");
const OperatorModel = require("../models/OperatorModel");
const db = require("../../configs/Database");

class PulsaRepository {
  async all(page = 0, size = 20, search = '') {
    const { limit, offset } = getPage(page, size);
    try {
      const data = await PulsaModel.findAndCountAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.substring]: search
              }
            }
          ]
        },
        include: [
          {
            model: OperatorModel,
            as: 'operator',
            through: {
              attributes: []
            }
          }
        ],
        order: [
          ['name', 'asc']
        ],
        group: ['id'],
        limit: limit,
        offset: offset,
        distinct: true
      });
      return statusData(paginate(data, page, size));
    } catch (error) {
      return statusMessage(error.message, 500);
    }
  }

  store(data) {
    return new Promise((resolve, reject) => {
      const store = async (data) => {
        const { name, price, operators } = data;
        if (!name || !price) {
          return reject(statusMessage('Nama dan harga pulsa tidak boleh kosong', 406));
        }

        const tr = await db.transaction();
        try {
          const insert = await PulsaModel.create({ name, price });
          const ops = [...(await OperatorModel.findAll({
            where: {
              id: {
                [Op.in]: operators ?? []
              }
            },
            group: ['id'],
            distinct: true,
            raw: true
          })).map(e => e.id)];
          insert.addOperator(ops);
          tr.commit();
          return resolve(statusData(insert.dataValues, 201));
        } catch (error) {
          tr.rollback();
          return reject(statusMessage(error.message, 500));
        }
      }
      store(data);
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject(statusMessage('ID tidak boleh kosong', 406));
      }
      const store = async (data) => {
        const { name, price, operators } = data;
        if (!name || !price) {
          return reject(statusMessage('Nama dan harga pulsa tidak boleh kosong', 406));
        }

        const tr = await db.transaction();
        try {
          const insert = await PulsaModel.findByPk(id);
          if (!insert) {
            return reject(statusMessage('Data tidak ditemukan', 404));
          }
          await insert.update({ name, price });
          const ops = [...(await OperatorModel.findAll({
            where: {
              id: {
                [Op.in]: operators ?? []
              }
            },
            group: ['id'],
            distinct: true,
            raw: true
          })).map(e => e.id)];
          insert.setOperator(ops);
          tr.commit();
          return resolve(statusData(insert.dataValues));
        } catch (error) {
          tr.rollback()
          return reject(statusMessage(error.message, 500));
        }
      }
      store(data);
    });
  }

  destroy(id) {
    return new Promise(async (resolve, reject) => {
      if (!id) {
        return reject(statusMessage('ID tidak boleh kosong', 406));
      }

      try {
        const data = await PulsaModel.findByPk(id);
        if (!data) {
          return reject(statusMessage('Data tidak ditemukan', 404));
        }
        await data.destroy();
        return resolve(statusMessage('Data berhasil dihapus'));
      } catch (error) {
        return reject(statusMessage(error.message, 500));
      }
    });
  }
}

module.exports = new PulsaRepository;