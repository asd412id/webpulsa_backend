const { Op } = require("sequelize");
const { getPage, paginate } = require("../../helpers/Pagination");
const { statusData, statusMessage } = require("../../helpers/Status");
const PulsaCategoryModel = require("../models/PulsaCategoryModel");
const PulsaModel = require("../models/PulsaModel");

class PulsaCategoryRepository {
  async all(page = 0, size = 20, search = '') {
    const { limit, offset } = getPage(page, size);
    try {
      const data = await PulsaCategoryModel.findAndCountAll({
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
            model: PulsaModel
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
        const { name } = data;
        if (!name) {
          return reject(statusMessage('Nama kategori tidak boleh kosong', 406));
        }

        try {
          const insert = await PulsaCategoryModel.create({ name });
          return resolve(statusData(insert.dataValues, 201));
        } catch (error) {
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
        const { name } = data;
        if (!name) {
          return reject(statusMessage('Nama kategori tidak boleh kosong', 406));
        }

        try {
          const insert = await PulsaCategoryModel.findByPk(id);
          if (!insert) {
            return reject(statusMessage('Data tidak ditemukan', 404));
          }
          await insert.update({ name });
          return resolve(statusData(insert.dataValues));
        } catch (error) {
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
        const data = await PulsaCategoryModel.findByPk(id);
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

module.exports = new PulsaCategoryRepository;