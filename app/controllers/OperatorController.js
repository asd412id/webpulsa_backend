const { mustLogin } = require('../middlewares/AuthMiddleware');
const OperatorRepository = require('../repositories/OperatorRepository');

const router = require('express').Router();

router.get('/', async (req, res) => {
  const { page, size, search } = req.query;
  const data = await OperatorRepository.all(page, size, search);
  return res.status(data.code).json(data);
});

router.post('/', mustLogin, async (req, res) => {
  try {
    const insert = await OperatorRepository.store(req.body);
    return res.status(insert.code).json(insert);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.put('/:id', mustLogin, async (req, res) => {
  try {
    const update = await OperatorRepository.update(req.params.id, req.body);
    return res.status(update.code).json(update);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.delete('/:id', mustLogin, async (req, res) => {
  try {
    const destroy = await OperatorRepository.destroy(req.params.id);
    return res.status(destroy.code).json(destroy);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

module.exports = router;