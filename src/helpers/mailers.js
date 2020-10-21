const nodemailer = require('nodemailer')
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'rafirizkimaulana@gmail.com',
        pass: 'cfwpwbkxhxzwgllj'
    },
    tls:{
        rejectUnauthorized: false
    }
})

module.exports = transporter