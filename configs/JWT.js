exports.secret = process.env.APP_SECRET || 'a$d412id#';
exports.lifeTime = process.env.APP_COOKIE_LIFETIME || 14 * 24 * 60 * 60 * 1000; //2 weeks 