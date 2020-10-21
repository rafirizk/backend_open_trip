const {db} = require('../connections')
const {Encrypt,Transporter} = require('../helpers')
const nodemailer = require('nodemailer')
const {createJWToken} = require('../helpers/jwt')
const fs = require('fs')
const handlebars = require('handlebars')

const DbPROMselect = (sql) => {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}

module.exports = {
    register: (req, res) => {
        const {username, email, password} = req.body
        let sql = 'SELECT * FROM users WHERE username = ?'
        db.query(sql, username, (err, users) => {
            if (err) res.status(500).send({message: 'error 1'})
            if (users.length) {
                return res.status(500).send({message: 'username is already taken'})
            }else {
                let hashPassword = Encrypt(password)
                let data =  {
                    username,
                    email,
                    password: hashPassword
                }
                sql = "INSERT INTO users SET ?"
                db.query(sql, data, (err, results) => {
                    if (err) return res.status(500).send({message: err.message})
                    console.log('user data is posted')
                    sql = "SELECT * FROM users WHERE id = ?"
                    db.query(sql, results.insertId, (err, userData) => {
                        if (err) return res.status(500).send({message: 'error 3'})
                        const token = createJWToken({id: userData[0].id, username: userData[0].username})
                        const link = `http://localhost:3000/verification?token=${token}`
                        const htmlrender = fs.readFileSync('./template/email.html','utf8')
                        const template = handlebars.compile(htmlrender)
                        const htmlEmail = template({name: userData[0].username, link:link})
                        Transporter.sendMail({
                            from: 'Open Trip',
                            to: email,
                            subject: 'User Verification',
                            html:htmlEmail
                        }).then(() =>{
                            userData[0].token = token
                            return res.send(userData[0])
                        }).catch((err) => {
                            return res.status(500).send(err)
                        })
                    })
                })
            }
        })
    },
    login: (req, res) => {
        const {username, password} = req.body
        let hashPassword = Encrypt(password)
        let sql = 'SELECT * FROM users where username = ? AND password = ?'
        db.query(sql, [username, hashPassword], (err, userData) => {
            if (err) return res.status(500).send({message: err.message})
            if (!userData.length) {
                return res.status(500).send({message: 'username atau password salah'})
            }
            sql = `SELECT transaction_details.qty, product.name, product.banner, product.price, product.id AS product_id, transaction.id AS transaction_id FROM transaction_details
            JOIN transaction
            ON transaction_details.transaction_id = transaction.id
            JOIN product
            ON transaction_details.product_id = product.id
            WHERE transaction.status = 'on_cart' AND transaction.users_id = ${db.escape(userData[0].id)} AND transaction_details.is_deleted = '0';`
            db.query(sql, (err, cart) => {
                if (err) return res.status(500).send({message: err.message})
                const token = createJWToken({id: userData[0].id, username: userData[0].id})
                userData[0].token = token
                return res.send({userData: userData[0], cart: cart})
            })
        })
    },
    keepLogin: async (req, res) =>{
        const {id} = req.params
        let sql =  `SELECT * FROM users WHERE id = ${db.escape(id)}`
        try {
            const result =  await DbPROMselect(sql)
            sql = `SELECT transaction_details.qty, product.name, product.banner, product.price, product.id AS product_id, transaction.id AS transaction_id FROM transaction_details
            JOIN transaction
            ON transaction_details.transaction_id = transaction.id
            JOIN product
            ON transaction_details.product_id = product.id
            WHERE transaction.status = 'onCart' AND transaction.users_id = ${db.escape(result[0].id)} AND transaction_details.is_deleted = '0';`
            const cart = await DbPROMselect(sql)
            const token = createJWToken({id: result[0].id, username: result[0].id})
            result[0].token = token
            return res.send({userData:result[0],cart:cart})
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
        // DbPROMselect(sql)
        // .then((result) => {
        //     res.send(result[0])
        // }).catch((err) => {
        //     return res.status(500).send({message: err.message})
        // })
    }
}