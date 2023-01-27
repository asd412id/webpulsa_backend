const { mustLogin } = require('../middlewares/AuthMiddleware');
const PostRepository = require('../repositories/PostRepository');

const router = require('express').Router();

router.get('/', async (req, res) => {
  const { page, size, search } = req.query;
  const data = await PostRepository.all(page, size, search);
  return res.status(data.code).json(data);
});

router.post('/', mustLogin, async (req, res) => {
  try {
    const insert = await PostRepository.store(req.body);
    return res.status(insert.code).json(insert);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.put('/:id', mustLogin, async (req, res) => {
  try {
    const update = await PostRepository.update(req.params.id, req.body);
    return res.status(update.code).json(update);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.delete('/:id', mustLogin, async (req, res) => {
  try {
    const destroy = await PostRepository.destroy(req.params.id);
    return res.status(destroy.code).json(destroy);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

module.exports = router;