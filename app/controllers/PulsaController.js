const { mustLogin } = require('../middlewares/AuthMiddleware');
const PulsaRepository = require('../repositories/PulsaRepository');

const router = require('express').Router();

router.get('/', async (req, res) => {
  const { page, size, search } = req.query;
  const data = await PulsaRepository.all(page, size, search);
  return res.status(data.code).json(data);
});

router.post('/', mustLogin, async (req, res) => {
  try {
    const insert = await PulsaRepository.store(req.body);
    return res.status(insert.code).json(insert);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.put('/:id', mustLogin, async (req, res) => {
  try {
    const update = await PulsaRepository.update(req.params.id, req.body);
    return res.status(update.code).json(update);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.delete('/:id', mustLogin, async (req, res) => {
  try {
    const destroy = await PulsaRepository.destroy(req.params.id);
    return res.status(destroy.code).json(destroy);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

module.exports = router;