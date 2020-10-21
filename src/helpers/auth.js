const jwt = require ('jsonwebtoken');

module.exports = {
    auth : (req, res, next) => {
        if (req.method !== "OPTIONS") {
            jwt.verify(req.token, "rfkr", (error, decoded) => {
                if (error) {
                    return res.status(401).json({message: 'User is not Authorized', error: 'User is not Authorized'})
                }else {
                    req.user = decoded;
                    next();
                }
            })
        }else {
            next();
        }
    }
}