const { Op } = require("sequelize");
const { getPage, paginate } = require("../../helpers/Pagination");
const { statusData, statusMessage } = require("../../helpers/Status");
const PostCategoryModel = require("../models/PostCategoryModel");
const PostModel = require("../models/PostModel");

class PostCategoryRepository {
  async all(page = 0, size = 20, search = '') {
    const { limit, offset } = getPage(page, size);
    try {
      const data = await PostCategoryModel.findAndCountAll({
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
            model: PostModel,
            as: 'posts',
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
        const { name } = data;
        if (!name) {
          return reject(statusMessage('Nama kategori tidak boleh kosong', 406));
        }

        try {
          const insert = await PostCategoryModel.create({ name });
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
          const insert = await PostCategoryModel.findByPk(id);
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
        const data = await PostCategoryModel.findByPk(id);
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

module.exports = new PostCategoryRepository;