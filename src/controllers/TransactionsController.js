const {db} = require('../connections')
const fs = require('fs')
const {uploader} = require('../helpers/uploader')
const {Transporter} = require('../helpers')

module.exports = {
    AddToCart: (req, res) => {
        const {users_id, product_id, qty} = req.body
        let sql = 'SELECT * FROM transaction WHERE status = "onCart" '
        db.query(sql, (err, result) => {
            if (err) return res.status(500).send({message: err.message}) 
            if (result.length){
                db.beginTransaction(err => {
                    if (err) return res.status(500).send({message: err.message})
                    sql = 'SELECT * FROM transaction_details WHERE product_id = ? AND transaction_id = ?'
                    db.query(sql, [product_id, result[0].id], (err, result1) => {
                        if (err) return res.status(500).send({message: err.message})
                        if (result1.length) { //kalo datanya udh ada di cart tinggal nambah quantity
                            let dataUpdate = {
                                qty: parseInt(result1[0].qty) + parseInt(qty)
                            }
                            sql = `UPDATE transaction_details SET ? WHERE product_id =${db.escape(result1[0].product_id)} and transaction_id = ${db.escape(result1[0].transaction_id)}`
                            db.query(sql, dataUpdate, (err) => {
                                if (err) return res.status(500).send({message: err.message})
                                sql = `SELECT transaction_details.qty, product.name, product.banner, product.price, product.id AS product_id, transaction.id AS transaction_id FROM transaction_details
                                JOIN transaction
                                ON transaction_details.transaction_id = transaction.id
                                JOIN product
                                ON transaction_details.product_id = product.id
                                WHERE transaction.status = 'onCart' AND transaction.users_id = ? AND transaction_details.is_deleted = '0';`
                                db.query(sql, users_id, (err, cart) => {
                                    if (err) return res.status(500).send({message: err.message})
                                    res.status(200).send(cart)
                                })
                            }) 
                        }else {
                            let dataInsert = {
                                product_id: product_id,
                                transaction_id: result[0].id,
                                qty: qty
                            }
                            sql = 'INSERT INTO transaction_details SET ?'
                            db.query(sql, dataInsert, (err) => {
                                if (err) {
                                    if (err) return res.status(500).send({message: err.message})
                                    sql = `SELECT transaction_details.qty, product.name, product.banner, product.price, product.id AS product_id, transaction.id AS transaction_id FROM transaction_details
                                    JOIN transaction
                                    ON transaction_details.transaction_id = transaction.id
                                    JOIN product
                                    ON transaction_details.product_id = product.id
                                    WHERE transaction.status = 'onCart' AND transaction.users_id = ? AND transaction_details.is_deleted = '0';`
                                    db.query(sql, users_id, (err, cart) => {
                                        if (err) return res.status(500).send({message: err.message})
                                        res.status(200).send(cart)
                                    })
                                }
                            })
                        }
                    })
                })
            }else {
                //cart bener kosong
                let data = {
                    date: new Date(),
                    status: "onCart",
                    users_id: users_id
                }
                db.beginTransaction(err => {
                    if (err) return res.status(500).send({message: err.message})
                    sql = 'INSERT INTO transaction SET ?'
                    db.query(sql, data, (err, result2) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).send({message: err.message})
                            })
                        }
                        data = {
                            product_id: product_id,
                            transaction_id: result2.insertId,
                            qty: qty
                        }
                        sql = 'INSERT INTO transaction_details SET ?'
                        db.query(sql, data, (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).send({message: err.message})
                                })
                            } 
                            db.commit(err => {
                                if(err) {
                                    return db.rollback(() => {
                                        res.status(500).send({message: err.message})
                                    })
                                }
                                sql = `SELECT transaction_details.qty, product.name, product.banner, product.price, product.id AS product_id, transaction.id AS transaction_id FROM transaction_details
                                JOIN transaction
                                ON transaction_details.transaction_id = transaction.id
                                JOIN product
                                ON transaction_details.product_id = product.id
                                WHERE transaction.status = 'onCart' AND transaction.users_id = ? AND transaction_details.is_deleted = '0';`
                                db.query(sql, users_id, (err, cart) => {
                                    if (err) return res.status(500).send({message: err.message})
                                    res.status(200).send(cart)
                                })
                            })
                        })
                    })
                })
            }
        })
    },
    getCart: (req,res) => {
        const {users_id} = req.query
        let sql = `SELECT transaction_details.qty, product.name, product.banner, product.price, product.id AS product_id, transaction.id AS transaction_id FROM transaction_details
        JOIN transaction
        ON transaction_details.transaction_id = transaction.id
        JOIN product
        ON transaction_details.product_id = product.id
        WHERE transaction.status = 'onCart' AND transaction.users_id = ${db.escape(users_id)} AND transaction_details.is_deleted = '0';`
        db.query(sql, (err, cart) => {
            if (err) return res.status(500).send({message: err.message})
            return res.send(cart)
        })
    },
    CCPayment: (req, res) => {
        const {transaction_id, ccNumber} = req.body
        let sql = `UPDATE transaction SET ? WHERE id = ${db.escape(transaction_id)}`
        let dataUpdate = {
            date: new Date(),
            status: 'paid',
            payment_method: 'CC',
            payment_receipt: ccNumber
        }
        db.query(sql, dataUpdate, (err, result) => {
            if (err) return res.status(500).send({message: err.message})
            return res.status(200).send('success')
        })
    },
    PaymentReceiptUpload: (req,res) => {
        // const {transaction_id} = req.body
        try {
            const path = '/payment_receipt'
            const upload = uploader(path, 'payment_receipt').fields([{name: 'receipt'}])
            
            upload(req,res, (err) => {
                console.log('test2')
                if(err){
                    return res.status(500).json({message: 'upload picture failed', error:err.message})
                }
                // console.log('berhasil upload')
                const {receipt} = req.files;
                const imagePath = receipt ? path + '/' + receipt[0].filename : null
                const data = JSON.parse(req.body.data)
                let updateData = {
                    date: new Date(),
                    status: 'Waiting Confirmation',
                    payment_method: 'Bank Transfer',
                    payment_receipt: imagePath

                }
                let sql = `UPDATE transaction SET ? WHERE id = ${db.escape(data.transaction_id)}`
                db.query(sql, updateData, (err) =>{
                    if(err) {
                        if(imagePath){
                            fs.unlinkSync('./public' + imagePath)
                        }
                        return res.status(500).send(err)
                    }
                    return res.status(200).send('success')
                })
            })
        } catch (error) {
            return res.status(501).send({message: error.message})
        }
    },
    getAdminWaitingApproval: (req, res) => {
        let sql = 'SELECT * FROM transaction WHERE status= ?'
        db.query(sql, 'Waiting Confirmation', (err, waitingApproval) => {
            if (err) return res.status(500).send({message: error.message})
            return res.status(200).send(waitingApproval)
        } )
    },
    PaymentApproved: (req, res) => {
        const {id} = req.params
        let updateData = {
            status: 'paid'
        }
        let sql = 'UPDATE transaction SET ? WHERE id = ?'
        db.query(sql, [updateData, id], err => {
            if (err) return res.status(500).send({message: error.message})
            sql = 'SELECT * FROM transaction WHERE id = ?'
            db.query(sql, id, (err, result) => {
                if (err) return res.status(500).send({message: error.message})
                sql = 'SELECT * FROM users WHERE id = ?'
                db.query(sql, result[0].users_id ,(err, userData) => {
                    if (err) return res.status(500).send({message: error.message})
                    const htmlrender = fs.readFileSync('./template/payment_notification.html','utf8')
                    const template = handlebars.compile(htmlrender)
                    const htmlEmail = template({message: 'Payment Successful'})
                    Transporter.sendMail({
                        from: 'Open Trip',
                        to: userData[0].email,
                        subject: 'Payment Received',
                        html:htmlEmail
                    }, (err) => {
                        if (err) {
                            console.log(err)
                            return res.status(500).send({message:error.message})
                        }
                        this.getAdminWaitingApproval(req, res)
                    })
                })
            })
        })
    },
    PaymentRejected: (req, res) => {
        const {id} = req.params
        let updateData = {
            status: 'payment rejected'
        }
        let sql = 'UPDATE transaction SET ? WHERE id = ?'
        db.query(sql, [updateData, id], err => {
            if (err) return res.status(500).send({message: error.message})
            this.getAdminWaitingApproval(req, res)
        })
    }
}