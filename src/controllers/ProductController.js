const {db} = require('../connections')
const {uploader} = require('../helpers/uploader')
const fs = require('fs')

module.exports = { 
    addProduct: (req, res) => {
        try {
            const path = '/foto'
            const upload = uploader(path, 'TES').fields([{name: 'image'}])
            
            upload(req,res, (err) => {
                console.log('test2')
                if(err){
                    return res.status(500).json({message: 'upload picture failed', error:err.message})
                }
                console.log('berhasil upload')
                const {image} = req.files;
                const imagePath = image ? path + '/' + image[0].filename : null
                const data = JSON.parse(req.body.data)
                let insertData = {
                    name: data.name,
                    capacity: data.capacity,
                    price: data.price,
                    banner: imagePath,
                    description: data.description,
                    start_date: data.start_date,
                    end_date: data.end_date0

                }
                db.query('INSERT INTO product SET ?', insertData, (err) =>{
                    if(err) {
                        if(imagePath){
                            fs.unlinkSync('./public'+imagePath)
                        }
                        return res.status(500).send(err)
                    }
                    return res.status(200).send('upload successful')
                })
            })
        } catch (error) {
            return res.status(501).send({message: error.message})
        }
    },
    getProduct: (req, res) => {
        let sql = 'SELECT * FROM product'
        db.query(sql, (err, productData) => {
            if (err) return res.status(200).send({message: err.message})
            return res.status(200).send(productData)
        })
    },
    addPhoto: (req, res) => {
        try {
            const path = '/foto'
            const upload = uploader(path, 'product_photo').fields([{name: 'image'}])
            
            upload(req,res, (err) => {
                console.log('test2')
                if(err){
                    return res.status(500).json({message: 'upload picture failed', error:err.message})
                }
                console.log('berhasil upload')
                const {image} = req.files;
                const dataMany = []
                const data = JSON.parse(req.body.data)
                let imagePath
                image.forEach(val => {
                    imagePath = path + '/' + val.filename
                    dataMany.push([imagePath, data.product_id])
                })
                // const imagePath = image ? path + '/' + image[0].filename : null
                
                db.query('INSERT INTO product_photo (photo, product_id) VALUES ?', [datamany], (err) =>{
                    if(err) {
                        image.forEach(val => {
                            if (imagePath) {
                                imagePath = path + '/' + val.filename
                                fs.unlinkSync('./public'+ imagePath)
                            }
                        })
                        return res.status(500).send({message: err.message})
                    }
                    return res.status(200).send('upload successful')
                })
            })
        } catch (error) {
            return res.status(501).send({message: error.message})
        }
    },
    getProductDetails: (req, res) => {
        const {id} = req.params
        let sql = 'SELECT * FROM product WHERE id = ?'
        db.query(sql, id, (err, productData) => {
            if (err) return res.status(200).send({message: err.message})
            sql = 'SELECT * FROM product_photo WHERE product_id = ?'
            db.query(sql, id, (err, productPhoto) => {
                if (err) return res.status(200).send({message: err.message})
                return res.status(200).send({productData: productData[0], productPhoto})
            })
        })
    }
}