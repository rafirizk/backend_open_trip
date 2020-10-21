const mysql = require('mysql')

// db local
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'open_trip',
    port: 3306
})

// db deployed
// const db = mysql.createConnection({
//     host: 'db4free.net',
//     user: 'rafirizk',
//     password: 'kura1234',
//     database: 'rafi17',
//     port: 3306
// })

db.connect(err =>{
    if (err) {
        console.log(err)
    }else {
        console.log('MySQL Connected')
    }
})

module.exports = db