const UserRepository = require("../repositories/UserRepository");

class AuthMiddleware {
  async mustLogin(req, res, next) {
    const token = req.cookies?.token || req.header('Authorization');
    try {
      const check = await UserRepository.checkToken(token);
      req.user = check.data;
      next();
    } catch (error) {
      if (req.cookies.token) {
        res.cookie('token', 'null', { maxAge: -1 });
      }
      return res.status(error.code).json(error);
    }
  }
}

module.exports = new AuthMiddleware;