const router = require('express').Router();
const { lifeTime } = require("../../configs/JWT");
const { statusMessage } = require('../../helpers/Status');
const { mustLogin } = require('../middlewares/AuthMiddleware');
const UserRepository = require('../repositories/UserRepository');

router.post('/login', async (req, res) => {
  try {
    const check = await UserRepository.checkLogin(req.body);
    res.cookie('token', check.data.token, { maxAge: lifeTime });
    return res.status(check.code).json(check);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.get('/status', mustLogin, (req, res) => {
  return res.json(req.user);
});

router.post('/register', async (req, res) => {
  try {
    const insert = await UserRepository.store(req.body);
    return res.status(insert.code).json(insert);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.post('/account', mustLogin, async (req, res) => {
  try {
    const insert = await UserRepository.update(req.user.id, req.body);
    return res.status(insert.code).json(insert);
  } catch (error) {
    return res.status(error.code).json(error);
  }
});

router.post('/logout', mustLogin, (req, res) => {
  if (req.cookies.token) {
    res.cookie('token', 'null', { maxAge: -1 });
  }
  return res.json(statusMessage('Logout berhasil'));
});

module.exports = router;