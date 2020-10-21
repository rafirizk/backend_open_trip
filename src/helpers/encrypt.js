const Crypto = require('crypto')

module.exports = (password)=>{
    var keywords = 'rfkr'
    return Crypto.createHmac('sha256', keywords).update(password).digest('hex')

}