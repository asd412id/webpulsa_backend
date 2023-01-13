const router = require('express').Router();
const UserController = require('../app/controllers/UserController');
const OperatorController = require('../app/controllers/OperatorController');
const PulsaController = require('../app/controllers/PulsaController');
const PostCategoryController = require('../app/controllers/PostCategoryController');
const PostController = require('../app/controllers/PostController');

router.use('/users', UserController);
router.use('/operators', OperatorController);
router.use('/pulsas', PulsaController);
router.use('/post-category', PostCategoryController);
router.use('/posts', PostController);

module.exports = router;