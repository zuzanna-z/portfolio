const config = require('config');
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
    const token = req.header('x-authToken');
    if (!token) throw {statusCode: 401, errorMessage: `Access denied, no token provided.`, errorObj: {} };

    const decryptedtoken = jwt.verify(token, config.get('jwt_key'));

    req.account = decryptedtoken;

    next();

    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).send(JSON.stringify(err));
        return res.status(500).send(JSON.stringify(err));
    }
};