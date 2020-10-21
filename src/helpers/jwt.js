const jwt = require('jsonwebtoken')

module.exports = {
    createJWToken(payload){
        return jwt.sign(payload, "rfkr", {expiresIn:'12h'})
    }
}